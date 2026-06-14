/* =====================================================
   animations.js — Scroll/Fade/Hover Animations
   ===================================================== */

'use strict';

// ==============================
// INTERSECTION OBSERVER — Scroll Reveal
// ==============================
(function initScrollReveal() {
    const revealEls = document.querySelectorAll('.fade-in-up');

    if (!revealEls.length) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.12,
        rootMargin: '0px 0px -40px 0px'
    });

    revealEls.forEach(el => {
        // Set initial state if not already animated by CSS
        if (!el.classList.contains('animated')) {
            el.style.opacity = '0';
            el.style.transform = 'translateY(24px)';
            el.style.transition = 'opacity 0.55s ease, transform 0.55s ease';
            const delay = el.classList.contains('delay-1') ? '0.12s' :
                          el.classList.contains('delay-2') ? '0.24s' :
                          el.classList.contains('delay-3') ? '0.36s' :
                          el.classList.contains('delay-4') ? '0.48s' : '0s';
            el.style.transitionDelay = delay;
        }
        observer.observe(el);
    });
})();


// ==============================
// COUNTER ANIMATION (numbers counting up)
// ==============================
window.animateCounters = function (selector = '.stat-num') {
    const counters = document.querySelectorAll(selector);
    if (!counters.length) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            const el = entry.target;
            const target = parseInt(el.dataset.target, 10);
            if (isNaN(target)) return;

            let count = 0;
            const duration = 1800; // ms
            const steps = 60;
            const increment = target / steps;
            const interval = duration / steps;

            const timer = setInterval(() => {
                count += increment;
                if (count >= target) {
                    el.textContent = target.toLocaleString('en-IN');
                    clearInterval(timer);
                } else {
                    el.textContent = Math.floor(count).toLocaleString('en-IN');
                }
            }, interval);

            observer.unobserve(el);
        });
    }, { threshold: 0.5 });

    counters.forEach(el => observer.observe(el));
};

// Auto-init counters on page load
animateCounters();


// ==============================
// PROGRESS BAR FILL ANIMATION
// ==============================
(function animateProgressBars() {
    const bars = document.querySelectorAll('.progress-fill, .confidence-fill-bar');
    if (!bars.length) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            const bar = entry.target;
            const targetWidth = bar.style.width;
            bar.style.width = '0%';
            requestAnimationFrame(() => {
                setTimeout(() => {
                    bar.style.width = targetWidth;
                }, 100);
            });
            observer.unobserve(bar);
        });
    }, { threshold: 0.3 });

    bars.forEach(bar => observer.observe(bar));
})();


// ==============================
// CARD HOVER 3D TILT (desktop only)
// ==============================
(function initCardTilt() {
    if (window.matchMedia('(hover: none)').matches) return; // Skip on touch devices

    const cards = document.querySelectorAll('.service-card, .testimonial-card, .machinery-card');
    const MAX_TILT = 6;

    cards.forEach(card => {
        card.addEventListener('mousemove', e => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const cx = rect.width / 2;
            const cy = rect.height / 2;
            const tiltX = ((y - cy) / cy) * MAX_TILT;
            const tiltY = ((cx - x) / cx) * MAX_TILT;
            card.style.transform = `perspective(800px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) translateY(-4px)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = '';
        });
    });
})();


// ==============================
// RIPPLE EFFECT ON BUTTONS
// ==============================
(function initRipple() {
    document.querySelectorAll('.btn-krishi-primary, .btn-krishi-secondary').forEach(btn => {
        btn.style.position = 'relative';
        btn.style.overflow = 'hidden';

        btn.addEventListener('click', function (e) {
            const rect = this.getBoundingClientRect();
            const ripple = document.createElement('span');
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;

            ripple.style.cssText = `
                position: absolute;
                width: ${size}px;
                height: ${size}px;
                left: ${x}px;
                top: ${y}px;
                background: rgba(255,255,255,0.3);
                border-radius: 50%;
                transform: scale(0);
                animation: rippleAnim 0.5s ease-out;
                pointer-events: none;
            `;

            // Add ripple keyframes if not present
            if (!document.getElementById('rippleStyle')) {
                const style = document.createElement('style');
                style.id = 'rippleStyle';
                style.textContent = `
                    @keyframes rippleAnim {
                        to { transform: scale(3); opacity: 0; }
                    }
                `;
                document.head.appendChild(style);
            }

            this.appendChild(ripple);
            setTimeout(() => ripple.remove(), 600);
        });
    });
})();


// ==============================
// STAGGER ANIMATION FOR GRIDS
// ==============================
(function staggerGridItems() {
    const grids = document.querySelectorAll('.services-grid, .market-grid, .machinery-grid, .schemes-grid');

    grids.forEach(grid => {
        const items = grid.querySelectorAll(':scope > *');
        items.forEach((item, i) => {
            item.style.animationDelay = `${i * 0.07}s`;
        });
    });
})();


// ==============================
// SMOOTH PAGE TRANSITIONS
// ==============================
(function initPageTransitions() {
    // Add transition effect when navigating away
    document.querySelectorAll('a').forEach(link => {
        // Only internal links, not anchors
        if (link.href && link.origin === window.location.origin && !link.href.includes('#') && link.target !== '_blank') {
            link.addEventListener('click', function (e) {
                // Don't intercept if modifier keys held
                if (e.metaKey || e.ctrlKey || e.shiftKey) return;
                // Simple: let browser handle it — Flask handles routing
            });
        }
    });
})();


// ==============================
// FLOATING BUTTON HIDE ON SCROLL UP
// ==============================
(function floatingButtonBehavior() {
    const aiBtn = document.getElementById('floatingAI');
    const voiceBtn = document.getElementById('floatingVoice');
    let lastScroll = 0;

    window.addEventListener('scroll', () => {
        const current = window.scrollY;
        if (current > lastScroll && current > 200) {
            // Scrolling down — minimize
            if (aiBtn) { aiBtn.style.transform = 'translateY(8px)'; aiBtn.style.opacity = '0.7'; }
            if (voiceBtn) { voiceBtn.style.opacity = '0.7'; }
        } else {
            // Scrolling up — show fully
            if (aiBtn) { aiBtn.style.transform = ''; aiBtn.style.opacity = '1'; }
            if (voiceBtn) { voiceBtn.style.opacity = '1'; }
        }
        lastScroll = current;
    }, { passive: true });
})();
