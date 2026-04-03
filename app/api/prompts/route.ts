import fs from "fs";
import path from "path";

export const runtime = "nodejs";

export async function GET() {
  const promptsDir = path.join(process.cwd(), "prompts");

  try {
    const files: string[] = [];

    function walk(dir: string, base: string) {
      for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const rel = base ? `${base}/${entry.name}` : entry.name;
        if (entry.isDirectory()) {
          walk(path.join(dir, entry.name), rel);
        } else if (entry.name.endsWith(".txt")) {
          files.push(rel);
        }
      }
    }

    walk(promptsDir, "");

    return Response.json(files);
  } catch {
    // prompts directory doesn't exist — return empty list
    return Response.json([]);
  }
}
