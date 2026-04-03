"use client";

type Props = {
  width: number;
  height: number;
  fontSize: number;
  lineHeight: number;
  padding: number;
  bg: string;
  fg: string;
  typingDelay: number;
  fontFamily: string;

  setTypingDelay: (v: number) => void;
  setWidth: (v: number) => void;
  setHeight: (v: number) => void;
  setFontSize: (v: number) => void;
  setLineHeight: (v: number) => void;
  setPadding: (v: number) => void;
  setBg: (v: string) => void;
  setFg: (v: string) => void;
  setFontFamily: (v: string) => void;
};

export default function GraphicsControls({
  width,
  height,
  fontSize,
  lineHeight,
  padding,
  bg,
  fg,
  typingDelay,
  fontFamily,
  setTypingDelay,
  setWidth,
  setHeight,
  setFontSize,
  setLineHeight,
  setPadding,
  setBg,
  setFg,
  setFontFamily,
}: Props) {
  return (
    <div
      style={{
        width: "720px",
        display: "flex",
        gap: "8px",
        flexWrap: "wrap",
        fontFamily: "monospace",
        color: "#aaa",
        fontSize: "12px",
      }}
    >
      <label>
        W{" "}
        <input
          type="number"
          value={width}
          onChange={(e) => setWidth(+e.target.value)}
        />
      </label>

      <label>
        H{" "}
        <input
          type="number"
          value={height}
          onChange={(e) => setHeight(+e.target.value)}
        />
      </label>

      <label>
        Font{" "}
        <input
          type="number"
          value={fontSize}
          onChange={(e) => setFontSize(+e.target.value)}
        />
      </label>

      <label>
        Line{" "}
        <input
          type="number"
          step="0.1"
          value={lineHeight}
          onChange={(e) => setLineHeight(+e.target.value)}
        />
      </label>

      <label>
        Pad{" "}
        <input
          type="number"
          value={padding}
          onChange={(e) => setPadding(+e.target.value)}
        />
      </label>

      <label>
        BG{" "}
        <input
          type="color"
          value={bg}
          onChange={(e) => setBg(e.target.value)}
        />
      </label>

      <label>
        FG{" "}
        <input
          type="color"
          value={fg}
          onChange={(e) => setFg(e.target.value)}
        />
      </label>

      <label>
        Speed{" "}
        <input
          type="number"
          min={1}
          max={200}
          value={typingDelay}
          onChange={(e) => setTypingDelay(+e.target.value)}
        />
      </label>

      <label>
        Font{" "}
        <select
          value={fontFamily}
          onChange={(e) => setFontFamily(e.target.value)}
        >
          <option value="var(--font-geist-mono), monospace">
            Geist Mono
          </option>
          <option value="JetBrains Mono, monospace">
            JetBrains Mono
          </option>
          <option value="monospace">
            System Mono
          </option>
        </select>
      </label>
    </div>
  );
}
