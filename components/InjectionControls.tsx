"use client";

import { useEffect, useState } from "react";

type Props = {
  injected: boolean;
  onInject: () => void;
};

export default function InjectionControls({ injected, onInject }: Props) {
  const [open, setOpen] = useState(false);
  const [files, setFiles] = useState<string[]>([]);
  const [selected, setSelected] = useState<string[]>([]);

  useEffect(() => {
    fetch("/api/prompts")
      .then((r) => r.json())
      .then((list) => setFiles(list))
      .catch(() => setFiles([]));
  }, []);

  function toggleFile(file: string) {
    setSelected((prev) =>
      prev.includes(file)
        ? prev.filter((f) => f !== file)
        : [...prev, file]
    );
  }

  return (
    <div
      style={{
        width: "720px",
        fontFamily: "monospace",
        border: "1px solid #2a2a2a",
        background: "#0b0b0b",
      }}
    >
      {/* Header */}
      <div
        onClick={() => setOpen(!open)}
        style={{
          padding: "8px",
          cursor: "pointer",
          display: "flex",
          justifyContent: "space-between",
          color: "#aaa",
        }}
      >
        <span>Prompt Injection</span>
        <span>{open ? "▲" : "▼"}</span>
      </div>

      {/* Body */}
      {open && (
        <div style={{ padding: "8px" }}>
          <div
            style={{
              maxHeight: "160px",
              overflowY: "auto",
              border: "1px solid #222",
              marginBottom: "8px",
            }}
          >
            {files.map((f) => (
              <label
                key={f}
                style={{
                  display: "block",
                  padding: "4px 8px",
                  cursor: "pointer",
                }}
              >
                <input
                  type="checkbox"
                  checked={selected.includes(f)}
                  onChange={() => toggleFile(f)}
                  style={{ marginRight: "8px" }}
                />
                {f}
              </label>
            ))}
          </div>

          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <button
              onClick={() => {
                (window as any).__PROMPT_FILES__ = selected;
                onInject();
                setOpen(false);
              }}
              style={{
                background: "#222",
                border: "1px solid #333",
                color: "#e5e5e5",
                padding: "4px 10px",
                cursor: "pointer",
              }}
            >
              Inject
            </button>

            {injected && <span style={{ color: "#6f6" }}>Injected ✓</span>}
          </div>
        </div>
      )}
    </div>
  );
}
