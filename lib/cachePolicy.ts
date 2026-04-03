// lib/cachePolicy.ts

import { MODELS } from "@/lib/models";

export function getCachePolicy(modelId: string) {
  const m = MODELS.find(x => x.id === modelId);
  if (!m) return { autoCache: false };

  // Gemini: avoid persistent cache by default
  if (m.provider === "gemini") {
    return { autoCache: false };
  }

  // Everyone else: safe to auto-cache
  return { autoCache: true };
}
