import Anthropic from "@anthropic-ai/sdk";
import { resolveClaudeModel } from "@/lib/claudeModels";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

let warmed = false;

export async function warmClaude(modelId: string) {
  if (warmed) return;
  warmed = true;

  await anthropic.messages.create({
    model: resolveClaudeModel(modelId),
    max_tokens: 32,
    messages: [
      {
        role: "user",
        content: "ping",
      },
    ],
  });
}
