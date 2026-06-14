'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function FloatingAI() {
  const router = useRouter();
  const [visible, setVisible] = useState(true);
  const [opacity, setOpacity] = useState(1);
  const [translateY, setTranslateY] = useState(0);
  
  useEffect(() => {
    let lastScroll = 0;
    const handleScroll = () => {
      const current = window.scrollY;
      if (current > lastScroll && current > 200) {
        // Scrolling down
        setTranslateY(8);
        setOpacity(0.7);
      } else {
        // Scrolling up
        setTranslateY(0);
        setOpacity(1);
      }
      lastScroll = current;
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <button 
      className="floating-ai-btn" 
      id="floatingAI" 
      onClick={() => router.push('/chatbot')}
      title="AI सहायक"
      style={{
        transform: `translateY(${translateY}px)`,
        opacity: opacity,
        transition: 'transform 0.25s ease, opacity 0.25s ease'
      }}
    >
      <div className="ai-pulse"></div>
      <i className="fa-solid fa-robot"></i>
      <span className="ai-label">AI Help</span>
    </button>
  );
}
