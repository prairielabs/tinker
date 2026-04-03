"use client";

import { useState } from "react";
import { MODELS, ModelDef } from "@/lib/models";

type Props = {
  model: string;
  setModel: (id: string) => void;
};

export default function ModelSelect({ model, setModel }: Props) {
  const [showInfo, setShowInfo] = useState(false);

  const selected = MODELS.find(m => m.id === model);

  // Group models by provider
  const grouped = MODELS.reduce<Record<string, ModelDef[]>>((acc, m) => {
    acc[m.provider] ??= [];
    acc[m.provider].push(m);
    return acc;
  }, {});

  return (
    <div style={{ position: "relative", width: "720px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <select
          value={model}
          onChange={(e) => setModel(e.target.value)}
          style={{
            flex: 1,
            background: "#111",
            color: "#e5e5e5",
            border: "1px solid #2a2a2a",
            padding: "6px",
            fontFamily: "monospace",
          }}
        >
          {Object.entries(grouped).map(([provider, models]) => (
            <optgroup key={provider} label={provider.toUpperCase()}>
              {models.map(m => (
                <option key={m.id} value={m.id}>
                  {m.label}
                </option>
              ))}
            </optgroup>
          ))}
        </select>

        <span
          onMouseEnter={() => setShowInfo(true)}
          onMouseLeave={() => setShowInfo(false)}
          style={{
            cursor: "help",
            color: "#aaa",
            fontFamily: "monospace",
            userSelect: "none",
          }}
        >
          ⓘ
        </span>
      </div>

      {/* Pricing hover */}
      {showInfo && selected && (
        <div
          style={{
            position: "absolute",
            top: "38px",
            right: 0,
            width: "360px",
            background: "#0b0b0b",
            border: "1px solid #2a2a2a",
            padding: "10px",
            fontFamily: "monospace",
            fontSize: "13px",
            color: "#e5e5e5",
            zIndex: 20,
          }}
        >
          <div style={{ marginBottom: "6px", fontWeight: "bold" }}>
            {selected.label}
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "auto 1fr",
              gap: "4px 8px",
            }}
          >
            <span>Input</span>
            <span>${selected.pricing.input} / 1M</span>

            <span>Cached</span>
            <span>
              {selected.pricing.cachedInput !== null
                ? `$${selected.pricing.cachedInput} / 1M`
                : "N/A"}
            </span>

            <span>Output</span>
            <span>${selected.pricing.output} / 1M</span>

            {selected.pricing.cacheStorageHourly && (
              <>
                <span>Storage</span>
                <span>${selected.pricing.cacheStorageHourly} / hr</span>
              </>
            )}
          </div>

          <div style={{ marginTop: "8px", color: "#aaa" }}>
            {selected.notes}
          </div>
        </div>
      )}
    </div>
  );
}
