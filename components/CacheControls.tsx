"use client";

import { useEffect, useState } from "react";
import { MODELS } from "@/lib/models";

type CacheMap = Record<string, string[]>;

export default function CacheControls() {
  // 🔑 OPEN BY DEFAULT so it’s visible
  const [open, setOpen] = useState(true);
  const [files, setFiles] = useState<string[]>([]);
  const [cache, setCache] = useState<CacheMap>({});

  // Load prompt files
  useEffect(() => {
    fetch("/api/prompts")
      .then((r) => r.json())
      .then((list) => setFiles(list))
      .catch(() => setFiles([]));
  }, []);

  // Load existing cache config
  useEffect(() => {
    setCache((window as any).__MODEL_CACHE__ ?? {});
  }, []);

  function toggle(modelId: string, file: string) {
    setCache((prev) => {
      const next = { ...prev };
      const set = new Set(next[modelId] ?? []);
      set.has(file) ? set.delete(file) : set.add(file);
      next[modelId] = Array.from(set);
      return next;
    });
  }

  function save() {
    (window as any).__MODEL_CACHE__ = cache;
    setOpen(false);
  }

  return (
    <div
      style={{
        width: "720px",
        fontFamily: "monospace",
        border: "1px solid #3a3a3a",
        background: "#0e0e0e",
        boxShadow: "0 0 0 1px #111 inset",
      }}
    >
      {/* Header */}
      <div
        onClick={() => setOpen(!open)}
        style={{
          padding: "10px",
          cursor: "pointer",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          color: "#e5e5e5",
          background: "#151515",
          borderBottom: "1px solid #2a2a2a",
        }}
      >
        <span>Cache Configuration (model-scoped)</span>
        <span>{open ? "▲" : "▼"}</span>
      </div>

      {/* Body */}
      {open && (
        <div style={{ padding: "10px", maxHeight: "360px", overflowY: "auto" }}>
          {MODELS.map((m) => (
            <div key={m.id} style={{ marginBottom: "14px" }}>
              <div
                style={{
                  color: "#fff",
                  marginBottom: "4px",
                  fontSize: "13px",
                }}
              >
                {m.label}
              </div>

              {files.map((f) => (
                <label
                  key={m.id + f}
                  style={{
                    display: "block",
                    paddingLeft: "14px",
                    cursor: "pointer",
                    color: "#aaa",
                    fontSize: "12px",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={cache[m.id]?.includes(f) ?? false}
                    onChange={() => toggle(m.id, f)}
                    style={{ marginRight: "8px" }}
                  />
                  {f}
                </label>
              ))}
            </div>
          ))}

          <button
            onClick={save}
            style={{
              marginTop: "8px",
              background: "#222",
              border: "1px solid #333",
              color: "#e5e5e5",
              padding: "6px 12px",
              cursor: "pointer",
            }}
          >
            Save cache presets
          </button>
        </div>
      )}
    </div>
  );
}
