import Anthropic from "@anthropic-ai/sdk";
import { resolveClaudeModel } from "@/lib/claudeModels";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

type ClaudeMessage = {
  role: "user" | "assistant";
  content: string;
};

export async function streamClaude(
  model: string,
  system: string,
  messages: ClaudeMessage[]
): Promise<ReadableStream> {

    const stream = await anthropic.messages.stream({
    model: resolveClaudeModel(model),
    system,
    messages,
    max_tokens: 4096,
    });


  const encoder = new TextEncoder();

  return new ReadableStream({
    async start(controller) {
      try {
        for await (const event of stream) {
          // We only care about text deltas
          if (
            event.type === "content_block_delta" &&
            event.delta.type === "text_delta"
          ) {
            const text = event.delta.text;
            if (text) {
              controller.enqueue(
                encoder.encode(
                  `data: ${JSON.stringify({
                    choices: [{ delta: { content: text } }],
                  })}\n\n`
                )
              );
            }
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
