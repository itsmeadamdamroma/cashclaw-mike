// Ollama Cloud adapter — OpenAI-compatible API

import type {
    StreamChatParams,
    StreamChatResult,
    NormalizedToolCall,
    NormalizedToolResult,
} from "./types";

const OLLAMA_BASE_URL = "https://ollama.com/api";
const MAX_TOKENS = 8192;

function client(override?: string | null) {
    const apiKey = override?.trim() || process.env.OLLAMA_API_KEY || "";
    return { apiKey };
}

function toNativeMessages(
    messages: StreamChatParams["messages"],
    systemPrompt?: string,
) {
    const out: { role: string; content: string }[] = [];
    if (systemPrompt) {
        out.push({ role: "system", content: systemPrompt });
    }
    for (const m of messages) {
        out.push({ role: m.role, content: m.content });
    }
    return out;
}

export async function streamOllama(
    params: StreamChatParams,
): Promise<StreamChatResult> {
    const {
        model,
        systemPrompt,
        messages,
        callbacks = {},
    } = params;
    const { apiKey } = client(params.apiKeys?.ollama);

    const nativeMessages = toNativeMessages(messages, systemPrompt);
    let fullText = "";

    const resp = await fetch(`${OLLAMA_BASE_URL}/chat/completions`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
            model,
            messages: nativeMessages,
            stream: true,
            max_tokens: MAX_TOKENS,
        }),
    });

    if (!resp.ok) {
        const body = await resp.text();
        throw new Error(`Ollama Cloud error ${resp.status}: ${body}`);
    }

    const reader = resp.body?.getReader();
    if (!reader) throw new Error("No response body");

    const decoder = new TextDecoder();
    while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        for (const line of chunk.split("\n")) {
            const trimmed = line.trim();
            if (!trimmed || trimmed === "data: [DONE]") continue;
            if (!trimmed.startsWith("data: ")) continue;
            const jsonStr = trimmed.slice(6);
            try {
                const parsed = JSON.parse(jsonStr);
                const delta = parsed.choices?.[0]?.delta?.content || "";
                if (delta) {
                    fullText += delta;
                    callbacks.onContentDelta?.(delta);
                }
            } catch {
                // ignore parse errors on boundary chunks
            }
        }
    }

    return { fullText };
}

export async function completeOllamaText(params: {
    model: string;
    systemPrompt?: string;
    user: string;
    maxTokens?: number;
    apiKeys?: { ollama?: string | null };
}): Promise<string> {
    const { apiKey } = client(params.apiKeys?.ollama);

    const resp = await fetch(`${OLLAMA_BASE_URL}/chat/completions`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
            model: params.model,
            messages: [
                ...(params.systemPrompt
                    ? [{ role: "system", content: params.systemPrompt }]
                    : []),
                { role: "user", content: params.user },
            ],
            stream: false,
            max_tokens: params.maxTokens ?? 512,
        }),
    });

    if (!resp.ok) {
        const body = await resp.text();
        throw new Error(`Ollama Cloud error ${resp.status}: ${body}`);
    }

    const data = await resp.json();
    return data.choices?.[0]?.message?.content || "";
}
