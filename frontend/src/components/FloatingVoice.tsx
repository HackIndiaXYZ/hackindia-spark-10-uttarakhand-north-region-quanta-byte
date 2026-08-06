import React from 'react';
import { Link } from 'react-router-dom';

export default function FloatingVoice() {
  return (
    <Link to="/voice" className="floating-voice-btn" title="Voice Assistant">
      <i className="fa-solid fa-microphone"></i>
    </Link>
  );
}
