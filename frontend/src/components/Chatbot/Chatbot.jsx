import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./Chatbot.css";
import chatbotIcon from "../Assets/chatbot.png";

export default function Chatbot() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { sender: "bot", text: "Hi! 👋 Welcome to TalkTribe, your AI assistant for our eco-friendly handcrafted e-commerce platform. How can I help you today?" }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const chatBodyRef = useRef(null);

  const quickPrompts = [
    { label: "📦 Products Offered", route: "/productpage" },
    { label: "🎨 Customization Tools", route: "/upload-design" },
    { label: "🏭 Production Units", route: "/entrepreneur1" },
    { label: "🛍️ Bulk Orders", route: "/bulkorders" },
    { label: "🚚 Track My Order", route: "/orders" },
    { label: "💬 Support & Returns", route: "/helpcenter" }
  ];

  useEffect(() => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const sendMessage = async (textToSend, routeToNavigate = null) => {
    const userMessage = textToSend.trim();
    if (!userMessage || loading) return;

    const newMessages = [...messages, { sender: "user", text: userMessage }];
    setMessages(newMessages);
    setInputValue("");
    setLoading(true);

    // If a route was passed (e.g., from quick prompt buttons), redirect immediately
    if (routeToNavigate) {
      setTimeout(() => {
        navigate(routeToNavigate);
      }, 300);
    }

    try {
      const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:5000";
      const res = await fetch(`${API_BASE}/api/chatbot`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage })
      });

      const data = await res.json();
      let replyText = data.reply || data.error || "";
      if (typeof replyText === "string" && (replyText.includes("budget") || replyText.includes("pollinations") || replyText.includes("API key") || replyText.includes("Support Pollinations"))) {
        replyText = "I'm happy to help you with our eco-friendly handcrafted products, interactive customizers, bulk orders, shipping, or returns! Please let me know what you'd like to explore on our website.";
      }

      if (res.ok && replyText) {
        setMessages((prev) => [...prev, { sender: "bot", text: replyText, route: routeToNavigate }]);
      } else {
        setMessages((prev) => [
          ...prev,
          { sender: "bot", text: replyText || "Sorry, I’m having trouble responding right now.", route: routeToNavigate }
        ]);
      }
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "Sorry, I’m having trouble connecting to the backend right now.", route: routeToNavigate }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chatbot-wrapper">
      {isOpen && (
        <div className="chat-window">
          <div className="chat-header">
            <img src={chatbotIcon} alt="Bot" className="chat-logo" />
            <span>TalkTribe Assistant</span>
            <button className="chatbot-close-btn" onClick={() => setIsOpen(false)}>✕</button>
          </div>

          <div className="chat-body" ref={chatBodyRef}>
            {messages.map((msg, index) => (
              <div key={index} style={{ display: "flex", flexDirection: "column" }}>
                <div className={msg.sender === "bot" ? "bot-message" : "user-message"}>
                  {msg.text}
                </div>
                {msg.route && msg.sender === "bot" && (
                  <button
                    className="chatbot-nav-link-btn"
                    onClick={() => navigate(msg.route)}
                  >
                    🔗 Open Page ({msg.route})
                  </button>
                )}
              </div>
            ))}
            {loading && <div className="bot-message">Thinking... 💭</div>}

            {!loading && (
              <div className="quick-prompts-container">
                <p className="quick-prompts-title">Quick Commands:</p>
                <div className="quick-prompts-list">
                  {quickPrompts.map((prompt, idx) => (
                    <button
                      key={idx}
                      className="option-btn"
                      onClick={() => sendMessage(prompt.label, prompt.route)}
                    >
                      {prompt.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="chat-footer">
            <input
              type="text"
              placeholder="Type a message..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage(inputValue)}
              disabled={loading}
            />
            <button onClick={() => sendMessage(inputValue)} disabled={loading}>Send</button>
          </div>
        </div>
      )}

      <img
        src={chatbotIcon}
        alt="Chatbot"
        className="chatbot-icon"
        onClick={() => setIsOpen(!isOpen)}
      />
    </div>
  );
}
