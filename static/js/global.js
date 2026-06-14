/* =====================================================
   global.js — Krishi AI Common Interactions
   ===================================================== */

'use strict';

// ==============================
// NAVBAR SCROLL + HAMBURGER
// ==============================
(function initNavbar() {
    const navbar = document.getElementById('mainNavbar');
    const hamburger = document.getElementById('hamburger');
    const navLinks = document.getElementById('navLinks');
    const navOverlay = document.getElementById('navOverlay');

    // Scroll shadow
    window.addEventListener('scroll', () => {
        if (!navbar) return;
        navbar.classList.toggle('scrolled', window.scrollY > 20);
    }, { passive: true });

    // Mobile hamburger toggle
    if (hamburger && navLinks && navOverlay) {
        hamburger.addEventListener('click', () => {
            const isOpen = navLinks.classList.toggle('open');
            hamburger.classList.toggle('open', isOpen);
            navOverlay.classList.toggle('open', isOpen);
            document.body.style.overflow = isOpen ? 'hidden' : '';
        });

        navOverlay.addEventListener('click', closeNav);

        // Close on nav link click (mobile)
        navLinks.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', closeNav);
        });
    }

    function closeNav() {
        if (!navLinks) return;
        navLinks.classList.remove('open');
        if (hamburger) hamburger.classList.remove('open');
        if (navOverlay) navOverlay.classList.remove('open');
        document.body.style.overflow = '';
    }
})();


// ==============================
// TOAST NOTIFICATION SYSTEM
// ==============================
window.KrishiToast = {
    container: null,

    init() {
        if (!this.container) {
            this.container = document.createElement('div');
            this.container.id = 'toastContainer';
            this.container.style.cssText = `
                position: fixed; top: 80px; right: 1rem; z-index: 9999;
                display: flex; flex-direction: column; gap: 0.5rem;
                pointer-events: none;
            `;
            document.body.appendChild(this.container);
        }
    },

    show(message, type = 'success', duration = 3000) {
        this.init();
        const icons = { success: 'fa-check-circle', error: 'fa-times-circle', warning: 'fa-exclamation-triangle', info: 'fa-info-circle' };
        const colors = { success: '#43A047', error: '#E53935', warning: '#F9A825', info: '#1E88E5' };

        const toast = document.createElement('div');
        toast.style.cssText = `
            background: #fff; border-left: 4px solid ${colors[type]};
            border-radius: 12px; padding: 0.75rem 1rem;
            box-shadow: 0 4px 20px rgba(0,0,0,0.12);
            display: flex; align-items: center; gap: 0.6rem;
            font-size: 0.88rem; font-family: var(--font-primary);
            color: #1B1B1B; font-weight: 500;
            pointer-events: all;
            animation: slideIn 0.3s ease; max-width: 300px;
        `;
        toast.innerHTML = `<i class="fa-solid ${icons[type]}" style="color:${colors[type]}; font-size: 1rem;"></i> ${message}`;
        this.container.appendChild(toast);

        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transition = 'opacity 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, duration);
    }
};


// ==============================
// FORM SUBMIT LOADING STATE
// ==============================
document.querySelectorAll('form').forEach(form => {
    form.addEventListener('submit', function (e) {
        const submitBtn = this.querySelector('[type="submit"]');
        if (!submitBtn) return;

        // Store original
        submitBtn.dataset.original = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Processing...';
        submitBtn.disabled = true;

        // Re-enable after 10s failsafe
        setTimeout(() => {
            if (submitBtn.dataset.original) {
                submitBtn.innerHTML = submitBtn.dataset.original;
                submitBtn.disabled = false;
            }
        }, 10000);
    });
});


// ==============================
// FLASH MESSAGES AUTO-DISMISS
// ==============================
document.querySelectorAll('.flash-message').forEach(msg => {
    setTimeout(() => {
        msg.style.opacity = '0';
        msg.style.transition = 'opacity 0.5s ease';
        setTimeout(() => msg.remove(), 500);
    }, 4000);
});


// ==============================
// ACTIVE NAV HIGHLIGHT
// ==============================
(function highlightActiveNav() {
    const currentPath = window.location.pathname;
    document.querySelectorAll('.nav-link, .mobile-nav-item').forEach(link => {
        const href = link.getAttribute('href');
        if (href && currentPath === href) {
            link.classList.add('active');
        }
    });
})();


// ==============================
// SMOOTH SCROLL TO ANCHORS
// ==============================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            e.preventDefault();
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
});


// ==============================
// LAZY IMAGE LOADING
// ==============================
if ('IntersectionObserver' in window) {
    const imgObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                if (img.dataset.src) {
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                }
                imgObserver.unobserve(img);
            }
        });
    }, { rootMargin: '100px' });

    document.querySelectorAll('img[data-src]').forEach(img => imgObserver.observe(img));
}


// ==============================
// SERVICE WORKER (PWA)
// ==============================
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/static/sw.js').catch(() => {});
    });
}


// ==============================
// UTILITY FUNCTIONS
// ==============================
window.KrishiUtils = {
    // Format Indian numbers
    formatINR(num) {
        return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(num);
    },

    // Debounce
    debounce(fn, wait = 300) {
        let timer;
        return function (...args) {
            clearTimeout(timer);
            timer = setTimeout(() => fn.apply(this, args), wait);
        };
    },

    // Format date in Hindi
    formatHindiDate(date = new Date()) {
        return date.toLocaleDateString('hi-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    },

    // Copy to clipboard
    copyToClipboard(text) {
        navigator.clipboard.writeText(text).then(() => {
            KrishiToast.show('Copy हो गया!', 'success');
        });
    }
};
