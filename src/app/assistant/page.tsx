"use client";

import { useState, useRef, useEffect } from "react";
import { PageHeader } from "@/components/PageHeader";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

const suggestedQuestions = [
  "Give me a full overview of my marketing performance",
  "Which channel has the highest ROAS and why?",
  "Compare Google Ads vs Meta Ads performance",
  "What are the top 3 things I should optimize this week?",
  "Which campaigns should I pause based on performance?",
  "How does cross-device tracking affect my attribution?",
  "What budget changes would maximize my revenue?",
  "Break down revenue by attribution model",
];

function formatMarkdown(text: string): string {
  let html = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  html = html
    .replace(/\*\*(.*?)\*\*/g, '<strong class="text-text-primary">$1</strong>')
    .replace(/\n\n/g, '</p><p class="mt-3">')
    .replace(/\n- /g, '</p><p class="mt-1 pl-4">• ')
    .replace(/\n(\d+)\. /g, '</p><p class="mt-1 pl-4">$1. ')
    .replace(/\n/g, "<br/>");

  return html;
}

export default function AssistantPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [mounted, setMounted] = useState(false);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMessages([
      {
        id: "welcome",
        role: "assistant",
        content:
          "Hi! I'm your Veloxis AI assistant, powered by Claude. I can help you analyze campaign performance, understand attribution data, explore user journeys, and generate insights from your marketing data.\n\nTry asking me about your ROAS, conversion trends, or which campaigns to optimize. What would you like to know?",
        timestamp: Date.now(),
      },
    ]);
    setMounted(true);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!mounted)
    return (
      <div className="p-8">
        <div className="animate-pulse text-muted">Loading assistant...</div>
      </div>
    );

  const handleSend = async (text?: string) => {
    const question = text || input;
    if (!question.trim() || isLoading) return;

    setError(null);
    const userMsg: Message = {
      id: `msg_${Date.now()}`,
      role: "user",
      content: question,
      timestamp: Date.now(),
    };

    const updatedMessages = [...messages.filter((m) => m.id !== "welcome"), userMsg];
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: updatedMessages.map((m) => ({ role: m.role, content: m.content })),
          pageContext: "AI Assistant (full page)",
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to get response");
        setIsLoading(false);
        return;
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `msg_${Date.now() + 1}`,
          role: "assistant",
          content: data.content,
          timestamp: Date.now(),
        },
      ]);
    } catch {
      setError("Network error. Check your connection and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen flex flex-col">
      <div className="p-4 lg:p-8 pb-0">
        <PageHeader title="AI Assistant" subtitle="Ask anything about your campaigns — powered by Claude" />
      </div>

      <div className="flex-1 overflow-y-auto px-4 lg:px-8 pb-4">
        <div className="max-w-4xl mx-auto space-y-6">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[80%] ${msg.role === "user" ? "order-1" : ""}`}>
                <div className="flex items-center gap-2 mb-1.5">
                  {msg.role === "assistant" && (
                    <div className="w-6 h-6 rounded-lg bg-accent flex items-center justify-center flex-shrink-0">
                      <svg className="w-3.5 h-3.5 text-text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                      </svg>
                    </div>
                  )}
                  <span className="text-[10px] text-muted">
                    {msg.role === "assistant" ? "Veloxis AI" : "You"} ·{" "}
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <div
                  className={`rounded-xl px-4 py-3 text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-accent text-white"
                      : "bg-card-bg border border-card-border text-muted-light"
                  }`}
                >
                  {msg.role === "assistant" ? (
                    <p dangerouslySetInnerHTML={{ __html: formatMarkdown(msg.content) }} />
                  ) : (
                    <p>{msg.content}</p>
                  )}
                </div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-accent flex items-center justify-center">
                  <svg className="w-3.5 h-3.5 text-text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                  </svg>
                </div>
                <div className="bg-card-bg border border-card-border rounded-xl px-4 py-3">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 rounded-full bg-muted animate-bounce" style={{ animationDelay: "0ms" }} />
                    <div className="w-2 h-2 rounded-full bg-muted animate-bounce" style={{ animationDelay: "150ms" }} />
                    <div className="w-2 h-2 rounded-full bg-muted animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-danger/10 border border-danger/20 rounded-lg px-4 py-3 text-sm text-danger">
              {error}
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {messages.length <= 1 && mounted && (
        <div className="px-4 lg:px-8 pb-4">
          <div className="max-w-4xl mx-auto">
            <p className="text-xs text-muted mb-3">Suggested questions</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {suggestedQuestions.map((q) => (
                <button
                  key={q}
                  onClick={() => handleSend(q)}
                  className="text-left text-xs text-muted-light bg-card-bg border border-card-border rounded-lg px-3 py-2.5 hover:border-accent/30 hover:text-text-primary transition-all"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="p-4 lg:p-8 pt-4 border-t border-card-border">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Ask anything about your campaigns..."
              className="flex-1 bg-card-bg border border-card-border rounded-xl px-4 py-3 text-sm text-text-primary placeholder-muted focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20"
              disabled={isLoading}
            />
            <button
              onClick={() => handleSend()}
              disabled={!input.trim() || isLoading}
              className="bg-accent hover:bg-accent/80 disabled:opacity-40 disabled:cursor-not-allowed text-text-primary rounded-xl px-5 py-3 text-sm font-medium transition-all"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
