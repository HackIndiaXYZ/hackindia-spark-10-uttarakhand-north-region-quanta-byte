'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { API_BASE_URL } from '../../config';
import { useTranslation } from '../LanguageContext';
import BackButton from '../../components/BackButton';

interface ChatMessage {
  role: 'user' | 'bot';
  message: string;
  time: string;
}

export default function ChatbotPage() {
  const { t, language } = useTranslation();
  const queryClient = useQueryClient();
  const [session_id, setSessionId] = useState('');
  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'warning' } | null>(null);

  const chatWindowRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Initialize session ID on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      let id = sessionStorage.getItem('krishi_chat_session');
      if (!id) {
        id = 'sess_' + Math.random().toString(36).substring(2, 11);
        sessionStorage.setItem('krishi_chat_session', id);
      }
      setSessionId(id);
    }
  }, []);

  // Fetch chat history from DB on load
  const { data: historyData, isLoading: historyLoading } = useQuery({
    queryKey: ['chatHistory', session_id],
    queryFn: async () => {
      const res = await fetch(`${API_BASE_URL}/api/chatbot/history/${session_id}`);
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!session_id
  });

  // Populate messages with history
  useEffect(() => {
    if (historyData && historyData.length > 0) {
      setMessages(historyData);
      setShowSuggestions(false); // Hide suggestions if there is history
    }
  }, [historyData]);

  // Scroll to bottom
  const scrollToBottom = () => {
    if (chatWindowRef.current) {
      chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Mutation to send query
  const queryMutation = useMutation({
    mutationFn: async (msgText: string) => {
      const res = await fetch(`${API_BASE_URL}/chatbot/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: msgText, session_id }),
      });
      if (!res.ok) throw new Error('Query failed');
      return res.json();
    },
    onMutate: () => {
      setIsTyping(true);
    },
    onSuccess: (data) => {
      setIsTyping(false);
      const time = new Date().toLocaleTimeString(language === 'hi' ? 'hi-IN' : 'en-US', { hour: '2-digit', minute: '2-digit' });
      setMessages((prev) => [...prev, { role: 'bot', message: data.response, time }]);
    },
    onError: () => {
      setIsTyping(false);
      const time = new Date().toLocaleTimeString(language === 'hi' ? 'hi-IN' : 'en-US', { hour: '2-digit', minute: '2-digit' });
      setMessages((prev) => [...prev, {
        role: 'bot',
        message: language === 'hi' 
          ? 'माफ़ कीजिए, अभी server से connect नहीं हो पाया। थोड़ी देर बाद try करें। 🙏' 
          : 'Sorry, could not connect to the server. Please try again later. 🙏',
        time
      }]);
    }
  });

  // Speech Recognition setup
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.lang = language === 'hi' ? 'hi-IN' : 'en-IN';
        recognition.interimResults = true;
        recognition.continuous = false;

        recognition.onresult = (e: any) => {
          const transcript = Array.from(e.results)
            .map((r: any) => r[0].transcript)
            .join('');
          setInputValue(transcript);
        };

        recognition.onend = () => {
          setIsListening(false);
          if (inputValue.trim()) {
            handleSendMessage(inputValue);
          }
        };

        recognition.onerror = (e: any) => {
          setIsListening(false);
          if (e.error === 'not-allowed') {
            setToast({ 
              message: language === 'hi' ? 'माइक एक्सेस की अनुमति दें!' : 'Allow microphone access!', 
              type: 'warning' 
            });
          }
        };

        recognitionRef.current = recognition;
      }
    }
  }, [inputValue, language]);

  const toggleMic = () => {
    if (!recognitionRef.current) {
      setToast({ 
        message: language === 'hi' ? 'इस ब्राउज़र में वॉइस इनपुट समर्थित नहीं है।' : 'Voice input is not supported in this browser.', 
        type: 'warning' 
      });
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      setInputValue('');
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const handleSendMessage = (textToSend?: string) => {
    const text = textToSend || inputValue.trim();
    if (!text || isTyping) return;

    setShowSuggestions(false);
    const time = new Date().toLocaleTimeString(language === 'hi' ? 'hi-IN' : 'en-US', { hour: '2-digit', minute: '2-digit' });
    setMessages((prev) => [...prev, { role: 'user', message: text, time }]);
    setInputValue('');

    queryMutation.mutate(text);
  };

  const clearChat = () => {
    if (!window.confirm(language === 'hi' ? 'चैट इतिहास मिटाएं?' : 'Clear chat history?')) return;
    setMessages([]);
    setShowSuggestions(true);
    fetch(`${API_BASE_URL}/chatbot/clear`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session_id })
    }).catch(() => {});
  };

  const formatBotMessage = (text: string) => {
    // Basic Markdown formatting helper
    let formatted = text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n/g, '<br>');
    return <span dangerouslySetInnerHTML={{ __html: formatted }} />;
  };

  // Toast auto dismiss trigger
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  return (
    <div className="chatbot-page-wrap">
      {/* Toast Notification */}
      {toast && (
        <div 
          style={{
            position: 'fixed', top: '80px', right: '1rem', zIndex: 9999,
            background: '#fff', borderLeft: `4px solid ${toast.type === 'success' ? '#43A047' : '#F9A825'}`,
            borderRadius: '12px', padding: '0.75rem 1rem',
            boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
            display: 'flex', alignItems: 'center', gap: '0.6rem',
            fontSize: '0.88rem', fontWeight: 500, color: '#1B1B1B'
          }}
        >
          <i className={`fa-solid ${
            toast.type === 'success' ? 'fa-check-circle' : 'fa-exclamation-triangle'
          }`} style={{ color: toast.type === 'success' ? '#43A047' : '#F9A825' }}></i>
          {toast.message}
        </div>
      )}

      {/* Chatbot Header */}
      <div className="chatbot-header">
        <BackButton className="chat-header-back" />
        <div className="chatbot-avatar">
          <i className="fa-solid fa-robot"></i>
          <div className="chatbot-online-dot"></div>
        </div>
        <div className="chatbot-title-info">
          <h2>{t('chatbot_title_page')}</h2>
          <span className="chatbot-status"><i className="fa-solid fa-circle"></i> {t('chatbot_status')}</span>
        </div>
        <button className="chatbot-clear-btn" id="clearChat" onClick={clearChat} title={language === 'hi' ? 'चैट इतिहास साफ़ करें' : 'Clear Chat'}>
          <i className="fa-solid fa-trash"></i>
        </button>
      </div>

      {/* Chat Window */}
      <div className="chat-window" id="chatWindow" ref={chatWindowRef}>
        {/* Welcome Message */}
        <div className="chat-bubble bot-bubble welcome-bubble">
          <div className="bubble-avatar"><i className="fa-solid fa-robot"></i></div>
          <div className="bubble-content">
            <p>{t('chatbot_welcome')}</p>
            <ul style={{ listStyleType: 'disc', paddingLeft: '1rem', marginTop: '0.25rem' }}>
              <li>{t('chatbot_welcome_item1')}</li>
              <li>{t('chatbot_welcome_item2')}</li>
              <li>{t('chatbot_welcome_item3')}</li>
              <li>{t('chatbot_welcome_item4')}</li>
              <li>{t('chatbot_welcome_item5')}</li>
            </ul>
          </div>
          <span className="bubble-time">{language === 'hi' ? 'अभी' : 'now'}</span>
        </div>

        {/* Dynamic Conversation Bubble List */}
        {messages.map((msg, index) => (
          <div key={index} className={`chat-bubble ${msg.role === 'user' ? 'user-bubble' : 'bot-bubble'}`}>
            {msg.role === 'bot' && (
              <div className="bubble-avatar"><i className="fa-solid fa-robot"></i></div>
            )}
            <div className="bubble-content">
              {msg.role === 'bot' ? formatBotMessage(msg.message) : msg.message}
            </div>
            {msg.role === 'user' && (
              <div className="bubble-avatar user-av"><i className="fa-solid fa-user"></i></div>
            )}
            <span className="bubble-time">{msg.time}</span>
          </div>
        ))}

        {/* Typing Dot Loader */}
        {isTyping && (
          <div className="chat-bubble bot-bubble typing-bubble" id="typingIndicator">
            <div className="bubble-avatar"><i className="fa-solid fa-robot"></i></div>
            <div className="bubble-content">
              <div className="typing-dots">
                <span></span><span></span><span></span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Quick Suggestions */}
      {showSuggestions && (
        <div className="quick-suggestions" id="quickSuggestions">
          <button className="suggestion-chip" onClick={() => handleSendMessage(language === 'hi' ? 'गेहूं में पीलापन क्यों?' : 'Why is wheat yellowing?')}>
            {language === 'hi' ? 'गेहूं में पीलापन क्यों?' : 'Why is wheat yellowing?'}
          </button>
          <button className="suggestion-chip" onClick={() => handleSendMessage(language === 'hi' ? 'आज का मंडी भाव' : "Today's Mandi rates")}>
            {language === 'hi' ? 'आज का मंडी भाव' : "Today's Mandi rates"}
          </button>
          <button className="suggestion-chip" onClick={() => handleSendMessage(language === 'hi' ? 'PM Kisan कैसे मिलेगा?' : 'How to get PM Kisan benefits?')}>
            {language === 'hi' ? 'PM Kisan कैसे मिलेगा?' : 'How to get PM Kisan benefits?'}
          </button>
          <button className="suggestion-chip" onClick={() => handleSendMessage(language === 'hi' ? 'धान में कौन सी खाद डालें?' : 'Which fertilizer to use for paddy?')}>
            {language === 'hi' ? 'धान में कौन सी खाद डालें?' : 'Which fertilizer to use for paddy?'}
          </button>
        </div>
      )}

      {/* Chat Input Bar */}
      <div className="chat-input-bar">
        <button 
          className={`mic-input-btn ${isListening ? 'active' : ''}`} 
          id="micInputBtn" 
          onClick={toggleMic}
          title={isListening ? (language === 'hi' ? 'बोल रहे हैं... रोकने के लिए tap करें' : 'Listening... tap to stop') : 'Voice input'}
        >
          <i className="fa-solid fa-microphone"></i>
        </button>
        <input 
          type="text" 
          className="chat-text-input" 
          id="chatInput" 
          placeholder={isListening ? t('chatbot_listening') : t('chatbot_placeholder')}
          autoComplete="off"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSendMessage();
          }}
        />
        <button 
          className="send-btn" 
          id="sendBtn" 
          onClick={() => handleSendMessage()}
          disabled={!inputValue.trim() || isTyping}
        >
          <i className="fa-solid fa-paper-plane"></i>
        </button>
      </div>
    </div>
  );
}
