import fs from "fs";
import path from "path";

import { MODELS } from "@/lib/models";
import { ensureEngineCachedOnce } from "@/lib/engineAutoCache";
import { getCachePolicy } from "@/lib/cachePolicy";
import { streamClaude } from "@/lib/claudeStream";
import { warmClaude } from "@/lib/claudeWarmup";

export const runtime = "nodejs";

type HistMsg = { role: "user" | "assistant"; content: string };

const STREAM_HEADERS = {
  "Content-Type": "text/event-stream",
  "Cache-Control": "no-cache",
  Connection: "keep-alive",
};

/* ---------------------------------------------
   Helpers
--------------------------------------------- */

async function streamOpenAICompatible(opts: {
  baseUrl: string;
  apiKey: string;
  model: string;
  messages: any[];
}) {
  const res = await fetch(`${opts.baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${opts.apiKey}`,
    },
    body: JSON.stringify({
      model: opts.model,
      messages: opts.messages,
      stream: true,
    }),
  });

  if (!res.ok || !res.body) {
    throw new Error(await res.text());
  }

  return res.body;
}

async function streamGemini(opts: {
  model: string;
  system: string;
  messages: HistMsg[];
}) {
  const contents = [
    ...(opts.system
      ? [{ role: "user", parts: [{ text: opts.system }] }]
      : []),
    ...opts.messages.map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    })),
  ];

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${opts.model}:streamGenerateContent?key=${process.env.GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents }),
    }
  );

  if (!res.ok || !res.body) {
    throw new Error(await res.text());
  }

  const reader = res.body.getReader();
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  return new ReadableStream({
    async start(controller) {
      try {
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          for (const line of chunk.split("\n")) {
            try {
              const parsed = JSON.parse(line);
              const text =
                parsed.candidates?.[0]?.content?.parts?.[0]?.text;
              if (text) {
                controller.enqueue(
                  encoder.encode(
                    `data: ${JSON.stringify({
                      choices: [{ delta: { content: text } }],
                    })}\n\n`
                  )
                );
              }
            } catch {}
          }
        }
      } catch (err) {
        controller.error(err);
      } finally {
        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        controller.close();
      }
    },
  });
}

/* ---------------------------------------------
   Route
--------------------------------------------- */

export async function POST(req: Request) {
  try {
    const raw = await req.text();
    let body: any;

    try {
      body = JSON.parse(raw);
    } catch {
      return new Response(
        JSON.stringify({ error: "Invalid JSON body", raw }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const { prompt, model, systemFiles, history } = body;

    if (!prompt || !model) {
      return new Response(
        JSON.stringify({ error: "Missing prompt or model" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const modelDef = MODELS.find((m) => m.id === model);
    if (!modelDef) {
      return new Response(
        JSON.stringify({ error: "Unknown model", model }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    /* ------------------------------
       Cache preflight (unchanged)
    ------------------------------ */

    const { autoCache } = getCachePolicy(model);

    if (autoCache) {
      await ensureEngineCachedOnce(modelDef.provider, () => {});
    }

    /* ------------------------------
       Build system prompt
       (ONLY from systemFiles)
    ------------------------------ */

    let systemPrompt = "";

    if (Array.isArray(systemFiles) && systemFiles.length > 0) {
      systemPrompt = systemFiles
        .map((relPath: string) => {
          try {
            const fullPath = path.join(process.cwd(), "prompts", relPath);
            return fs.readFileSync(fullPath, "utf8");
          } catch {
            console.warn(`[PROMPTS] Missing file skipped: ${relPath}`);
            return "";
          }
        })
        .filter(Boolean)
        .join("\n\n");
    }

    const hist: HistMsg[] = Array.isArray(history)
      ? history.filter(
          (m: any) =>
            m &&
            (m.role === "user" || m.role === "assistant") &&
            typeof m.content === "string"
        )
      : [];

    /* ------------------------------
       Provider routing
    ------------------------------ */

    // Claude
    if (modelDef.provider === "anthropic") {
      await warmClaude(model);
      const stream = await streamClaude(
        model,
        systemPrompt,
        [...hist, { role: "user", content: String(prompt) }]
      );
      return new Response(stream, { headers: STREAM_HEADERS });
    }

    const messages = [
      ...(systemPrompt
        ? [{ role: "system", content: systemPrompt }]
        : []),
      ...hist,
      { role: "user", content: String(prompt) },
    ];

    // OpenAI
    if (modelDef.provider === "openai") {
      const bodyStream = await streamOpenAICompatible({
        baseUrl: "https://api.openai.com/v1",
        apiKey: process.env.OPENAI_API_KEY!,
        model,
        messages,
      });
      return new Response(bodyStream, { headers: STREAM_HEADERS });
    }

    // DeepSeek
    if (modelDef.provider === "deepseek") {
      const bodyStream = await streamOpenAICompatible({
        baseUrl: "https://api.deepseek.com/v1",
        apiKey: process.env.DEEPSEEK_API_KEY!,
        model,
        messages,
      });
      return new Response(bodyStream, { headers: STREAM_HEADERS });
    }

    // Grok
    if (modelDef.provider === "grok") {
      const bodyStream = await streamOpenAICompatible({
        baseUrl: "https://api.x.ai/v1",
        apiKey: process.env.XAI_API_KEY!,
        model,
        messages,
      });
      return new Response(bodyStream, { headers: STREAM_HEADERS });
    }

    // Gemini
    if (modelDef.provider === "gemini") {
      const stream = await streamGemini({
        model,
        system: systemPrompt,
        messages: [...hist, { role: "user", content: String(prompt) }],
      });
      return new Response(stream, { headers: STREAM_HEADERS });
    }

    return new Response(
      JSON.stringify({ error: "Unsupported provider" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  } catch (e: any) {
    console.error("[RUN fatal]", e);
    return new Response(
      JSON.stringify({
        error: "server error",
        message: e?.message ?? String(e),
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
