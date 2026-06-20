/* =====================================================
   chatbot.js — Chat UI, Typing Animation, Mic Input
   ===================================================== */

'use strict';

(function initChatbot() {
    const chatWindow  = document.getElementById('chatWindow');
    const chatInput   = document.getElementById('chatInput');
    const sendBtn     = document.getElementById('sendBtn');
    const micInputBtn = document.getElementById('micInputBtn');
    const clearBtn    = document.getElementById('clearChat');
    const suggestions = document.getElementById('quickSuggestions');

    if (!chatWindow || !chatInput) return;

    let isTyping = false;
    let typingBubble = null;

    // ==============================
    // SEND MESSAGE
    // ==============================
    window.sendMessage = function () {
        const message = chatInput.value.trim();
        if (!message || isTyping) return;

        // Hide suggestions
        if (suggestions) suggestions.style.display = 'none';

        // Add user bubble
        appendBubble(message, 'user');
        chatInput.value = '';
        sendBtn.disabled = true;

        // Show typing
        showTyping();

        // Send to backend
        fetch('/chatbot/query', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message, session_id: getSessionId() })
        })
        .then(r => {
            if (!r.ok) throw new Error('Network error');
            return r.json();
        })
        .then(data => {
            hideTyping();
            const response = data.response || 'माफ़ कीजिए, कुछ गड़बड़ हुई। दोबारा कोशिश करें।';
            appendBubble(response, 'bot');
        })
        .catch(() => {
            hideTyping();
            appendBubble('माफ़ कीजिए, अभी server से connect नहीं हो पाया। थोड़ी देर बाद try करें। 🙏', 'bot', true);
        })
        .finally(() => {
            sendBtn.disabled = false;
            chatInput.focus();
        });
    };

    // ==============================
    // APPEND CHAT BUBBLE
    // ==============================
    function appendBubble(text, role, isError = false) {
        const bubble = document.createElement('div');
        bubble.className = `chat-bubble ${role === 'user' ? 'user-bubble' : 'bot-bubble'}`;

        const now = new Date().toLocaleTimeString('hi-IN', { hour: '2-digit', minute: '2-digit' });

        if (role === 'bot') {
            const rawText = text.replace(/<[^>]*>?/gm, ''); // Remove HTML tags for speech
            bubble.innerHTML = `
                <div class="bubble-avatar"><i class="fa-solid fa-robot"></i></div>
                <div class="bubble-content ${isError ? 'error-bubble' : ''}">
                    ${formatBotMessage(text)}
                    <button class="tts-btn" onclick="playVoice('${rawText.replace(/'/g, "\\'")}')" title="Listen to response">
                        <i class="fa-solid fa-volume-high"></i>
                    </button>
                </div>
                <span class="bubble-time">${now}</span>
            `;
        } else {
            bubble.innerHTML = `
                <div class="bubble-content">${escapeHtml(text)}</div>
                <div class="bubble-avatar user-av"><i class="fa-solid fa-user"></i></div>
                <span class="bubble-time">${now}</span>
            `;
        }

        chatWindow.appendChild(bubble);
        scrollToBottom();

        // Animate in
        bubble.style.opacity = '0';
        bubble.style.transform = 'translateY(12px)';
        requestAnimationFrame(() => {
            bubble.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
            bubble.style.opacity = '1';
            bubble.style.transform = 'translateY(0)';
        });
    }

    // ==============================
    // TYPING ANIMATION
    // ==============================
    function showTyping() {
        isTyping = true;
        typingBubble = document.createElement('div');
        typingBubble.className = 'chat-bubble bot-bubble typing-bubble';
        typingBubble.id = 'typingIndicator';
        typingBubble.innerHTML = `
            <div class="bubble-avatar"><i class="fa-solid fa-robot"></i></div>
            <div class="bubble-content">
                <div class="typing-dots">
                    <span></span><span></span><span></span>
                </div>
            </div>
        `;
        chatWindow.appendChild(typingBubble);
        scrollToBottom();
    }

    function hideTyping() {
        isTyping = false;
        if (typingBubble) {
            typingBubble.remove();
            typingBubble = null;
        }
    }

    // ==============================
    // FORMAT BOT MESSAGE (simple markdown)
    // ==============================
    function formatBotMessage(text) {
        return text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/\n/g, '<br>')
            .replace(/^- (.+)$/gm, '<li>$1</li>')
            .replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');
    }

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.appendChild(document.createTextNode(text));
        return div.innerHTML;
    }

    // ==============================
    // SCROLL TO BOTTOM
    // ==============================
    function scrollToBottom() {
        setTimeout(() => {
            chatWindow.scrollTop = chatWindow.scrollHeight;
        }, 50);
    }

    // ==============================
    // EVENT LISTENERS
    // ==============================
    if (sendBtn) {
        sendBtn.addEventListener('click', sendMessage);
    }

    if (chatInput) {
        chatInput.addEventListener('keydown', e => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        });

        chatInput.addEventListener('input', function () {
            sendBtn.disabled = !this.value.trim();
        });
    }

    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            if (!confirm('Chat history clear करें?')) return;
            // Remove all bubbles except welcome
            const bubbles = chatWindow.querySelectorAll('.chat-bubble:not(.welcome-bubble)');
            bubbles.forEach(b => b.remove());
            if (suggestions) suggestions.style.display = 'flex';
            // Clear server session
            fetch('/chatbot/clear', { method: 'POST' }).catch(() => {});
        });
    }

    // ==============================
    // MIC INPUT (Voice-to-Text)
    // ==============================
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    let recognition = null;

    if (SpeechRecognition && micInputBtn) {
        recognition = new SpeechRecognition();
        recognition.lang = 'hi-IN';
        recognition.interimResults = true;
        recognition.continuous = false;

        let isListening = false;

        micInputBtn.addEventListener('click', () => {
            if (!isListening) {
                recognition.start();
                isListening = true;
                micInputBtn.classList.add('active');
                micInputBtn.title = 'बोल रहे हैं... रोकने के लिए tap करें';
            } else {
                recognition.stop();
                isListening = false;
                micInputBtn.classList.remove('active');
            }
        });

        recognition.onresult = e => {
            const transcript = Array.from(e.results)
                .map(r => r[0].transcript)
                .join('');
            chatInput.value = transcript;
            sendBtn.disabled = !transcript.trim();
        };

        recognition.onend = () => {
            isListening = false;
            micInputBtn.classList.remove('active');
            // Auto-send if there's a message
            if (chatInput.value.trim()) {
                setTimeout(sendMessage, 500);
            }
        };

        recognition.onerror = e => {
            isListening = false;
            micInputBtn.classList.remove('active');
            if (e.error === 'not-allowed') {
                KrishiToast.show('Microphone permission दें!', 'warning');
            }
        };
    } else if (micInputBtn) {
        // Browser doesn't support speech recognition
        micInputBtn.style.opacity = '0.4';
        micInputBtn.title = 'Voice input supported नहीं है इस browser में';
        micInputBtn.disabled = true;
    }

    // ==============================
    // SESSION ID
    // ==============================
    function getSessionId() {
        let id = sessionStorage.getItem('krishi_chat_session');
        if (!id) {
            id = 'sess_' + Math.random().toString(36).substr(2, 9);
            sessionStorage.setItem('krishi_chat_session', id);
        }
        return id;
    }

    // ==============================
    // AUTO SCROLL ON LOAD
    // ==============================
    scrollToBottom();

    // ==============================
    // DISABLE SEND BTN INITIALLY IF EMPTY
    // ==============================
    if (sendBtn) sendBtn.disabled = true;

})();


// ==============================
// SUGGESTION CHIPS HANDLER
// ==============================
window.sendSuggestion = function (btn) {
    const chatInput = document.getElementById('chatInput');
    const suggestions = document.getElementById('quickSuggestions');

    if (!chatInput) return;
    chatInput.value = btn.textContent.trim();

    if (suggestions) suggestions.style.display = 'none';

    window.sendMessage();
};

// ==============================
// TEXT TO SPEECH (Voice Playback)
// ==============================
window.playVoice = function(text) {
    // Cancel any ongoing speech
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'hi-IN'; // Default to Hindi
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    
    // Find a Hindi voice if available
    const voices = window.speechSynthesis.getVoices();
    const hindiVoice = voices.find(voice => voice.lang.includes('hi') || voice.lang.includes('HI'));
    if (hindiVoice) {
        utterance.voice = hindiVoice;
    }
    
    window.speechSynthesis.speak(utterance);
};
