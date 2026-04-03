export type Provider =
  | "openai"
  | "anthropic"
  | "gemini"
  | "grok"
  | "deepseek";

export type ModelPricing = {
  input: number;              // $ / 1M tokens
  cachedInput: number | null; // $ / 1M tokens (null if not supported)
  output: number;             // $ / 1M tokens
  cacheStorageHourly?: number; // $ / 1M tokens / hour (Gemini only)
};

export type ModelDef = {
  id: string;          // API model id
  label: string;       // Human-readable
  provider: Provider;
  pricing: ModelPricing;
  notes: string;       // 1-line synthesis
};

export const MODELS: ModelDef[] = [
  // ======================
  // OpenAI
  // ======================
  {
    id: "gpt-4o",
    label: "GPT-4o",
    provider: "openai",
    pricing: { input: 2.5, cachedInput: 1.25, output: 10.0 },
    notes: "Flagship multimodal model; strong and fast",
  },
  {
    id: "gpt-4o-mini",
    label: "GPT-4o Mini",
    provider: "openai",
    pricing: { input: 0.15, cachedInput: 0.075, output: 0.6 },
    notes: "Best default dev model; cheap and capable",
  },
  {
    id: "gpt-4.1",
    label: "GPT-4.1",
    provider: "openai",
    pricing: { input: 2.0, cachedInput: 0.5, output: 8.0 },
    notes: "Large context; strong instruction following",
  },
  {
    id: "gpt-4.1-mini",
    label: "GPT-4.1 Mini",
    provider: "openai",
    pricing: { input: 0.4, cachedInput: 0.1, output: 1.6 },
    notes: "Fast and cheap; good for high-volume tasks",
  },

  // ======================
  // Anthropic (Claude)
  // ======================
  {
    id: "claude-haiku-4.5",
    label: "Claude Haiku 4.5",
    provider: "anthropic",
    pricing: { input: 0.8, cachedInput: 0.08, output: 4.0 },
    notes: "Fast and cache-friendly; best Claude default",
  },
  {
    id: "claude-sonnet-4.5",
    label: "Claude Sonnet 4.5",
    provider: "anthropic",
    pricing: { input: 3.0, cachedInput: 0.3, output: 15.0 },
    notes: "Strong reasoning; great for complex tasks",
  },
  {
    id: "claude-opus-4.5",
    label: "Claude Opus 4.5",
    provider: "anthropic",
    pricing: { input: 15.0, cachedInput: 1.5, output: 75.0 },
    notes: "Maximum intelligence; use sparingly",
  },
  {
    id: "claude-haiku-3",
    label: "Claude Haiku 3",
    provider: "anthropic",
    pricing: { input: 0.25, cachedInput: 0.03, output: 1.25 },
    notes: "Cheapest Claude; utility tasks only",
  },

  // ======================
  // Google Gemini
  // ======================
  {
    id: "gemini-2.5-pro",
    label: "Gemini 2.5 Pro",
    provider: "gemini",
    pricing: {
      input: 1.25,
      cachedInput: 0.125,
      output: 10.0,
      cacheStorageHourly: 4.5,
    },
    notes: "Most capable Gemini; 1M context window",
  },
  {
    id: "gemini-2.5-flash",
    label: "Gemini 2.5 Flash",
    provider: "gemini",
    pricing: {
      input: 0.15,
      cachedInput: 0.015,
      output: 0.6,
      cacheStorageHourly: 1.0,
    },
    notes: "Fast and cheap; good everyday Gemini model",
  },
  {
    id: "gemini-2.0-flash",
    label: "Gemini 2.0 Flash",
    provider: "gemini",
    pricing: { input: 0.1, cachedInput: null, output: 0.4 },
    notes: "Stable release; no caching support",
  },

  // ======================
  // xAI / Grok
  // ======================
  {
    id: "grok-3",
    label: "Grok 3",
    provider: "grok",
    pricing: { input: 3.0, cachedInput: 0.75, output: 15.0 },
    notes: "Most capable Grok model",
  },
  {
    id: "grok-3-mini",
    label: "Grok 3 Mini",
    provider: "grok",
    pricing: { input: 0.3, cachedInput: 0.075, output: 0.5 },
    notes: "Cheap and fast; good for experimentation",
  },

  // ======================
  // DeepSeek
  // ======================
  {
    id: "deepseek-chat",
    label: "DeepSeek Chat (V3)",
    provider: "deepseek",
    pricing: { input: 0.27, cachedInput: 0.027, output: 1.1 },
    notes: "Ultra-cheap; great sandbox and UI model",
  },
  {
    id: "deepseek-reasoner",
    label: "DeepSeek Reasoner (R1)",
    provider: "deepseek",
    pricing: { input: 0.55, cachedInput: 0.055, output: 2.19 },
    notes: "Chain-of-thought reasoning at low cost",
  },
];
