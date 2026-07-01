import React, { useEffect, useState } from "react";
import "./Marquee.css";
import { getMarqueeMessage } from "../services/publicapi/generalAPI";

const Marquee = () => {
  const [message, setMessage] = useState("Welcome to Survivor Products!");
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMessage = async () => {
      try {
        const response = await getMarqueeMessage();
        if (response.success) {
          setMessage(response.message);
        }
      } catch (error) {
        console.error("Error fetching marquee:", error);
        setError(error.message);
        // Keep the default message on error
      }
    };

    fetchMessage();
  }, []);

  return (
    <div className="marquee-container">
      <marquee behavior="scroll" direction="left">
        🎉 {error ? message : message} 🎉
      </marquee>
    </div>
  );
};

export default Marquee;
