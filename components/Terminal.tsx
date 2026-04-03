"use client";

type Props = {
  output: string;
  width: number;
  height: number;
  fontSize: number;
  lineHeight: number;
  padding: number;
  bg: string;
  fg: string;
  fontFamily: string;
};

export default function Terminal({
  output,
  width,
  height,
  fontSize,
  lineHeight,
  padding,
  bg,
  fg,
  fontFamily,
}: Props) {
  return (
    <div
      style={{
        width: `${width}px`,
        height: `${height}px`,
        background: bg,
        border: "1px solid #2a2a2a",
        boxShadow: "0 0 0 1px #111 inset",
        padding: `${padding}px`,
        fontFamily,              // SINGLE SOURCE OF TRUTH
        fontSize: `${fontSize}px`,
        color: fg,
        overflow: "hidden",
        WebkitFontSmoothing: "antialiased",
        textRendering: "optimizeLegibility",
        display: "flex",
      }}
    >
      {/* Inner content layer prevents layout shift */}
      <div
        style={{
          whiteSpace: "pre-wrap",
          lineHeight,
          flex: 1,
        }}
      >
        {output}
        <span className="cursor">▌</span>
      </div>
    </div>
  );
}
