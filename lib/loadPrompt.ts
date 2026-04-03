import fs from "fs";
import path from "path";

export function loadPrompt(relPath: string): string {
  const base = path.join(process.cwd(), "prompts");
  const full = path.join(base, relPath);
  return fs.readFileSync(full, "utf8");
}
