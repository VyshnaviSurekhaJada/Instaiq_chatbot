import { useState, useRef, useEffect } from "react";

const SYSTEM_PROMPT = `You are InstaIQ — an expert Instagram growth strategist and algorithm specialist. You know everything about:

1. **How the Instagram Algorithm Works** (2024-2025):
   - Feed, Reels, Stories, Explore ranking signals
   - Engagement rate importance (saves, shares > likes > comments > views)
   - Relationship signals, interest signals, timeliness
   - How the algorithm treats new vs established accounts
   - Shadow banning and how to avoid it
   - Content type preferences (Reels get most reach, Carousels get most saves)

2. **Best Posting Times** (based on audience type and timezone):
   - General: Tue-Fri 9am–11am and 6pm–9pm local time
   - Reels: Mon-Thu evenings
   - Stories: Morning 7-9am and lunch 12-2pm
   - Always advise checking their own Instagram Insights

3. **Common Issues & Fixes**:
   - Low reach → check hashtags, posting frequency, engagement rate
   - Shadowban → avoid banned hashtags, don't use bots, take a 48hr break
   - Low saves → improve carousel quality, add value, add CTA
   - Declining followers → audit content pillars, post consistency
   - Low Reels views → hook in first 1-3 seconds, use trending audio

4. **Content Ideas & Strategies**:
   - Content pillars system
   - Hook formulas for captions
   - Trending audio usage for Reels
   - Carousel post frameworks (educational, storytelling, listicles)
   - Story engagement tactics (polls, quizzes, sliders)
   - User-generated content strategy
   - Hashtag strategy (mix of niche + medium + broad)
   - Collaboration and Cross-promotion ideas

Be conversational, specific, actionable, and encouraging. Use emojis naturally. Give concrete examples. Keep responses focused but thorough.`;

const QUICK_PROMPTS = [
  { icon: "🧠", label: "How does the algorithm work?" },
  { icon: "⏰", label: "Best times to post?" },
  { icon: "📉", label: "Why is my reach dropping?" },
  { icon: "🎬", label: "How to grow with Reels?" },
  { icon: "💡", label: "Content ideas for my page" },
  { icon: "🚫", label: "Am I shadowbanned?" },
  { icon: "📊", label: "Hashtag strategy tips" },
  { icon: "💾", label: "How to get more saves?" },
];

const INITIAL_MESSAGE = {
  role: "assistant",
  content: "Hey! 👋 I'm **InstaIQ** — your personal Instagram algorithm expert.\n\nAsk me anything about growing your account, beating the algorithm, fixing reach issues, or creating content that actually performs. What's on your mind?",
};

function loadSessions() {
  try {
    const saved = localStorage.getItem("instaiq_sessions");
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && parsed.length > 0) return parsed;
    }
  } catch (e) {}
  return [{ id: 1, title: "New Chat", messages: [INITIAL_MESSAGE], createdAt: new Date().toISOString() }];
}

function loadActiveId() {
  try {
    const saved = localStorage.getItem("instaiq_active_id");
    if (saved) return JSON.parse(saved);
  } catch (e) {}
  return 1;
}

function TypingDots() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 5, padding: "12px 16px" }}>
      {[0, 1, 2].map((i) => (
        <div key={i} style={{
          width: 8, height: 8, borderRadius: "50%",
          background: "linear-gradient(135deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)",
          animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite`,
        }} />
      ))}
    </div>
  );
}

function Message({ msg }) {
  const isUser = msg.role === "user";
  return (
    <div style={{
      display: "flex", justifyContent: isUser ? "flex-end" : "flex-start",
      marginBottom: 16, animation: "fadeSlideIn 0.3s ease-out",
    }}>
      {!isUser && (
        <div style={{
          width: 36, height: 36, borderRadius: "50%",
          background: "linear-gradient(135deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 18, flexShrink: 0, marginRight: 10,
          boxShadow: "0 4px 15px rgba(220,39,67,0.4)",
        }}>✦</div>
      )}
      <div style={{
        maxWidth: "75%",
        background: isUser ? "linear-gradient(135deg, #833ab4, #fd1d1d, #fcb045)" : "rgba(255,255,255,0.06)",
        backdropFilter: "blur(10px)",
        border: isUser ? "none" : "1px solid rgba(255,255,255,0.1)",
        borderRadius: isUser ? "20px 20px 4px 20px" : "20px 20px 20px 4px",
        padding: "12px 16px", color: "#fff", fontSize: 14, lineHeight: 1.7,
        whiteSpace: "pre-wrap",
        boxShadow: isUser ? "0 4px 20px rgba(131,58,180,0.3)" : "0 2px 10px rgba(0,0,0,0.2)",
      }}
        dangerouslySetInnerHTML={{
          __html: msg.content
            .replace(/\*\*(.*?)\*\*/g, "<strong style='color:#fcb045'>$1</strong>")
            .replace(/^• /gm, "◆ ").replace(/^- /gm, "◆ "),
        }}
      />
    </div>
  );
}

export default function App() {
  const [sessions, setSessions] = useState(loadSessions);
  const [activeId, setActiveId] = useState(loadActiveId);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  const activeSession = sessions.find((s) => s.id === activeId) || sessions[0];
  const messages = activeSession?.messages || [];

  // Persist sessions to localStorage on every change
  useEffect(() => {
    try { localStorage.setItem("instaiq_sessions", JSON.stringify(sessions)); } catch (e) {}
  }, [sessions]);

  // Persist active chat ID
  useEffect(() => {
    try { localStorage.setItem("instaiq_active_id", JSON.stringify(activeId)); } catch (e) {}
  }, [activeId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  function newChat() {
    const id = Date.now();
    setSessions((prev) => [{ id, title: "New Chat", messages: [INITIAL_MESSAGE], createdAt: new Date().toISOString() }, ...prev]);
    setActiveId(id);
    setInput("");
  }

  function deleteSession(id, e) {
    e.stopPropagation();
    setSessions((prev) => {
      const updated = prev.filter((s) => s.id !== id);
      if (updated.length === 0) {
        const newId = Date.now();
        setActiveId(newId);
        return [{ id: newId, title: "New Chat", messages: [INITIAL_MESSAGE], createdAt: new Date().toISOString() }];
      }
      if (id === activeId) setActiveId(updated[0].id);
      return updated;
    });
  }

  function clearAllChats() {
    const newId = Date.now();
    setSessions([{ id: newId, title: "New Chat", messages: [INITIAL_MESSAGE], createdAt: new Date().toISOString() }]);
    setActiveId(newId);
    setInput("");
  }

  async function sendMessage(text) {
    const userMsg = text || input.trim();
    if (!userMsg || loading) return;

    const newMessages = [...messages, { role: "user", content: userMsg }];

    setSessions((prev) => prev.map((s) => s.id === activeId ? {
      ...s,
      messages: newMessages,
      title: s.title === "New Chat" ? userMsg.slice(0, 30) + (userMsg.length > 30 ? "…" : "") : s.title,
    } : s));

    setInput("");
    setLoading(true);

    try {
      const response = await fetch("https://instaiq-chatbot.onrender.com/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: "llama-3.3-70b-versatile", max_tokens: 1000, system: SYSTEM_PROMPT, messages: newMessages }),
      });
      const data = await response.json();
      const reply = data.content?.map((b) => b.text || "").join("\n") || "Sorry, try again!";
      setSessions((prev) => prev.map((s) => s.id === activeId ? { ...s, messages: [...newMessages, { role: "assistant", content: reply }] } : s));
    } catch {
      setSessions((prev) => prev.map((s) => s.id === activeId ? { ...s, messages: [...newMessages, { role: "assistant", content: "Oops! Make sure the server is running with: node server.js 🙏" }] } : s));
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  }

  function groupSessions() {
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    const groups = { Today: [], Yesterday: [], Older: [] };
    sessions.forEach((s) => {
      const d = new Date(s.createdAt).toDateString();
      if (d === today) groups.Today.push(s);
      else if (d === yesterday) groups.Yesterday.push(s);
      else groups.Older.push(s);
    });
    return groups;
  }

  const grouped = groupSessions();

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0f", fontFamily: "'DM Sans', sans-serif", display: "flex", position: "relative", overflow: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Syne:wght@700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }
        @keyframes fadeSlideIn { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
        @keyframes bounce { 0%,80%,100% { transform:scale(0.8); opacity:0.5; } 40% { transform:scale(1.2); opacity:1; } }
        @keyframes gradientPulse { 0%,100% { opacity:0.3; } 50% { opacity:0.6; } }
        .session-item:hover { background: rgba(255,255,255,0.08) !important; }
        .session-item { transition: background 0.2s; cursor: pointer; }
        .delete-btn { opacity: 0 !important; transition: opacity 0.2s; }
        .session-item:hover .delete-btn { opacity: 1 !important; }
        .quick-btn:hover { background: rgba(255,255,255,0.12) !important; border-color: rgba(253,180,69,0.5) !important; transform: translateY(-2px); }
        .quick-btn { transition: all 0.2s ease; cursor: pointer; }
        .send-btn:hover { transform: scale(1.05); }
        .send-btn { transition: transform 0.2s ease; }
        textarea:focus { outline: none; }
        textarea::placeholder { color: rgba(255,255,255,0.3); }
        .new-chat-btn:hover { background: rgba(255,255,255,0.12) !important; }
        .new-chat-btn { transition: background 0.2s; }
        .clear-btn:hover { color: #ff6b6b !important; }
        .clear-btn { transition: color 0.2s; }
      `}</style>

      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}>
        <div style={{ position: "absolute", top: -100, right: -100, width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(131,58,180,0.2) 0%, transparent 70%)", animation: "gradientPulse 4s ease-in-out infinite" }} />
        <div style={{ position: "absolute", bottom: -100, left: -100, width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(253,29,29,0.15) 0%, transparent 70%)", animation: "gradientPulse 5s ease-in-out infinite 1s" }} />
      </div>

      {/* SIDEBAR */}
      {sidebarOpen && (
        <div style={{ width: 260, flexShrink: 0, background: "rgba(255,255,255,0.03)", borderRight: "1px solid rgba(255,255,255,0.07)", display: "flex", flexDirection: "column", zIndex: 10 }}>
          <div style={{ padding: "16px 14px", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
            <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 16, color: "#fff", marginBottom: 12 }}>
              Insta<span style={{ background: "linear-gradient(90deg,#fcb045,#fd1d1d)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>IQ</span>
            </div>
            <button className="new-chat-btn" onClick={newChat} style={{ width: "100%", padding: "9px 12px", borderRadius: 10, background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 8, fontFamily: "'DM Sans', sans-serif" }}>
              <span style={{ fontSize: 16 }}>✏️</span> New Chat
            </button>
          </div>

          <div style={{ flex: 1, overflowY: "auto", padding: "10px 8px" }}>
            {Object.entries(grouped).map(([label, group]) =>
              group.length > 0 && (
                <div key={label}>
                  <p style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", letterSpacing: "0.8px", textTransform: "uppercase", fontWeight: 600, padding: "8px 8px 6px" }}>{label}</p>
                  {group.map((s) => (
                    <div key={s.id} className="session-item" onClick={() => setActiveId(s.id)} style={{ padding: "9px 10px", borderRadius: 10, marginBottom: 3, background: s.id === activeId ? "rgba(255,255,255,0.1)" : "transparent", border: s.id === activeId ? "1px solid rgba(255,255,255,0.12)" : "1px solid transparent", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, overflow: "hidden" }}>
                        <span style={{ fontSize: 13, flexShrink: 0 }}>💬</span>
                        <span style={{ fontSize: 13, color: s.id === activeId ? "#fff" : "rgba(255,255,255,0.6)", fontWeight: s.id === activeId ? 600 : 400, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{s.title}</span>
                      </div>
                      <button className="delete-btn" onClick={(e) => deleteSession(s.id, e)} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.4)", cursor: "pointer", fontSize: 13, flexShrink: 0, padding: 2 }}>🗑️</button>
                    </div>
                  ))}
                </div>
              )
            )}
          </div>

          <div style={{ padding: "12px 14px", borderTop: "1px solid rgba(255,255,255,0.07)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.25)" }}>{sessions.length} chat{sessions.length !== 1 ? "s" : ""} · Groq ⚡</div>
            <button className="clear-btn" onClick={clearAllChats} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.3)", cursor: "pointer", fontSize: 11, fontFamily: "'DM Sans', sans-serif" }}>Clear all</button>
          </div>
        </div>
      )}

      {/* MAIN CHAT */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", zIndex: 1, minWidth: 0 }}>
        <div style={{ background: "rgba(10,10,15,0.85)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(255,255,255,0.07)", padding: "14px 20px", display: "flex", alignItems: "center", gap: 14 }}>
          <button onClick={() => setSidebarOpen((v) => !v)} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.5)", cursor: "pointer", fontSize: 20, padding: 4 }}>☰</button>
          <div style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, boxShadow: "0 0 20px rgba(220,39,67,0.5)" }}>✦</div>
          <div>
            <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 17, color: "#fff" }}>{activeSession?.title === "New Chat" ? "InstaIQ" : activeSession?.title}</div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", fontWeight: 500 }}>{Math.max(0, messages.length - 1)} messages · Groq LLaMA 3.3</div>
          </div>
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#00e676", boxShadow: "0 0 8px #00e676" }} />
            <span style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>Online</span>
          </div>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "24px 20px", maxWidth: 760, width: "100%", margin: "0 auto", alignSelf: "center", paddingBottom: 0, boxSizing: "border-box" }}>
          {messages.map((msg, i) => <Message key={i} msg={msg} />)}

          {messages.length === 1 && (
            <div style={{ marginTop: 8, marginBottom: 20, animation: "fadeSlideIn 0.4s ease-out 0.2s both" }}>
              <p style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", marginBottom: 12, letterSpacing: "0.5px", textTransform: "uppercase", fontWeight: 600 }}>Quick Questions</p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                {QUICK_PROMPTS.map((q, i) => (
                  <button key={i} className="quick-btn" onClick={() => sendMessage(q.label)} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: "10px 14px", color: "rgba(255,255,255,0.75)", fontSize: 13, textAlign: "left", display: "flex", alignItems: "center", gap: 8, fontFamily: "'DM Sans', sans-serif", fontWeight: 500 }}>
                    <span style={{ fontSize: 16 }}>{q.icon}</span>{q.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {loading && (
            <div style={{ display: "flex", alignItems: "center", gap: 10, animation: "fadeSlideIn 0.3s ease-out" }}>
              <div style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>✦</div>
              <div style={{ background: "rgba(255,255,255,0.06)", backdropFilter: "blur(10px)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "20px 20px 20px 4px" }}><TypingDots /></div>
            </div>
          )}
          <div ref={bottomRef} style={{ height: 20 }} />
        </div>

        <div style={{ background: "rgba(10,10,15,0.9)", backdropFilter: "blur(20px)", borderTop: "1px solid rgba(255,255,255,0.07)", padding: "16px 20px" }}>
          <div style={{ maxWidth: 760, margin: "0 auto", display: "flex", gap: 12, alignItems: "flex-end" }}>
            <div style={{ flex: 1, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 16, padding: "12px 16px" }}>
              <textarea ref={inputRef} value={input} onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                placeholder="Ask about the Instagram algorithm, posting times, content ideas..."
                rows={1} style={{ width: "100%", background: "transparent", border: "none", color: "#fff", fontSize: 14, resize: "none", fontFamily: "'DM Sans', sans-serif", lineHeight: 1.6, maxHeight: 100, overflowY: "auto" }}
                onInput={(e) => { e.target.style.height = "auto"; e.target.style.height = Math.min(e.target.scrollHeight, 100) + "px"; }}
              />
            </div>
            <button className="send-btn" onClick={() => sendMessage()} disabled={!input.trim() || loading} style={{ width: 48, height: 48, borderRadius: 14, border: "none", background: input.trim() && !loading ? "linear-gradient(135deg, #833ab4, #fd1d1d, #fcb045)" : "rgba(255,255,255,0.08)", cursor: input.trim() && !loading ? "pointer" : "not-allowed", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0, boxShadow: input.trim() && !loading ? "0 4px 20px rgba(131,58,180,0.4)" : "none" }}>
              {loading ? "⏳" : "→"}
            </button>
          </div>
          <p style={{ textAlign: "center", fontSize: 11, color: "rgba(255,255,255,0.2)", marginTop: 10, fontWeight: 500 }}>Press Enter to send · Shift+Enter for new line</p>
        </div>
      </div>
    </div>
  );
}