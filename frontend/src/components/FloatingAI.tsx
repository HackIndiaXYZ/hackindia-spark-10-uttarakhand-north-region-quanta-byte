import React from 'react';
import { Link } from 'react-router-dom';

export default function FloatingAI() {
  return (
    <Link to="/chatbot" className="floating-ai-btn" title="AI Assistant">
      <span className="ai-pulse"></span>
      <i className="fa-solid fa-robot"></i>
      <span className="ai-label">AI Help</span>
    </Link>
  );
}
