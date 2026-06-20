/* =====================================================
   chatbot.js — Chat UI, Typing Animation, Mic Input
   ===================================================== */

'use strict';

(function initChatbot() {
    const chatWindow  = document.getElementById('chatWindow');
    const chatInput   = document.getElementById('chatInput');
    const sendBtn     = document.getElementById('sendBtn');
    const micInputBtn = document.getElementById('micInputBtn');
    const uploadBtn   = document.getElementById('uploadBtn');
    const imageUpload = document.getElementById('imageUpload');
    const imagePreviewContainer = document.getElementById('imagePreviewContainer');
    const imagePreview = document.getElementById('imagePreview');
    const removeImageBtn = document.getElementById('removeImageBtn');
    const clearBtn    = document.getElementById('clearChat');
    const suggestions = document.getElementById('quickSuggestions');
    const sidebarToggle = document.getElementById('sidebarToggle');
    const chatSidebar = document.getElementById('chatSidebar');

    let currentImageData = null;

    if (sidebarToggle && chatSidebar) {
        sidebarToggle.addEventListener('click', () => {
            chatSidebar.classList.toggle('open');
        });
    }

    if (!chatWindow || !chatInput) return;

    let isTyping = false;
    let typingBubble = null;

    // ==============================
    // SEND MESSAGE
    // ==============================
    window.sendMessage = function () {
        const message = chatInput.value.trim();
        if ((!message && !currentImageData) || isTyping) return;

        // Hide suggestions
        if (suggestions) suggestions.style.display = 'none';

        // Add user bubble
        appendBubble(message, 'user', false, currentImageData);
        
        const payloadData = { 
            message: message, 
            session_id: window.ACTIVE_SESSION_ID,
            image_data: currentImageData 
        };

        chatInput.value = '';
        removeImageBtn?.click(); // Clear image preview
        sendBtn.disabled = true;

        // Show typing
        showTyping();

        // Send to backend
        fetch('/chatbot/query', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payloadData)
        })
        .then(r => {
            if (!r.ok) throw new Error('Network error');
            return r.json();
        })
        .then(data => {
            hideTyping();
            if (data.session_id) {
                window.ACTIVE_SESSION_ID = data.session_id;
            }
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
            checkInputState();
        });
    };

    // ==============================
    // APPEND CHAT BUBBLE
    // ==============================
    function appendBubble(text, role, isError = false, imageData = null) {
        const bubble = document.createElement('div');
        bubble.className = `chat-bubble ${role === 'user' ? 'user-bubble' : 'bot-bubble'}`;

        const now = new Date().toLocaleTimeString('hi-IN', { hour: '2-digit', minute: '2-digit' });

        if (role === 'bot') {
            const rawText = text.replace(/<[^>]*>?/gm, '').replace(/[*#]/g, ''); // Remove HTML tags and markdown symbols for speech
            bubble.innerHTML = `
                <div class="bubble-avatar"><i class="fa-solid fa-robot"></i></div>
                <div class="bubble-content ${isError ? 'error-bubble' : ''}">
                    ${formatBotMessage(text)}
                    <button class="tts-btn" title="Listen to response">
                        <i class="fa-solid fa-volume-high"></i>
                    </button>
                </div>
                <span class="bubble-time">${now}</span>
            `;
            const btn = bubble.querySelector('.tts-btn');
            if (btn) {
                btn.addEventListener('click', function() {
                    playVoice(rawText, this);
                });
            }
        } else {
            let imgHtml = '';
            if (imageData) {
                imgHtml = `<img src="${imageData}" class="chat-image" alt="Uploaded Image">`;
            }
            bubble.innerHTML = `
                <div class="bubble-avatar user-av"><i class="fa-solid fa-user"></i></div>
                <div class="bubble-content">${imgHtml}${escapeHtml(text)}</div>
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
    // EVENT LISTENERS & IMAGE UPLOAD
    // ==============================
    function checkInputState() {
        sendBtn.disabled = !(chatInput.value.trim() || currentImageData);
    }

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
        chatInput.addEventListener('input', checkInputState);
    }

    if (uploadBtn && imageUpload) {
        uploadBtn.addEventListener('click', () => imageUpload.click());
        
        imageUpload.addEventListener('change', function() {
            const file = this.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    currentImageData = e.target.result;
                    if (imagePreview && imagePreviewContainer) {
                        imagePreview.src = currentImageData;
                        imagePreviewContainer.style.display = 'flex';
                    }
                    checkInputState();
                }
                reader.readAsDataURL(file);
            }
        });
    }

    if (removeImageBtn) {
        removeImageBtn.addEventListener('click', () => {
            currentImageData = null;
            if (imageUpload) imageUpload.value = '';
            if (imagePreviewContainer) imagePreviewContainer.style.display = 'none';
            checkInputState();
        });
    }

    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            if (!confirm('Clear this chat?')) return;
            // Clear server session
            fetch('/chatbot/clear', { 
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ session_id: window.ACTIVE_SESSION_ID })
            }).then(() => {
                window.location.href = '/chatbot'; // Reload to start fresh
            }).catch(() => {});
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

    // Session handling is now purely server-side with ACTIVE_SESSION_ID

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
window.playVoice = function(text, btnElement) {
    if (!window.speechSynthesis) return;

    if (btnElement && btnElement.classList.contains('playing')) {
        window.speechSynthesis.cancel();
        return;
    }

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();
    
    // Reset all buttons
    document.querySelectorAll('.tts-btn').forEach(btn => {
        btn.classList.remove('playing');
        const icon = btn.querySelector('i');
        if (icon) icon.className = 'fa-solid fa-volume-high';
    });

    if (btnElement) {
        btnElement.classList.add('playing');
        const icon = btnElement.querySelector('i');
        if (icon) icon.className = 'fa-solid fa-spinner fa-spin'; // Loading state
    }

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
    
    utterance.onstart = function() {
        if (btnElement) {
            const icon = btnElement.querySelector('i');
            if (icon) icon.className = 'fa-solid fa-stop';
        }
    };
    
    utterance.onend = function() {
        if (btnElement) {
            btnElement.classList.remove('playing');
            const icon = btnElement.querySelector('i');
            if (icon) icon.className = 'fa-solid fa-volume-high';
        }
    };

    utterance.onerror = function() {
        if (btnElement) {
            btnElement.classList.remove('playing');
            const icon = btnElement.querySelector('i');
            if (icon) icon.className = 'fa-solid fa-volume-high';
        }
    };
    
    window.speechSynthesis.speak(utterance);
};
