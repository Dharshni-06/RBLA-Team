import React, { useState } from "react";
import "./Chatbot.css";
import chatbotIcon from "../Assets/chatbot.png";

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { sender: "bot", text: "Hi! I can help you with Entrepreneur 2, Entrepreneur 3, or Entrepreneur 1 products. What would you like to know?" }
  ]);
  const [inputValue, setInputValue] = useState("");

  const handleSend = async () => {
    if (!inputValue.trim()) return;

    const userMessage = inputValue.trim();
    const newMessages = [...messages, { sender: "user", text: userMessage }];
    setMessages(newMessages);
    setInputValue("");

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage })
      });

      const data = await res.json();
      newMessages.push({ sender: "bot", text: data.reply });
      setMessages([...newMessages]);
    } catch (error) {
      newMessages.push({ sender: "bot", text: "Sorry, I’m having trouble responding right now." });
      setMessages([...newMessages]);
    }
  };

  return (
    <div className="chatbot-wrapper">
      {isOpen && (
        <div className="chat-window">
          <div className="chat-header">
            <img src={chatbotIcon} alt="Bot" className="chat-logo" />
            <span>TalkTribe</span>
            <button className="chatbot-close-btn" onClick={() => setIsOpen(false)}>✕</button>
          </div>

          <div className="chat-body">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={msg.sender === "bot" ? "bot-message" : "user-message"}
              >
                {msg.text}
              </div>
            ))}
          </div>

          <div className="chat-footer">
            <input
              type="text"
              placeholder="Type a message..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
            />
            <button onClick={handleSend}>Send</button>
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
