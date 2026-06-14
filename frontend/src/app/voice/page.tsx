'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useMutation } from '@tanstack/react-query';
import { API_BASE_URL } from '../../config';
import { useTranslation } from '../LanguageContext';
import BackButton from '../../components/BackButton';

export default function VoiceAdvisoryPage() {
  const { t, language } = useTranslation();
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [instruction, setInstruction] = useState('');
  
  const recognitionRef = useRef<any>(null);
  const [speechSupported, setSpeechSupported] = useState(true);

  // Set default instruction based on language
  useEffect(() => {
    setInstruction(t('voice_instruction_default'));
  }, [language, t]);

  // Initialize Speech Recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.lang = language === 'hi' ? 'hi-IN' : 'en-IN';
        recognition.interimResults = false;
        
        recognition.onresult = (e: any) => {
          const text = e.results[0][0].transcript;
          setTranscript(text);
          setIsRecording(false);
          setInstruction(t('voice_instruction_analyzing'));
          
          // Submit recognized text to voice advisory API
          voiceQueryMutation.mutate(text);
        };

        recognition.onend = () => {
          setIsRecording(false);
        };

        recognition.onerror = () => {
          setIsRecording(false);
          setInstruction(t('voice_instruction_default'));
        };

        recognitionRef.current = recognition;
      } else {
        setSpeechSupported(false);
      }
    }
  }, [language, t]);

  // Update speech recognition language when page language changes
  useEffect(() => {
    if (recognitionRef.current) {
      recognitionRef.current.lang = language === 'hi' ? 'hi-IN' : 'en-IN';
    }
  }, [language]);

  // Mutation to fetch voice response
  const voiceQueryMutation = useMutation({
    mutationFn: async (queryText: string) => {
      const res = await fetch(`${API_BASE_URL}/voice/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: queryText }),
      });
      if (!res.ok) throw new Error('Voice query failed');
      return res.json();
    },
    onSuccess: (data) => {
      setAiResponse(data.response);
      setInstruction(t('voice_instruction_default'));
      speakText(data.response);
    },
    onError: () => {
      const errMsg = language === 'hi' ? 'माफ़ कीजिए, अभी नेटवर्क त्रुटि हुई। कृपया पुनः प्रयास करें।' : 'Sorry, a network error occurred. Please try again.';
      setAiResponse(errMsg);
      setInstruction(t('voice_instruction_default'));
      speakText(errMsg);
    }
  });

  // Text to Speech voice synthesis
  const speakText = (text: string) => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      // Cancel active speaking
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = language === 'hi' ? 'hi-IN' : 'en-IN';
      
      // Try to find matching voice specifically
      const voices = window.speechSynthesis.getVoices();
      const matchVoice = voices.find(v => v.lang.startsWith(language));
      if (matchVoice) {
        utterance.voice = matchVoice;
      }
      
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleMicClick = () => {
    if (!speechSupported) {
      alert(language === 'hi' ? 'आवाज़ इनपुट इस ब्राउज़र में समर्थित नहीं है।' : 'Voice input is not supported in this browser.');
      return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
      setInstruction(t('voice_instruction_default'));
    } else {
      setTranscript('');
      setAiResponse('');
      
      try {
        recognitionRef.current.start();
        setIsRecording(true);
        setInstruction(language === 'hi' ? 'बोल रहे हैं... रुकें नहीं' : 'Speaking... do not stop');
      } catch (e) {
        setIsRecording(false);
        setInstruction(t('voice_instruction_default'));
      }
    }
  };

  // Replay speech
  const handleSpeakAgain = () => {
    if (aiResponse) {
      speakText(aiResponse);
    }
  };

  // Cleanup synthesis on unmount
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  return (
    <div className="krishi-container voice-page-wrap" style={{ paddingBottom: '4rem' }}>
      <BackButton />
      <div className="page-header fade-in-up">
        <h1 className="page-title"><i className="fa-solid fa-microphone"></i> {t('voice_title_page')}</h1>
        <p className="page-sub">{t('voice_sub_page')}</p>
      </div>

      <div className="voice-center-layout fade-in-up delay-1">
        {/* Big Mic Button Section */}
        <div className="voice-mic-section">
          <div className="voice-wave-wrap" id="voiceWaveWrap">
            {/* Wave Rings when recording */}
            {isRecording && (
              <>
                <div className="voice-wave-ring ring1"></div>
                <div className="voice-wave-ring ring2"></div>
                <div className="voice-wave-ring ring3"></div>
              </>
            )}
            <button 
              className={`voice-big-mic ${isRecording ? 'recording' : ''}`} 
              id="voiceMicBtn"
              onClick={handleMicClick}
            >
              <i className="fa-solid fa-microphone" id="micIcon"></i>
            </button>
          </div>
          <p className="voice-instruction" id="voiceInstruction">{instruction}</p>
          
          {/* Active Audio Wave Bars */}
          {isRecording && (
            <div className="voice-status-bar" id="voiceStatusBar">
              <div className="voice-bars">
                <div className="v-bar"></div>
                <div className="v-bar"></div>
                <div className="v-bar"></div>
                <div className="v-bar"></div>
                <div className="v-bar"></div>
                <div className="v-bar"></div>
                <div className="v-bar"></div>
              </div>
              <span>{t('voice_instruction_listening')}</span>
            </div>
          )}
        </div>

        {/* Transcript Card */}
        {transcript && (
          <div className="krishi-card voice-transcript-card" id="transcriptCard">
            <div className="transcript-label"><i className="fa-solid fa-quote-left"></i> {t('voice_you_said')}</div>
            <p className="transcript-text" id="transcriptText">{transcript}</p>
          </div>
        )}

        {/* Loading status */}
        {voiceQueryMutation.isPending && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#2E7D32', fontWeight: 600 }}>
            <i className="fa-solid fa-spinner fa-spin"></i>
            <span>{t('voice_instruction_analyzing')}</span>
          </div>
        )}

        {/* AI Response Card */}
        {aiResponse && (
          <div className="krishi-card voice-response-card" id="voiceResponseCard">
            <div className="response-header">
              <div className="response-avatar"><i className="fa-solid fa-robot"></i></div>
              <div>
                <h3>{t('voice_ai_response')}</h3>
                <button className="speak-again-btn" id="speakAgainBtn" onClick={handleSpeakAgain}>
                  <i className="fa-solid fa-volume-high"></i> {t('voice_speak_again')}
                </button>
              </div>
            </div>
            <div className="response-text" id="responseText">{aiResponse}</div>
          </div>
        )}

        {/* Tips Section */}
        <div className="voice-tips fade-in-up delay-2">
          <h4>{t('voice_tips_title')}</h4>
          <div className="voice-tip-chips">
            <span className="voice-chip">{language === 'hi' ? '"मेरी गेहूं में पीले दाग हैं"' : '"My wheat has yellow spots"'}</span>
            <span className="voice-chip">{language === 'hi' ? '"आज धान का भाव क्या है?"' : '"What is the price of paddy today?"'}</span>
            <span className="voice-chip">{language === 'hi' ? '"PM Kisan का पैसा कब आएगा?"' : '"When will PM Kisan money come?"'}</span>
            <span className="voice-chip">{language === 'hi' ? '"कल बारिश होगी क्या?"' : '"Will it rain tomorrow?"'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
