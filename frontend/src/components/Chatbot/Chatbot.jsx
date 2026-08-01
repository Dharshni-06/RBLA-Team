import React, { useState, useEffect, useRef } from "react";
import "./Chatbot.css";
import chatbotIcon from "../Assets/chatbot.png";

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { sender: "bot", text: "Hi! 👋 Welcome to TalkTribe, your AI assistant for our eco-friendly handcrafted e-commerce platform. How can I help you today?" }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const chatBodyRef = useRef(null);

  const quickPrompts = [
    "📦 Products Offered",
    "🎨 Customization Tools",
    "🏭 Production Units",
    "🛍️ Bulk Orders",
    "🚚 Track My Order",
    "💬 Support & Returns"
  ];

  useEffect(() => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const sendMessage = async (textToSend) => {
    const userMessage = textToSend.trim();
    if (!userMessage || loading) return;

    const newMessages = [...messages, { sender: "user", text: userMessage }];
    setMessages(newMessages);
    setInputValue("");
    setLoading(true);

    try {
      const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:5000";
      const res = await fetch(`${API_BASE}/api/chatbot`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage })
      });

      const data = await res.json();
      if (res.ok && data.reply) {
        setMessages((prev) => [...prev, { sender: "bot", text: data.reply }]);
      } else {
        setMessages((prev) => [
          ...prev,
          { sender: "bot", text: data.error || data.reply || "Sorry, I’m having trouble responding right now." }
        ]);
      }
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "Sorry, I’m having trouble connecting to the backend right now." }
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
              <div
                key={index}
                className={msg.sender === "bot" ? "bot-message" : "user-message"}
              >
                {msg.text}
              </div>
            ))}
            {loading && <div className="bot-message">Thinking... 💭</div>}

            {messages.length === 1 && (
              <div className="quick-prompts-container">
                <p className="quick-prompts-title">Quick Questions:</p>
                <div className="quick-prompts-list">
                  {quickPrompts.map((prompt, idx) => (
                    <button
                      key={idx}
                      className="option-btn"
                      onClick={() => sendMessage(prompt)}
                    >
                      {prompt}
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
