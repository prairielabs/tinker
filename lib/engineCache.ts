import fs from "fs";
import path from "path";

const cache = new Map<string, string>();

export function getEngine(provider: string): string {
  if (cache.has(provider)) {
    return cache.get(provider)!;
  }

  const engineFile =
    provider === "anthropic"
      ? "prairie-mini.txt"
      : "prairie.txt";

  const enginePath = path.join(
    process.cwd(),
    "prompts",
    "engine",
    engineFile
  );

  const text = fs.readFileSync(enginePath, "utf8");
  cache.set(provider, text);

  console.log(`[ENGINE] Loaded ${engineFile} for ${provider}`);
  return text;
}
