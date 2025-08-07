"use client";

import { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import clsx from "clsx";

export default function Chat() {
  const [messages, setMessages] = useState<{ role: string; content: string }[]>(
    []
  );
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    chatRef.current?.scrollTo(0, chatRef.current.scrollHeight);
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    setError(false);
    e.preventDefault();
    if (!input.trim()) return;
    const userMsg = { role: "user", content: input };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    const response = await fetch("/api", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: [...newMessages] }),
    });

    if (!response.body) return;

    if (!response.ok) {
      setError(true);
      setLoading(false);
      return;
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder("utf-8");
    const aiMsg = { role: "assistant", content: "" };
    setMessages([...newMessages, aiMsg]);

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value);

      for (const line of chunk.trim().split("\n")) {
        if (!line.trim()) continue;
        try {
          const json = JSON.parse(line);
          const content = json.message?.content || "";
          aiMsg.content += content;
          setMessages([...newMessages, { ...aiMsg }]);
        } catch {
          // ignore malformed chunks
        }
      }
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-900 flex flex-col">
      <div className="max-w-3xl w-full mx-auto flex flex-col flex-1 p-4">
        <h1 className="flex items-center justify-between mb-4 text-black dark:text-white/70 w-full">
          <div className="flex items-center">
            <span className="font-bold text-2xl tracking-tighter">apollo</span>
            <div
              style={{
                borderWidth: "0.5px",
                borderColor: "rgba(0, 0, 0, 0.2)",
                boxShadow: "0 2px 6px rgba(0, 0, 0, 0.08)",
                backgroundClip: "padding-box",
              }}
              className="ml-3 px-2 py-0.5 text-xs font-mono rounded-full bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 border"
            >
              gemma 2:2B
            </div>
          </div>
          <div id="compute" className="text-[10px] font-mono opacity-60">
            Raspberry Pi 5 4GB Broadcom BCM2712 @ 2.4GHz
          </div>
        </h1>

        <div
          ref={chatRef}
          className="flex-1 overflow-y-auto space-y-3 pr-1 scroll-smooth p-4 rounded"
        >
          {messages.map((m, i) => (
            <div
              key={i}
              className={clsx(
                "flex",
                m.role === "user" ? "justify-end" : "justify-start"
              )}
            >
              <div
                className={clsx(
                  "max-w-xs md:max-w-md px-4 py-2 rounded-3xl text-sm shadow whitespace-pre-wrap break-words",
                  m.role === "user"
                    ? "bg-blue-500 text-white rounded-br-sm"
                    : "bg-gray-200 dark:bg-zinc-700 text-black dark:text-white rounded-bl-sm"
                )}
              >
                <ReactMarkdown
                  components={{
                    code(props: React.ComponentProps<'code'> & { inline?: boolean }) {
                      const { inline, children, ...rest } = props;
                      return inline ? (
                        <code
                          className="bg-gray-100 dark:bg-zinc-800 px-1 py-0.5 rounded text-red-500 font-mono text-xs"
                          {...rest}
                        >
                          {children}
                        </code>
                      ) : (
                        <pre className="overflow-x-auto max-w-full rounded bg-black text-white text-xs p-3">
                          <code className="font-mono" {...rest}>
                            {children}
                          </code>
                        </pre>
                      );
                    },
                  }}
                >
                  {m.content}
                </ReactMarkdown>
              </div>
            </div>
          ))}
          {loading && (
            <div className="text-xs font-mono italic text-gray-500 dark:text-gray-400 px-2">
              Streaming response…
            </div>
          )}
        </div>

        {error && (
          <div className="flex flex-col items-center gap-1 mt-2">
            <p className="text-xs text-red-600 dark:text-red-300 pl-1">
              Cannot serve query at the moment.
            </p>
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="mt-4 flex items-center gap-2 p-2"
        >
          <input
            style={{
              borderWidth: "0.5px",
              boxShadow: "0 2px 6px rgba(0, 0, 0, 0.08)",
              backgroundClip: "padding-box",
            }}
            className="flex-1 text-sm rounded-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-zinc-800 text-black dark:text-white px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask anything"
          />
          <button
            type="submit"
            style={{
              borderWidth: "0.5px",
              borderColor: "rgba(0, 0, 0, 0.2)",
              boxShadow: "0 2px 6px rgba(0, 0, 0, 0.08)",
              backgroundClip: "padding-box",
            }}
            className="w-9 h-9 p-2 rounded-full bg-blue-600 hover:bg-blue-700 transition-colors text-white flex items-center justify-center"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-5 h-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 19V5m0 0l-6 6m6-6l6 6"
              />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
}
