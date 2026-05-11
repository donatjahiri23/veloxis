"use client";

import { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

const pageSuggestions: Record<string, { context: string; questions: string[] }> = {
  "/": {
    context: "Dashboard",
    questions: [
      "What do my KPI trends suggest I should focus on?",
      "Which channel is driving the most conversions today?",
      "How does today's event volume compare to our average?",
      "What's the relationship between pageviews and conversions?",
    ],
  },
  "/attribution": {
    context: "Attribution",
    questions: [
      "Which attribution model should I use for my business?",
      "Why does Data-Driven give different results than Last Touch?",
      "How do I explain attribution model differences to my team?",
      "Which channels are undervalued by last-touch attribution?",
    ],
  },
  "/identity": {
    context: "Identity Graph",
    questions: [
      "How does identity resolution work without PII?",
      "Why do multi-device users convert at a higher rate?",
      "What percentage of our users are cross-device?",
      "How can I improve our identity match rate?",
    ],
  },
  "/campaigns": {
    context: "Campaigns",
    questions: [
      "Which campaigns should I pause based on ROAS?",
      "How should I reallocate budget across campaigns?",
      "What's a good ROAS target for my industry?",
      "Why is my CPA increasing on specific campaigns?",
    ],
  },
  "/history": {
    context: "Performance History",
    questions: [
      "What performance trends should I watch at the ad group level?",
      "How do I identify underperforming ads quickly?",
      "Which device type has the best conversion rate?",
      "What day-of-week patterns do you see in my data?",
    ],
  },
  "/insights": {
    context: "Insights",
    questions: [
      "Where are the biggest drop-offs in my funnel?",
      "Which creative has the highest fatigue score?",
      "What daypart should I increase bids on?",
      "Which audience segment has the best ROAS?",
    ],
  },
  "/comparison": {
    context: "Period Comparison",
    questions: [
      "What caused the biggest changes this period vs last?",
      "Which channels improved or declined the most?",
      "Is my CPA trend sustainable at this rate?",
      "How should I interpret the ROAS change across channels?",
    ],
  },
  "/recommendations": {
    context: "Recommendations",
    questions: [
      "Which recommendation should I prioritize first?",
      "What's the total estimated impact if I apply all critical items?",
      "How confident should I be in these AI recommendations?",
      "What risks come with pausing underperforming campaigns?",
    ],
  },
  "/reports": {
    context: "Automated Reports",
    questions: [
      "What metrics should I include in an executive report?",
      "How often should I send performance reports?",
      "What's the best way to present ROAS to leadership?",
      "How do I set up budget pacing alerts effectively?",
    ],
  },
  "/events": {
    context: "Live Events",
    questions: [
      "What does the event stream tell me about real-time performance?",
      "How do I spot anomalies in the live event feed?",
      "What's a healthy events-per-second rate?",
      "How do view-through events affect attribution?",
    ],
  },
  "/assistant": {
    context: "AI Assistant",
    questions: [
      "Give me a full overview of my marketing performance",
      "What are the top 3 things I should optimize this week?",
      "Compare all my channels and rank them by efficiency",
      "What budget changes would maximize my revenue?",
    ],
  },
};

function formatMarkdown(text: string): string {
  let html = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  html = html
    .replace(/\*\*(.*?)\*\*/g, '<strong class="text-white">$1</strong>')
    .replace(/\n\n/g, '</p><p class="mt-2">')
    .replace(/\n- /g, '</p><p class="mt-1 pl-3">• ')
    .replace(/\n(\d+)\. /g, '</p><p class="mt-1 pl-3">$1. ')
    .replace(/\n/g, "<br/>");

  return html;
}

export function AiChat() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const pageInfo = pageSuggestions[pathname] || pageSuggestions["/"];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  const handleSend = async (text?: string) => {
    const question = text || input;
    if (!question.trim() || isLoading) return;

    setError(null);
    const userMsg: Message = {
      id: `msg_${Date.now()}`,
      role: "user",
      content: question,
    };

    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: updatedMessages.map((m) => ({ role: m.role, content: m.content })),
          pageContext: pageInfo.context,
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
        },
      ]);
    } catch {
      setError("Network error. Check your connection and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-4 right-4 lg:bottom-6 lg:right-6 z-[100] w-12 h-12 lg:w-14 lg:h-14 rounded-full shadow-lg shadow-accent/25 flex items-center justify-center transition-all duration-300 ${
          isOpen
            ? "bg-card-bg border border-card-border rotate-0"
            : "bg-accent hover:bg-accent/90 hover:scale-105"
        }`}
      >
        {isOpen ? (
          <svg className="w-5 h-5 text-muted-light" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
          </svg>
        )}
      </button>

      {/* Chat panel */}
      {isOpen && (
        <div className="fixed bottom-0 right-0 sm:bottom-20 sm:right-4 lg:bottom-24 lg:right-6 z-[100] w-full h-full sm:w-[380px] sm:h-[520px] lg:w-[420px] lg:h-[560px] bg-[#0d0e1a] border border-card-border sm:rounded-2xl shadow-2xl shadow-black/50 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="px-4 py-3 border-b border-card-border flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-white">Veloxis AI</h3>
              <p className="text-[10px] text-muted truncate">
                Viewing: {pageInfo.context} · Powered by Claude
              </p>
            </div>
            <button
              onClick={() => {
                setMessages([]);
                setError(null);
              }}
              className="text-xs text-muted hover:text-white transition-colors px-2 py-1"
              title="Clear chat"
            >
              Clear
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
            {messages.length === 0 && (
              <div>
                <div className="text-center mb-4 mt-2">
                  <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center mx-auto mb-2">
                    <svg className="w-5 h-5 text-accent-light" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                    </svg>
                  </div>
                  <p className="text-xs text-muted-light">
                    Ask me anything about your marketing data
                  </p>
                </div>
                <div className="space-y-1.5">
                  {pageInfo.questions.map((q) => (
                    <button
                      key={q}
                      onClick={() => handleSend(q)}
                      className="w-full text-left text-xs text-muted-light bg-white/[0.03] border border-card-border rounded-lg px-3 py-2 hover:border-accent/30 hover:text-white transition-all"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] ${msg.role === "user" ? "" : ""}`}>
                  {msg.role === "assistant" && (
                    <div className="flex items-center gap-1.5 mb-1">
                      <div className="w-5 h-5 rounded-md bg-accent flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                        </svg>
                      </div>
                      <span className="text-[10px] text-muted">Veloxis AI</span>
                    </div>
                  )}
                  <div
                    className={`rounded-xl px-3 py-2 text-xs leading-relaxed ${
                      msg.role === "user"
                        ? "bg-accent text-white"
                        : "bg-white/[0.03] border border-card-border text-muted-light"
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
                <div>
                  <div className="flex items-center gap-1.5 mb-1">
                    <div className="w-5 h-5 rounded-md bg-accent flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                      </svg>
                    </div>
                    <span className="text-[10px] text-muted">Veloxis AI</span>
                  </div>
                  <div className="bg-white/[0.03] border border-card-border rounded-xl px-3 py-2">
                    <div className="flex gap-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-muted animate-bounce" style={{ animationDelay: "0ms" }} />
                      <div className="w-1.5 h-1.5 rounded-full bg-muted animate-bounce" style={{ animationDelay: "150ms" }} />
                      <div className="w-1.5 h-1.5 rounded-full bg-muted animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="bg-danger/10 border border-danger/20 rounded-lg px-3 py-2 text-xs text-danger">
                {error}
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="px-3 py-3 border-t border-card-border">
            <div className="flex items-center gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="Ask about your marketing data..."
                className="flex-1 bg-white/[0.03] border border-card-border rounded-lg px-3 py-2 text-xs text-white placeholder-muted focus:outline-none focus:border-accent/50"
                disabled={isLoading}
              />
              <button
                onClick={() => handleSend()}
                disabled={!input.trim() || isLoading}
                className="bg-accent hover:bg-accent/80 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-lg p-2 transition-all"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
