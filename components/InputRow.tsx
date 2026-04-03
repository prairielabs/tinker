"use client";

type Props = {
  input: string;
  setInput: (v: string) => void;
  onSend: () => void;
  onReset: () => void;
  fontFamily: string;
  fontSize: number;
  lineHeight: number;
};

export default function InputRow({
  input,
  setInput,
  onSend,
  onReset,
  fontFamily,
  fontSize,
  lineHeight,
}: Props) {
  return (
    <div
      style={{
        width: "720px",
        display: "flex",
        gap: "8px",
        fontFamily, // MATCH TERMINAL
        fontSize,
        lineHeight,
      }}
    >
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            onSend();
          }
        }}
        placeholder="Type your prompt… (Enter to send, Shift+Enter for newline)"
        rows={2}
        style={{
          flex: 1,
          resize: "none",
          background: "#111",
          border: "1px solid #2a2a2a",
          color: "#e5e5e5",
          font: "inherit", // IMPORTANT
          padding: "8px",
        }}
      />

      <button
        onClick={onSend}
        style={{
          background: "#222",
          border: "1px solid #2a2a2a",
          color: "#e5e5e5",
          font: "inherit",
          padding: "8px 12px",
          cursor: "pointer",
        }}
      >
        Send
      </button>

      <button
        onClick={onReset}
        style={{
          background: "#111",
          border: "1px solid #2a2a2a",
          color: "#999",
          font: "inherit",
          padding: "8px 12px",
          cursor: "pointer",
        }}
      >
        Reset
      </button>
    </div>
  );
}
