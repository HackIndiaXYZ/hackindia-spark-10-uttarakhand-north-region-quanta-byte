'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function FloatingVoice() {
  const router = useRouter();
  const [opacity, setOpacity] = useState(1);
  
  useEffect(() => {
    let lastScroll = 0;
    const handleScroll = () => {
      const current = window.scrollY;
      if (current > lastScroll && current > 200) {
        setOpacity(0.7);
      } else {
        setOpacity(1);
      }
      lastScroll = current;
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <button 
      className="floating-voice-btn" 
      id="floatingVoice" 
      onClick={() => router.push('/voice')}
      title="Voice Advisory"
      style={{
        opacity: opacity,
        transition: 'opacity 0.25s ease'
      }}
    >
      <i className="fa-solid fa-microphone"></i>
    </button>
  );
}
