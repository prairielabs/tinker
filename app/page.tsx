"use client";

import { useState } from "react";
import Terminal from "@/components/Terminal";
import InputRow from "@/components/InputRow";
import InjectionControls from "@/components/InjectionControls";
import GraphicsControls from "@/components/GraphicsControls";
import ModelSelect from "@/components/ModelSelect";
import SessionCacheSetup from "@/components/SessionCacheSetup";

type HistMsg = { role: "user" | "assistant"; content: string };

export default function Home() {
  const initialScreen = `> Tinker\n> Terminal online\n>\n> (output will appear here)`;

  const [output, setOutput] = useState(initialScreen);
  const [input, setInput] = useState("");
  const [model, setModel] = useState("gpt-4o-mini");
  const [history, setHistory] = useState<HistMsg[]>([]);
  const [injected, setInjected] = useState(false);

  // Graphics
  const [width, setWidth] = useState(720);
  const [height, setHeight] = useState(420);
  const [fontSize, setFontSize] = useState(14);
  const [lineHeight, setLineHeight] = useState(1.4);
  const [padding, setPadding] = useState(16);
  const [bg, setBg] = useState("#000000");
  const [fg, setFg] = useState("#e5e5e5");
  const [fontFamily, setFontFamily] = useState(
    "var(--font-geist-mono), monospace"
  );

  // Typing speed
  const [typingDelay, setTypingDelay] = useState(12);

  async function handleSend() {
    const userText = input;
    if (!userText.trim()) return;

    const cachedFiles =
      (window as any).__MODEL_CACHE__?.[model] ?? [];
    const injectedFiles =
      Array.isArray((window as any).__PROMPT_FILES__)
        ? (window as any).__PROMPT_FILES__
        : [];

    const systemFiles = Array.from(
      new Set([...cachedFiles, ...injectedFiles])
    );

    setOutput("");
    setInput("");

    const nextHistory: HistMsg[] = [
      ...history,
      { role: "user", content: userText },
    ];
    setHistory(nextHistory);

    const res = await fetch("/api/run", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt: userText,
        model,
        systemFiles,
        history: nextHistory,
      }),
    });

    if (!res.body) {
      setOutput("[No response stream]");
      return;
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();

    let sseBuffer = "";
    let queue: string[] = [];
    let assistantText = "";

    function tick() {
      if (queue.length === 0) return;
      const ch = queue.shift()!;
      assistantText += ch;
      setOutput((prev) => prev + ch);
      setTimeout(tick, typingDelay);
    }

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;

      sseBuffer += decoder.decode(value, { stream: true });
      const lines = sseBuffer.split("\n");
      sseBuffer = lines.pop() || "";

      for (const line of lines) {
        if (!line.startsWith("data:")) continue;

        const data = line.replace(/^data:\s*/, "");
        if (data === "[DONE]") {
          setHistory((prev) => [
            ...prev,
            { role: "assistant", content: assistantText },
          ]);
          return;
        }

        try {
          const parsed = JSON.parse(data);
          const delta = parsed?.choices?.[0]?.delta?.content;
          if (delta) {
            for (const ch of delta) queue.push(ch);
            if (queue.length === delta.length) tick();
          }
        } catch {}
      }
    }
  }

  function handleReset() {
    setOutput(initialScreen);
    setInput("");
    setInjected(false);
    (window as any).__PROMPT_FILES__ = [];
    setHistory([]);
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#0b0b0b",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "12px",
      }}
    >
      <SessionCacheSetup />

      <InjectionControls
        injected={injected}
        onInject={() => setInjected(true)}
      />

      <GraphicsControls
        width={width}
        height={height}
        fontSize={fontSize}
        lineHeight={lineHeight}
        padding={padding}
        bg={bg}
        fg={fg}
        typingDelay={typingDelay}
        fontFamily={fontFamily}
        setTypingDelay={setTypingDelay}
        setWidth={setWidth}
        setHeight={setHeight}
        setFontSize={setFontSize}
        setLineHeight={setLineHeight}
        setPadding={setPadding}
        setBg={setBg}
        setFg={setFg}
        setFontFamily={setFontFamily}
      />

      <ModelSelect model={model} setModel={setModel} />

      <Terminal
        output={output}
        width={width}
        height={height}
        fontSize={fontSize}
        lineHeight={lineHeight}
        padding={padding}
        bg={bg}
        fg={fg}
        fontFamily={fontFamily}
      />

      <InputRow
        input={input}
        setInput={setInput}
        onSend={handleSend}
        onReset={handleReset}
        fontFamily={fontFamily}
        fontSize={fontSize}
        lineHeight={lineHeight}
      />
    </main>
  );
}
