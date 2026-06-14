/* =====================================================
   upload.js — Drag & Drop, Image Preview, Upload UI
   ===================================================== */

'use strict';

(function initUpload() {

    const dropZone   = document.getElementById('dropZone');
    const dropInner  = document.getElementById('dropInner');
    const previewWrap = document.getElementById('previewWrap');
    const imgPreview  = document.getElementById('imagePreview');
    const removeBtn   = document.getElementById('removeImage');
    const fileInput   = document.querySelector('[type="file"]#cropImage, [type="file"]#soilImage');
    const form        = document.getElementById('diseaseForm') || document.getElementById('soilForm');
    const analyzeBtn  = document.getElementById('analyzeBtn');
    const analyzingCard = document.getElementById('analyzingCard');

    if (!dropZone) return;

    // ==============================
    // FILE INPUT CHANGE
    // ==============================
    if (fileInput) {
        fileInput.addEventListener('change', function () {
            if (this.files && this.files[0]) {
                handleFile(this.files[0]);
            }
        });
    }

    // ==============================
    // DRAG & DROP
    // ==============================
    ['dragenter', 'dragover'].forEach(event => {
        dropZone.addEventListener(event, e => {
            e.preventDefault();
            e.stopPropagation();
            dropZone.classList.add('drag-over');
        });
    });

    ['dragleave', 'drop'].forEach(event => {
        dropZone.addEventListener(event, e => {
            e.preventDefault();
            e.stopPropagation();
            dropZone.classList.remove('drag-over');
        });
    });

    dropZone.addEventListener('drop', e => {
        const files = e.dataTransfer.files;
        if (files && files[0]) {
            // Validate file type
            if (!files[0].type.startsWith('image/')) {
                KrishiToast.show('कृपया सिर्फ Image file चुनें', 'error');
                return;
            }
            handleFile(files[0]);
            // Also assign to file input for form submission
            const dt = new DataTransfer();
            dt.items.add(files[0]);
            if (fileInput) fileInput.files = dt.files;
        }
    });

    // ==============================
    // HANDLE FILE
    // ==============================
    function handleFile(file) {
        if (!file.type.startsWith('image/')) {
            KrishiToast.show('Invalid file type. Please upload an image.', 'error');
            return;
        }

        // Check file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
            KrishiToast.show('File बहुत बड़ा है। Max 10MB allowed.', 'warning');
            return;
        }

        const reader = new FileReader();
        reader.onload = e => {
            if (imgPreview) imgPreview.src = e.target.result;
            if (previewWrap) previewWrap.style.display = 'block';
            if (dropInner) dropInner.style.display = 'none';
            KrishiToast.show('Photo ready! अब Analyze करें।', 'success');
        };
        reader.readAsDataURL(file);
    }

    // ==============================
    // REMOVE IMAGE
    // ==============================
    if (removeBtn) {
        removeBtn.addEventListener('click', () => {
            if (imgPreview) imgPreview.src = '';
            if (previewWrap) previewWrap.style.display = 'none';
            if (dropInner) dropInner.style.display = 'flex';
            if (fileInput) fileInput.value = '';
        });
    }

    // ==============================
    // FORM SUBMIT — SHOW ANALYZING
    // ==============================
    if (form) {
        form.addEventListener('submit', function (e) {
            // Validate image
            if (!fileInput || !fileInput.files || !fileInput.files[0]) {
                if (!imgPreview || !imgPreview.src) {
                    e.preventDefault();
                    KrishiToast.show('पहले Photo upload करें!', 'warning');
                    return;
                }
            }

            // Show analyzing card
            if (analyzingCard) {
                analyzingCard.style.display = 'block';
                analyzingCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }

            // Animate step dots
            if (analyzingCard) {
                const dots = analyzingCard.querySelectorAll('.step-dot');
                let dotIndex = 0;
                const dotTimer = setInterval(() => {
                    dots.forEach(d => d.classList.remove('active'));
                    if (dots[dotIndex]) dots[dotIndex].classList.add('active');
                    dotIndex = (dotIndex + 1) % dots.length;
                }, 800);

                // Clear timer when page unloads
                window.addEventListener('beforeunload', () => clearInterval(dotTimer));
            }

            // Update button state
            if (analyzeBtn) {
                analyzeBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> जांच हो रही है...';
                analyzeBtn.disabled = true;
            }
        });
    }


    // ==============================
    // CAMERA CAPTURE HINT (mobile)
    // ==============================
    function isMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }

    if (isMobile() && fileInput) {
        // Mobile: prefer camera capture
        const label = dropZone.querySelector('.upload-btn');
        if (label) {
            label.innerHTML = '<i class="fa-solid fa-camera"></i> Camera से Photo लें';
        }
    }


    // ==============================
    // IMAGE QUALITY HINT
    // ==============================
    if (fileInput) {
        fileInput.addEventListener('change', function () {
            const file = this.files[0];
            if (!file) return;

            // Warn about very small files (likely low quality)
            if (file.size < 20 * 1024) { // < 20KB
                setTimeout(() => {
                    KrishiToast.show('Photo की quality कम लग रही है। Better result के लिए साफ photo लें।', 'warning', 4000);
                }, 500);
            }
        });
    }

})();


// ==============================
// AVATAR UPLOAD PREVIEW (profile page)
// ==============================
(function initAvatarUpload() {
    const avatarInput = document.getElementById('avatarInput');
    const avatarPreview = document.getElementById('avatarPreview');

    if (!avatarInput || !avatarPreview) return;

    avatarInput.addEventListener('change', function () {
        if (!this.files || !this.files[0]) return;
        const reader = new FileReader();
        reader.onload = e => {
            avatarPreview.innerHTML = `<img src="${e.target.result}" alt="Profile Photo" style="width:100%;height:100%;object-fit:cover;">`;
        };
        reader.readAsDataURL(this.files[0]);
    });
})();
