# Tinker

A minimal terminal UI for running prompts against multiple AI APIs side by side. Built with Next.js.

Supports: **Anthropic Claude, OpenAI, Google Gemini, xAI Grok, DeepSeek**

Created by [Prairie Labs](https://prairielabs.ai) — licensed under [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/).

---

## Setup

**1. Install dependencies**

```bash
npm install
```

**2. Add your API keys**

```bash
cp .env.example .env.local
```

Open `.env.local` and fill in keys for the providers you want to use. You only need keys for providers you plan to use.

**3. Run**

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## How it works

- **Model selector** — pick any supported model. Hover the ⓘ icon for pricing.
- **Session Cache Setup** — on load, choose which prompt files to cache per provider. Cached files are sent as system prompt at the start of every conversation.
- **Prompt Injection** — inject additional prompt files mid-conversation (note: less efficient than caching upfront).
- **Terminal** — the output window. Customize colors, font, size, and typing speed with the controls above it.

## Adding prompt files

Drop `.txt` files into the `prompts/` directory (subdirectories are fine). They'll appear automatically in the cache and injection pickers.

Example structure:
```
prompts/
  engine/
    myprompt.txt
  personas/
    assistant.txt
```

## Adding models

Models are defined in `lib/models.ts`. Each entry needs an `id` (the API's model string), `label`, `provider`, `pricing`, and a `notes` line. The API route in `app/api/run/route.ts` handles routing by provider — adding a new model from an existing provider requires only a new entry in `lib/models.ts`.

For Claude specifically, also update `lib/claudeModels.ts` to map the model id to its API string.

---

## Notes

- Prompt injection post-cache is supported but less efficient than setting up cache upfront.
- Gemini caching is disabled by default to avoid hourly storage charges. Enable per-model in Session Cache Setup if needed.
- API keys never leave your server — all requests are proxied through the Next.js API route.
