import React, { useState, useEffect } from 'react';
import '../App.css';

const ConversationalText = ({ text, isTyping }) => {
  const [displayedText, setDisplayedText] = useState('');

  // Simple typing effect simulation
  useEffect(() => {
    if (isTyping) {
      setDisplayedText('');
      let currentIndex = 0;
      const chars = Array.from(text); // Use Array.from to handle emojis correctly
      const interval = setInterval(() => {
        if (currentIndex < chars.length) {
          const char = chars[currentIndex];
          setDisplayedText((prev) => prev + char);
          currentIndex++;
        } else {
          clearInterval(interval);
        }
      }, 50); // ms per character
      return () => clearInterval(interval);
    } else {
      setDisplayedText(text);
    }
  }, [text, isTyping]);

  if (!text && !isTyping) return null;

  return (
    <div className="conversational-text">
      <p className="text-content">
        {displayedText}
        {(isTyping || displayedText.length < text.length) && <span className="cursor">&nbsp;</span>}
      </p>
    </div>
  );
};

export default ConversationalText;
