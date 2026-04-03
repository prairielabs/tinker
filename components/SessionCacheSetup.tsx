"use client";

import { useEffect, useMemo, useState } from "react";
import { MODELS, ModelDef } from "@/lib/models";

type CacheMap = Record<string, string[]>;

export default function SessionCacheSetup() {
  const [files, setFiles] = useState<string[]>([]);
  const [open, setOpen] = useState(false);

  // Provider-level cache: provider -> files
  const [providerCache, setProviderCache] = useState<Record<string, string[]>>(
    {}
  );

  // Model-level overrides: modelId -> files | null (null = inherit)
  const [modelOverrides, setModelOverrides] = useState<
    Record<string, string[] | null>
  >({});

  // Gemini provider no-cache flag
  const [geminiNoCache, setGeminiNoCache] = useState(true);

  // Track which providers are expanded for per-model overrides
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const grouped = useMemo(() => {
    const out: Record<string, ModelDef[]> = {};
    for (const m of MODELS) {
      out[m.provider] ??= [];
      out[m.provider].push(m);
    }
    return out;
  }, []);

  useEffect(() => {
    fetch("/api/prompts")
      .then((r) => r.json())
      .then((list) => setFiles(Array.isArray(list) ? list : []))
      .catch(() => setFiles([]));
  }, []);

  useEffect(() => {
    if ((window as any).__CACHE_LOCKED__) return;
    setOpen(true);
  }, []);

  function toggleProviderFile(provider: string, file: string) {
    setProviderCache((prev) => {
      const next = { ...prev };
      const set = new Set(next[provider] ?? []);
      set.has(file) ? set.delete(file) : set.add(file);
      next[provider] = Array.from(set);
      return next;
    });
  }

  function toggleModelFile(modelId: string, file: string) {
    setModelOverrides((prev) => {
      const current = prev[modelId];
      const set = new Set(current ?? []);
      set.has(file) ? set.delete(file) : set.add(file);
      return { ...prev, [modelId]: Array.from(set) };
    });
  }

  function confirm() {
    const finalCache: CacheMap = {};

    for (const m of MODELS) {
      // 1. Model override
      if (modelOverrides[m.id]) {
        finalCache[m.id] = modelOverrides[m.id]!;
        continue;
      }

      // 2. Provider default
      if (m.provider === "gemini" && geminiNoCache) {
        finalCache[m.id] = [];
        continue;
      }

      finalCache[m.id] = providerCache[m.provider] ?? [];
    }

    (window as any).__MODEL_CACHE__ = finalCache;
    (window as any).__CACHE_LOCKED__ = true;
    setOpen(false);
  }

  if (!open) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.75)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
      }}
    >
      <div
        style={{
          width: "860px",
          maxHeight: "85vh",
          background: "#0b0b0b",
          border: "1px solid #2a2a2a",
          fontFamily: "monospace",
          color: "#e5e5e5",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "12px",
            borderBottom: "1px solid #222",
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <div>
            <strong>Session Cache Setup</strong>
            <div style={{ fontSize: "12px", color: "#aaa" }}>
              Cache prompt files per provider (advanced per-model overrides optional)
            </div>
          </div>

          <button
            onClick={confirm}
            style={{
              background: "#222",
              border: "1px solid #333",
              color: "#e5e5e5",
              padding: "6px 12px",
              cursor: "pointer",
            }}
          >
            Start Session
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: "12px", overflowY: "auto", maxHeight: "75vh" }}>
          {Object.entries(grouped).map(([provider, models]) => (
            <div key={provider} style={{ marginBottom: "18px" }}>
              <div style={{ fontWeight: "bold", marginBottom: "6px" }}>
                {provider.toUpperCase()}
              </div>

              {provider === "gemini" && (
                <label style={{ fontSize: "12px", color: "#ddd" }}>
                  <input
                    type="checkbox"
                    checked={geminiNoCache}
                    onChange={(e) => setGeminiNoCache(e.target.checked)}
                    style={{ marginRight: "8px" }}
                  />
                  Do not cache (avoid hourly storage cost)
                </label>
              )}

              <div
                style={{
                  border: "1px solid #222",
                  padding: "8px",
                  marginTop: "6px",
                }}
              >
                {files.map((f) => (
                  <label
                    key={provider + f}
                    style={{ display: "block", fontSize: "12px" }}
                  >
                    <input
                      type="checkbox"
                      checked={providerCache[provider]?.includes(f) ?? false}
                      onChange={() => toggleProviderFile(provider, f)}
                      style={{ marginRight: "8px" }}
                    />
                    {f}
                  </label>
                ))}
              </div>

              {/* Per-model overrides */}
              <div
                onClick={() =>
                  setExpanded((p) => ({
                    ...p,
                    [provider]: !p[provider],
                  }))
                }
                style={{
                  marginTop: "6px",
                  fontSize: "12px",
                  color: "#aaa",
                  cursor: "pointer",
                }}
              >
                {expanded[provider] ? "▼" : "▶"} Override per model
              </div>

              {expanded[provider] &&
                models.map((m) => (
                  <div
                    key={m.id}
                    style={{
                      marginLeft: "14px",
                      marginTop: "6px",
                      borderLeft: "1px solid #222",
                      paddingLeft: "8px",
                    }}
                  >
                    <div style={{ fontSize: "12px", color: "#fff" }}>
                      {m.label}
                    </div>

                    {files.map((f) => (
                      <label
                        key={m.id + f}
                        style={{ display: "block", fontSize: "12px" }}
                      >
                        <input
                          type="checkbox"
                          checked={
                            modelOverrides[m.id]?.includes(f) ?? false
                          }
                          onChange={() => toggleModelFile(m.id, f)}
                          style={{ marginRight: "8px" }}
                        />
                        {f}
                      </label>
                    ))}
                  </div>
                ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
