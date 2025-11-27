class HYJewelry {
    constructor() {
        this.cursor = document.getElementById('cursor');
        this.cursorFollower = document.getElementById('cursor-follower');
        this.mouseX = 0;
        this.mouseY = 0;
        this.cursorX = 0;
        this.cursorY = 0;
        this.followerX = 0;
        this.followerY = 0;
        
        this.init();
    }

    init() {
        this.setupCursor();
        this.setupMagneticButtons();
        this.setupNavigation();
        this.setupScrollEffects();
        this.setupContactForm();
        this.preloadImages();
        
        // Initialize after DOM is loaded
        window.addEventListener('load', () => {
            this.hideLoading();
            this.startAnimations();
        });
    }

    setupCursor() {
        if (window.innerWidth <= 768) return; // Skip on mobile
        
        document.addEventListener('mousemove', (e) => {
            this.mouseX = e.clientX;
            this.mouseY = e.clientY;
        });

        // Animate cursor
        const animateCursor = () => {
            // Main cursor (instant)
            this.cursorX = this.mouseX;
            this.cursorY = this.mouseY;
            
            // Follower cursor (smooth)
            this.followerX += (this.mouseX - this.followerX) * 0.1;
            this.followerY += (this.mouseY - this.followerY) * 0.1;
            
            if (this.cursor) {
                this.cursor.style.transform = `translate(${this.cursorX - 4}px, ${this.cursorY - 4}px)`;
            }
            
            if (this.cursorFollower) {
                this.cursorFollower.style.transform = `translate(${this.followerX - 16}px, ${this.followerY - 16}px)`;
            }
            
            requestAnimationFrame(animateCursor);
        };
        
        animateCursor();

        // Hover effects
        const hoverElements = document.querySelectorAll('a, button, .collection-item, .magnetic-btn');
        hoverElements.forEach(el => {
            el.addEventListener('mouseenter', () => {
                document.body.classList.add('cursor-hover');
            });
            
            el.addEventListener('mouseleave', () => {
                document.body.classList.remove('cursor-hover');
            });
        });
    }

    setupMagneticButtons() {
        if (window.innerWidth <= 768) return; // Skip on mobile
        
        const magneticBtns = document.querySelectorAll('.magnetic-btn');
        
        magneticBtns.forEach(btn => {
            btn.addEventListener('mouseenter', (e) => {
                gsap.to(btn, {
                    duration: 0.3,
                    scale: 1.05,
                    ease: "power2.out"
                });
            });
            
            btn.addEventListener('mouseleave', (e) => {
                gsap.to(btn, {
                    duration: 0.3,
                    scale: 1,
                    x: 0,
                    y: 0,
                    ease: "power2.out"
                });
            });
            
            btn.addEventListener('mousemove', (e) => {
                const rect = btn.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;
                
                gsap.to(btn, {
                    duration: 0.3,
                    x: x * 0.3,
                    y: y * 0.3,
                    ease: "power2.out"
                });
            });
        });
    }

    setupNavigation() {
        // Smooth scroll for navigation links
        const navLinks = document.querySelectorAll('a[href^="#"]');
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href');
                const targetElement = document.querySelector(targetId);
                
                if (targetElement) {
                    const offsetTop = targetElement.getBoundingClientRect().top + window.pageYOffset - 80;
                    
                    gsap.to(window, {
                        duration: 1.5,
                        scrollTo: offsetTop,
                        ease: "power2.inOut"
                    });
                }
            });
        });

        // Navigation background on scroll
        gsap.to("nav", {
            backgroundColor: "rgba(0, 0, 0, 0.95)",
            scrollTrigger: {
                trigger: "body",
                start: "100px top",
                end: "bottom bottom",
                scrub: true
            }
        });
    }

    setupScrollEffects() {
        // Parallax effect for hero section
        gsap.to(".hero-content", {
            yPercent: -50,
            ease: "none",
            scrollTrigger: {
                trigger: "#hero",
                start: "top top",
                end: "bottom top",
                scrub: 1
            }
        });

        // Section animations
        const sections = document.querySelectorAll('section:not(#hero)');
        sections.forEach((section, index) => {
            gsap.fromTo(section, 
                {
                    y: 100,
                    opacity: 0
                },
                {
                    y: 0,
                    opacity: 1,
                    duration: 1.5,
                    ease: "power2.out",
                    scrollTrigger: {
                        trigger: section,
                        start: "top 80%",
                        end: "top 20%",
                        toggleActions: "play none none reverse"
                    }
                }
            );
        });

        // Collection items stagger animation
        const collectionItems = document.querySelectorAll('.collection-item');
        gsap.fromTo(collectionItems,
            {
                y: 80,
                opacity: 0,
                scale: 0.9
            },
            {
                y: 0,
                opacity: 1,
                scale: 1,
                duration: 1,
                stagger: 0.2,
                ease: "power2.out",
                scrollTrigger: {
                    trigger: "#collections",
                    start: "top 70%",
                    end: "top 20%",
                    toggleActions: "play none none reverse"
                }
            }
        );

        // Feature items animation
        const featureItems = document.querySelectorAll('.feature-item');
        gsap.fromTo(featureItems,
            {
                y: 60,
                opacity: 0
            },
            {
                y: 0,
                opacity: 1,
                duration: 1,
                stagger: 0.3,
                ease: "power2.out",
                scrollTrigger: {
                    trigger: ".feature-item",
                    start: "top 80%",
                    toggleActions: "play none none reverse"
                }
            }
        );

        // Contact items animation
        const contactItems = document.querySelectorAll('.contact-item');
        gsap.fromTo(contactItems,
            {
                x: -50,
                opacity: 0
            },
            {
                x: 0,
                opacity: 1,
                duration: 1,
                stagger: 0.2,
                ease: "power2.out",
                scrollTrigger: {
                    trigger: "#contact",
                    start: "top 70%",
                    toggleActions: "play none none reverse"
                }
            }
        );

        // Parallax images
        const images = document.querySelectorAll('img');
        images.forEach(img => {
            gsap.to(img, {
                yPercent: -20,
                ease: "none",
                scrollTrigger: {
                    trigger: img,
                    start: "top bottom",
                    end: "bottom top",
                    scrub: 1
                }
            });
        });
    }

    setupContactForm() {
        const form = document.querySelector('.contact-form form');
        if (!form) return;

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const submitBtn = form.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            
            // Animate button
            gsap.to(submitBtn, {
                scale: 0.95,
                duration: 0.1,
                yoyo: true,
                repeat: 1
            });
            
            submitBtn.textContent = 'Sending...';
            submitBtn.disabled = true;
            
            // Simulate form submission
            setTimeout(() => {
                submitBtn.textContent = 'Message Sent!';
                
                setTimeout(() => {
                    submitBtn.textContent = originalText;
                    submitBtn.disabled = false;
                    form.reset();
                }, 2000);
            }, 1500);
        });

        // Form field animations
        const inputs = form.querySelectorAll('input, textarea');
        inputs.forEach(input => {
            input.addEventListener('focus', () => {
                gsap.to(input, {
                    scale: 1.02,
                    duration: 0.3,
                    ease: "power2.out"
                });
            });
            
            input.addEventListener('blur', () => {
                gsap.to(input, {
                    scale: 1,
                    duration: 0.3,
                    ease: "power2.out"
                });
            });
        });
    }

    preloadImages() {
        const images = [
            'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=600&h=600&fit=crop&crop=center',
            'https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=600&h=600&fit=crop&crop=center',
            'https://images.unsplash.com/photo-1506755855567-92ff770e8d00?w=600&h=600&fit=crop&crop=center',
            'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&h=1000&fit=crop&crop=center'
        ];

        images.forEach(src => {
            const img = new Image();
            img.src = src;
        });
    }

    hideLoading() {
        const loading = document.querySelector('.loading');
        if (loading) {
            gsap.to(loading, {
                opacity: 0,
                duration: 0.5,
                onComplete: () => {
                    loading.remove();
                }
            });
        }
    }

    startAnimations() {
        // Initial hero animation
        const tl = gsap.timeline();
        
        tl.fromTo('.hero-title',
            { y: 100, opacity: 0 },
            { y: 0, opacity: 1, duration: 1.2, ease: "power2.out" }
        )
        .fromTo('.hero-subtitle',
            { y: 50, opacity: 0 },
            { y: 0, opacity: 1, duration: 1, ease: "power2.out" },
            "-=0.5"
        )
        .fromTo('.cta-button',
            { y: 30, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.8, ease: "power2.out" },
            "-=0.3"
        )
        .fromTo('.scroll-indicator',
            { opacity: 0 },
            { opacity: 1, duration: 0.8 },
            "-=0.2"
        );

        // Logo animation
        gsap.fromTo('.logo',
            { x: -100, opacity: 0 },
            { x: 0, opacity: 1, duration: 1, ease: "power2.out", delay: 0.3 }
        );

        // Navigation links animation
        gsap.fromTo('.nav-link',
            { y: -20, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.8, stagger: 0.1, ease: "power2.out", delay: 0.5 }
        );
    }

    // Utility methods
    lerp(start, end, factor) {
        return start + (end - start) * factor;
    }

    map(value, in_min, in_max, out_min, out_max) {
        return (value - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
    }

    clamp(value, min, max) {
        return Math.min(Math.max(value, min), max);
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    const app = new HYJewelry();
});

// Handle resize events
window.addEventListener('resize', () => {
    ScrollTrigger.refresh();
});

// Performance monitoring
let fps = 0;
let lastTime = performance.now();

function trackFPS() {
    const now = performance.now();
    fps = Math.round(1000 / (now - lastTime));
    lastTime = now;
    
    // Log performance issues
    if (fps < 30) {
        console.warn('Low FPS detected:', fps);
    }
    
    requestAnimationFrame(trackFPS);
}

if (process?.env?.NODE_ENV === 'development') {
    trackFPS();
}