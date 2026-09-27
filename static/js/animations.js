/**
 * FURNITURELAND ATELIER - KINETIC MOTION & CRAZY ANIMATIONS SUITE
 * Inspired by pbakaus/impeccable + leonxlnx/taste-skill
 * Motion Intensity: 8/10 | Variance: 8/10 | Density: 3/10
 * High-performance 60fps GPU-accelerated motion system.
 */

(function () {
    'use strict';

    // Respect user's accessibility preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isTouchDevice = window.matchMedia('(pointer: coarse)').matches;

    document.addEventListener('DOMContentLoaded', function () {
        initCustomCursor();
        initScrollReveals();
        initNavbarPhysics();
        init3DCardTilt();
        initMagneticButtons();
        initHeroSpotlight();
        initKineticCartAnimation();
        initSwatchMorphEffects();
        initSmoothPageEnter();
    });

    /**
     * 1. MINIMALIST LUXURY CURSOR & TRAILING AURA (Desktop only)
     */
    function initCustomCursor() {
        if (isTouchDevice || prefersReducedMotion) return;

        const dot = document.createElement('div');
        dot.className = 'atelier-cursor-dot';
        const ring = document.createElement('div');
        ring.className = 'atelier-cursor-ring';

        document.body.appendChild(dot);
        document.body.appendChild(ring);

        let mouseX = window.innerWidth / 2;
        let mouseY = window.innerHeight / 2;
        let ringX = mouseX;
        let ringY = mouseY;

        window.addEventListener('mousemove', function (e) {
            mouseX = e.clientX;
            mouseY = e.clientY;
            dot.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`;
        });

        // Smooth spring interpolation for the follower ring
        function animateCursor() {
            ringX += (mouseX - ringX) * 0.15;
            ringY += (mouseY - ringY) * 0.15;
            ring.style.transform = `translate3d(${ringX}px, ${ringY}px, 0)`;
            requestAnimationFrame(animateCursor);
        }
        animateCursor();

        // Enlarge cursor on interactive elements
        const interactives = 'a, button, .swatch-item, input, .spec-accordion-header, .floating-product-card';
        document.addEventListener('mouseover', function (e) {
            if (e.target.closest(interactives)) {
                ring.classList.add('active');
                dot.classList.add('active');
            }
        });

        document.addEventListener('mouseout', function (e) {
            if (e.target.closest(interactives)) {
                ring.classList.remove('active');
                dot.classList.remove('active');
            }
        });

        document.addEventListener('mousedown', function () {
            ring.classList.add('clicking');
        });

        document.addEventListener('mouseup', function () {
            ring.classList.remove('clicking');
        });
    }

    /**
     * 2. SCROLL REVEALS & INTERSECTION STAGGER
     */
    function initScrollReveals() {
        if (prefersReducedMotion) return;

        // Auto-assign reveal classes to cards and sections
        const targetElements = document.querySelectorAll(
            '.floating-product-card, .hero-floating-products, .atelier-badge, .spec-accordion-item, .box-element, section h2, section .row > div'
        );

        targetElements.forEach((el, idx) => {
            if (!el.classList.contains('no-reveal')) {
                el.classList.add('kinetic-reveal');
                // Stagger delay based on sibling index
                const delay = (idx % 4) * 80;
                el.style.transitionDelay = `${delay}ms`;
            }
        });

        const observer = new IntersectionObserver((entries, obs) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    obs.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.12,
            rootMargin: '0px 0px -40px 0px'
        });

        document.querySelectorAll('.kinetic-reveal').forEach(el => observer.observe(el));
    }

    /**
     * 3. FLOATING ISLAND NAVBAR SCROLL PHYSICS
     */
    function initNavbarPhysics() {
        const navbar = document.querySelector('.navbar-island');
        if (!navbar) return;

        let lastScrollY = window.scrollY;

        function updateNavbar() {
            const currentScrollY = window.scrollY;

            if (currentScrollY > 40) {
                navbar.classList.add('navbar-scrolled');
            } else {
                navbar.classList.remove('navbar-scrolled');
            }

            lastScrollY = currentScrollY;
        }

        window.addEventListener('scroll', updateNavbar, { passive: true });
        updateNavbar();
    }

    /**
     * 4. CRAZY 3D PERSPECTIVE TILT ON CARDS & SHOWCASE
     * Physics-based tilt with specular dynamic light reflection
     */
    function init3DCardTilt() {
        if (isTouchDevice || prefersReducedMotion) return;

        const tiltCards = document.querySelectorAll('.floating-product-card, .detail-gallery-box, .hero-mockup-card');

        tiltCards.forEach(card => {
            // Create specular highlight overlay
            const glare = document.createElement('div');
            glare.className = 'card-specular-glare';
            card.appendChild(glare);

            let isHovering = false;
            let bounds = null;

            card.addEventListener('mouseenter', () => {
                isHovering = true;
                bounds = card.getBoundingClientRect();
                card.style.transition = 'transform 0.12s ease-out, box-shadow 0.3s ease';
            });

            card.addEventListener('mousemove', (e) => {
                if (!isHovering || !bounds) return;

                const mouseX = e.clientX - bounds.left;
                const mouseY = e.clientY - bounds.top;

                const percentX = (mouseX / bounds.width) * 2 - 1; // -1 to 1
                const percentY = (mouseY / bounds.height) * 2 - 1; // -1 to 1

                // Subtle organic max tilt: 7 degrees
                const maxTilt = card.classList.contains('hero-mockup-card') ? 2.5 : 7;
                const rotateX = -percentY * maxTilt;
                const rotateY = percentX * maxTilt;

                card.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translate3d(0, -6px, 12px)`;

                // Update glare position
                const glareX = (mouseX / bounds.width) * 100;
                const glareY = (mouseY / bounds.height) * 100;
                glare.style.opacity = '1';
                glare.style.background = `radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0.08) 50%, transparent 80%)`;
            });

            card.addEventListener('mouseleave', () => {
                isHovering = false;
                card.style.transition = 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.6s ease';
                card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translate3d(0, 0, 0)';
                glare.style.opacity = '0';
            });
        });
    }

    /**
     * 5. MAGNETIC BUTTON PHYSICS
     * Luxury buttons pull toward the cursor when hovering nearby
     */
    function initMagneticButtons() {
        if (isTouchDevice || prefersReducedMotion) return;

        const magneticEls = document.querySelectorAll('.btn-luxury, .btn-luxury-outline, .cart-wrapper');

        magneticEls.forEach(el => {
            let bounds = null;

            el.addEventListener('mouseenter', () => {
                bounds = el.getBoundingClientRect();
                el.style.transition = 'transform 0.15s ease-out';
            });

            el.addEventListener('mousemove', (e) => {
                if (!bounds) bounds = el.getBoundingClientRect();
                const centerX = bounds.left + bounds.width / 2;
                const centerY = bounds.top + bounds.height / 2;

                const deltaX = (e.clientX - centerX) * 0.28;
                const deltaY = (e.clientY - centerY) * 0.28;

                el.style.transform = `translate3d(${deltaX}px, ${deltaY}px, 0)`;
            });

            el.addEventListener('mouseleave', () => {
                bounds = null;
                el.style.transition = 'transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
                el.style.transform = 'translate3d(0, 0, 0)';
            });
        });
    }

    /**
     * 6. AMBIENT HERO SPOTLIGHT & LIGHTING
     */
    function initHeroSpotlight() {
        if (isTouchDevice || prefersReducedMotion) return;

        const hero = document.querySelector('.hero-mockup-card');
        if (!hero) return;

        const spotlight = document.createElement('div');
        spotlight.className = 'hero-interactive-spotlight';
        hero.appendChild(spotlight);

        hero.addEventListener('mousemove', (e) => {
            const rect = hero.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            spotlight.style.transform = `translate3d(${x - 300}px, ${y - 300}px, 0)`;
            spotlight.style.opacity = '0.65';
        });

        hero.addEventListener('mouseleave', () => {
            spotlight.style.opacity = '0';
        });
    }

    /**
     * 7. KINETIC ADD-TO-BAG FLYING PARTICLE ANIMATION
     */
    function initKineticCartAnimation() {
        const updateCartButtons = document.querySelectorAll('.update-cart');
        const cartIcon = document.querySelector('.cart-wrapper');

        updateCartButtons.forEach(btn => {
            btn.addEventListener('click', function (e) {
                // Button micro-press shockwave
                createShockwave(btn, e);

                if (!cartIcon || prefersReducedMotion) return;

                // Create a floating kinetic orb that flies into the cart
                const btnRect = btn.getBoundingClientRect();
                const cartRect = cartIcon.getBoundingClientRect();

                const orb = document.createElement('div');
                orb.className = 'kinetic-cart-particle';
                orb.innerHTML = '<i class="fas fa-gem" style="font-size: 11px;"></i>';
                document.body.appendChild(orb);

                const startX = btnRect.left + btnRect.width / 2;
                const startY = btnRect.top + btnRect.height / 2;
                const endX = cartRect.left + cartRect.width / 2;
                const endY = cartRect.top + cartRect.height / 2;

                orb.style.left = `${startX}px`;
                orb.style.top = `${startY}px`;

                // Calculate bezier control point
                const midX = (startX + endX) / 2 - 40;
                const midY = Math.min(startY, endY) - 80;

                const startTime = performance.now();
                const duration = 650; // ms

                function fly(currentTime) {
                    const elapsed = currentTime - startTime;
                    const progress = Math.min(elapsed / duration, 1);

                    // Quadratic bezier interpolation
                    const t = easeOutCubic(progress);
                    const currentX = (1 - t) * (1 - t) * startX + 2 * (1 - t) * t * midX + t * t * endX;
                    const currentY = (1 - t) * (1 - t) * startY + 2 * (1 - t) * t * midY + t * t * endY;
                    const scale = 1 + Math.sin(progress * Math.PI) * 0.4 - progress * 0.4;
                    const opacity = 1 - Math.pow(progress, 3);

                    orb.style.transform = `translate3d(${currentX - startX}px, ${currentY - startY}px, 0) scale(${scale})`;
                    orb.style.opacity = `${opacity}`;

                    if (progress < 1) {
                        requestAnimationFrame(fly);
                    } else {
                        orb.remove();
                        // Cart bounce spring effect
                        triggerCartBounce(cartIcon);
                    }
                }

                requestAnimationFrame(fly);
            });
        });
    }

    function createShockwave(target, e) {
        const rect = target.getBoundingClientRect();
        const wave = document.createElement('span');
        wave.className = 'kinetic-shockwave';
        const size = Math.max(rect.width, rect.height) * 1.5;
        wave.style.width = wave.style.height = `${size}px`;
        wave.style.left = `${e.clientX - rect.left - size / 2}px`;
        wave.style.top = `${e.clientY - rect.top - size / 2}px`;
        target.appendChild(wave);

        setTimeout(() => wave.remove(), 600);
    }

    function triggerCartBounce(cartIcon) {
        cartIcon.classList.remove('cart-bounce-spring');
        void cartIcon.offsetWidth; // trigger reflow
        cartIcon.classList.add('cart-bounce-spring');

        const badge = cartIcon.querySelector('#cart-total');
        if (badge) {
            badge.classList.remove('badge-pop-spring');
            void badge.offsetWidth;
            badge.classList.add('badge-pop-spring');
        }
    }

    function easeOutCubic(x) {
        return 1 - Math.pow(1 - x, 3);
    }

    /**
     * 8. INTERACTIVE COLOR SWATCH RIPPLE MORPH
     */
    function initSwatchMorphEffects() {
        const swatches = document.querySelectorAll('.swatch-item');
        const mainImg = document.getElementById('main-product-image');

        if (!swatches.length || !mainImg) return;

        swatches.forEach(swatch => {
            swatch.addEventListener('click', function () {
                // Add soft expanding ring wave
                const circle = swatch.querySelector('.swatch-circle');
                if (circle) {
                    const wave = document.createElement('div');
                    wave.className = 'swatch-ripple-ring';
                    circle.appendChild(wave);
                    setTimeout(() => wave.remove(), 600);
                }

                // Smooth cinematic zoom burst on image
                mainImg.classList.add('image-color-shifting');
                setTimeout(() => {
                    mainImg.classList.remove('image-color-shifting');
                }, 400);
            });
        });
    }

    /**
     * 9. SMOOTH ATELIER PAGE ENTRANCE
     */
    function initSmoothPageEnter() {
        document.body.classList.add('page-loaded');
    }

})();
