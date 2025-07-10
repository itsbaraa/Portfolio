document.addEventListener('DOMContentLoaded', () => {
    const navToggle = document.getElementById('navToggle');
    const navList = document.querySelector('.main-nav-list');
    if (navToggle && navList) {
        navToggle.addEventListener('click', () => {
            navToggle.classList.toggle('active');
            navList.classList.toggle('show');
        });
    }

    // Main App Object
    const App = {
        // --- Properties ---
        ticking: false,
        mouseX: 0,
        mouseY: 0,
        mouseTrail: [],

        // --- Initialization ---
        init() {
            this.setupEventListeners();
            this.setupScrollObserver();
            this.setupMouseTracking();
            this.setupMouseTrail();
            this.setupContactForm();
            this.createStarfield();
            this.animateStarfield();
            this.handleStarfieldParallax();
            this.animateHero();
            this.animateBackgroundShapes();
            this.animateProgressBars();
            this.updateScrollProgress();
            this.updateActiveNav();
            this.handleNavScroll();
            this.handleHeroParallax();

            // Section dot click scroll
            document.querySelectorAll('.section-dot').forEach(dot => {
                dot.addEventListener('click', (e) => {
                    const sectionId = dot.getAttribute('data-section');
                    const section = document.getElementById(sectionId);
                    if (section) {
                        section.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                });
            });

            // Update nav-indicator on resize
            window.addEventListener('resize', () => {
                this.updateActiveNav();
            });
        },

        // --- Event Listeners Setup ---
        setupEventListeners() {
            window.addEventListener('scroll', () => {
                if (!this.ticking) {
                    window.requestAnimationFrame(() => {
                        this.updateScrollProgress();
                        this.updateActiveNav();
                        this.handleNavScroll();
                        this.handleHeroParallax();
                        this.handleStarfieldParallax();
                        this.ticking = false;
                    });
                    this.ticking = true;
                }
            }, { passive: true });

            document.querySelectorAll('.main-nav-link').forEach(link => {
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    document.querySelector(link.getAttribute('href')).scrollIntoView({ behavior: 'smooth' });
                });
            });



            

            // Enhanced social link interactions (now part of button group)
            document.querySelectorAll('.social-link').forEach(link => {
                link.addEventListener('mouseenter', this.animateSocialLink);
                link.addEventListener('mouseleave', this.resetSocialLink);
            });

            // Skill item interactions
            document.querySelectorAll('.skill-item').forEach(item => {
                item.addEventListener('mouseenter', this.animateSkillItem);
                item.addEventListener('mouseleave', this.resetSkillItem);
            });
        },

        // --- Contact Form Setup ---
        setupContactForm() {
            const form = document.getElementById('contactForm');
            if (!form) return;

            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleFormSubmission(form);
            });

            // Add real-time validation
            const inputs = form.querySelectorAll('input, textarea');
            inputs.forEach(input => {
                input.addEventListener('blur', () => this.validateField(input));
                input.addEventListener('input', () => this.clearFieldError(input));
            });
        },

        validateField(field) {
            const value = field.value.trim();
            let isValid = true;
            let errorMessage = '';

            // Remove existing error styling
            this.clearFieldError(field);

            // Validation rules
            switch (field.type) {
                case 'email':
                    const emailRegex = /[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    if (!value) {
                        isValid = false;
                        errorMessage = 'Email is required';
                    } else if (!emailRegex.test(value)) {
                        isValid = false;
                        errorMessage = 'Please enter a valid email address';
                    }
                    break;
                case 'text':
                    if (!value) {
                        isValid = false;
                        errorMessage = `${field.name.charAt(0).toUpperCase() + field.name.slice(1)} is required`;
                    } else if (value.length < 2) {
                        isValid = false;
                        errorMessage = `${field.name.charAt(0).toUpperCase() + field.name.slice(1)} must be at least 2 characters`;
                    }
                    break;
                case 'textarea':
                    if (!value) {
                        isValid = false;
                        errorMessage = 'Message is required';
                    } else if (value.length < 10) {
                        isValid = false;
                        errorMessage = 'Message must be at least 10 characters';
                    }
                    break;
            }

            if (!isValid) {
                this.showFieldError(field, errorMessage);
            }

            return isValid;
        },

        showFieldError(field, message) {
            field.style.borderColor = '#ef4444';
            field.style.boxShadow = '0 0 0 3px rgba(239, 68, 68, 0.1)';
            
            // Create or update error message
            let errorElement = field.parentNode.querySelector('.field-error');
            if (!errorElement) {
                errorElement = document.createElement('div');
                errorElement.className = 'field-error';
                errorElement.style.cssText = `
                    color: #ef4444;
                    font-size: 0.875rem;
                    margin-top: 0.5rem;
                    animation: slideIn 0.3s ease-out;
                `;
                field.parentNode.appendChild(errorElement);
            }
            errorElement.textContent = message;
        },

        clearFieldError(field) {
            field.style.borderColor = '';
            field.style.boxShadow = '';
            const errorElement = field.parentNode.querySelector('.field-error');
            if (errorElement) {
                errorElement.remove();
            }
        },

        handleFormSubmission(form) {
            const formData = new FormData(form);
            const submitButton = form.querySelector('.submit-button');
            const originalText = submitButton.innerHTML;

            // Validate all fields
            const inputs = form.querySelectorAll('input, textarea');
            let isValid = true;
            inputs.forEach(input => {
                if (!this.validateField(input)) {
                    isValid = false;
                }
            });

            if (!isValid) {
                this.showNotification('Please fix the errors above', 'error');
                return;
            }

            // Show loading state
            submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
            submitButton.disabled = true;

            fetch('submit.php', {
                method: 'POST',
                body: formData
            })
            .then(response => {
                if (response.ok) {
                    // Reset form
                    form.reset();
                    inputs.forEach(input => this.clearFieldError(input));
                    
                    // Reset button
                    submitButton.innerHTML = originalText;
                    submitButton.disabled = false;
                    
                    // Show success message
                    this.showNotification('Message sent successfully! I\'ll get back to you soon.', 'success');
                    
                    // Animate success
                    anime({
                        targets: submitButton,
                        scale: [1, 1.1, 1],
                        duration: 600,
                        easing: 'easeInOutQuad'
                    });
                } else {
                    throw new Error('Network response was not ok.');
                }
            })
            .catch(error => {
                this.showNotification('There was an error sending your message. Please try again later.', 'error');
                // Reset button
                submitButton.innerHTML = originalText;
                submitButton.disabled = false;
            });
        },

        showNotification(message, type = 'info') {
            // Remove existing notifications
            const existingNotification = document.querySelector('.notification');
            if (existingNotification) {
                existingNotification.remove();
            }

            // Create notification element
            const notification = document.createElement('div');
            notification.className = `notification notification-${type}`;
            notification.style.cssText = `
                position: fixed;
                top: 2rem;
                right: 2rem;
                padding: 1rem 1.5rem;
                border-radius: 12px;
                color: white;
                font-weight: 600;
                z-index: 10000;
                transform: translateX(100%);
                transition: transform 0.3s ease;
                max-width: 400px;
                backdrop-filter: blur(10px);
                -webkit-backdrop-filter: blur(10px);
            `;

            // Set background based on type
            switch (type) {
                case 'success':
                    notification.style.background = 'linear-gradient(135deg, #10b981, #059669)';
                    break;
                case 'error':
                    notification.style.background = 'linear-gradient(135deg, #ef4444, #dc2626)';
                    break;
                default:
                    notification.style.background = 'linear-gradient(135deg, #3b82f6, #2563eb)';
            }

            notification.textContent = message;
            document.body.appendChild(notification);

            // Animate in
            setTimeout(() => {
                notification.style.transform = 'translateX(0)';
            }, 100);

            // Auto remove after 5 seconds
            setTimeout(() => {
                notification.style.transform = 'translateX(100%)';
                setTimeout(() => notification.remove(), 300);
            }, 5000);
        },

        // --- Mouse Trail ---
        setupMouseTrail() {
            const canvas = document.getElementById('mouseTrail');
            const ctx = canvas.getContext('2d');
            
            const resizeCanvas = () => {
                canvas.width = window.innerWidth;
                canvas.height = window.innerHeight;
            };
            
            resizeCanvas();
            window.addEventListener('resize', resizeCanvas);
            
            document.addEventListener('mousemove', (e) => {
                this.mouseTrail.push({
                    x: e.clientX,
                    y: e.clientY,
                    life: 1
                });
                
                if (this.mouseTrail.length > 20) {
                    this.mouseTrail.shift();
                }
            });
            
            const animateTrail = () => {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                
                this.mouseTrail.forEach((point, index) => {
                    point.life -= 0.02;
                    
                    if (point.life > 0) {
                        ctx.beginPath();
                        ctx.arc(point.x, point.y, 3 * point.life, 0, Math.PI * 2);
                        ctx.fillStyle = `rgba(79, 70, 229, ${point.life * 0.5})`;
                        ctx.fill();
                    }
                });
                
                this.mouseTrail = this.mouseTrail.filter(point => point.life > 0);
                requestAnimationFrame(animateTrail);
            };
            
            animateTrail();
        },

        // --- Mouse Tracking ---
        setupMouseTracking() {
            document.addEventListener('mousemove', (e) => {
                this.mouseX = e.clientX;
                this.mouseY = e.clientY;
                this.updateMouseParallax();
            });
        },

        updateMouseParallax() {
            const shapes = document.querySelectorAll('.shape');
            const centerX = window.innerWidth / 2;
            const centerY = window.innerHeight / 2;
            
            shapes.forEach((shape, index) => {
                const speed = (index + 1) * 0.02;
                const x = (this.mouseX - centerX) * speed;
                const y = (this.mouseY - centerY) * speed;
                
                shape.style.transform = `translate(${x}px, ${y}px)`;
            });
        },

        // --- Starfield Creation ---
        createStarfield() {
            const starfield = document.getElementById('starfield');
            this.starBatches = [[], [], [], []];
            this.starSpeeds = [-0.12, -0.18, -0.25, -0.32]; // negative for upward drift, higher = faster
            this.starCounts = [18, 14, 10, 7]; // more stars in closer (faster) layers
            this.starfieldHeight = window.innerHeight;
            this.starfieldWidth = window.innerWidth;

            // Remove any existing stars
            starfield.innerHTML = '';

            for (let batch = 0; batch < 4; batch++) {
                for (let i = 0; i < this.starCounts[batch]; i++) {
                    const star = document.createElement('div');
                    star.className = 'dynamic-star';
                    const size = (Math.random() * 3 + 1) * 1.1;
                    star.dataset.batch = batch;
                    star.dataset.baseTop = Math.random() * 100;
                    star.dataset.baseLeft = Math.random() * 100;
                    // Set initial position in px for infinite logic
                    star._y = (parseFloat(star.dataset.baseTop) / 100) * this.starfieldHeight;
                    star._x = (parseFloat(star.dataset.baseLeft) / 100) * this.starfieldWidth;
                    star.dataset.size = size;
                    star.style.cssText = `
                        position: absolute;
                        width: ${size}px;
                        height: ${size}px;
                        background: rgba(255, 255, 255, ${Math.random() * 0.8 + 0.2});
                        border-radius: 50%;
                        left: ${star._x}px;
                        top: ${star._y}px;
                        animation: twinkle ${Math.random() * 10 + 5}s ease-in-out infinite;
                        animation-delay: ${Math.random() * 5}s;
                        box-shadow: 0 0 12px 4px rgba(124, 58, 237, 0.25), 0 0 24px 8px rgba(79, 70, 229, 0.18);
                    `;
                    starfield.appendChild(star);
                    this.starBatches[batch].push(star);
                }
            }

            this._starDriftTime = 0;
            this.animateStarBatches();

            // Ensure starfield always covers viewport
            starfield.style.position = 'fixed';
            starfield.style.top = '0';
            starfield.style.left = '0';
            starfield.style.width = '100vw';
            starfield.style.height = '100vh';
            starfield.style.pointerEvents = 'none';
            starfield.style.zIndex = '0';
        },

        animateStarBatches() {
            this._starDriftTime = (this._starDriftTime || 0) + 1;
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            // Mouse parallax: get normalized mouseX (-0.5 to 0.5)
            const mouseNorm = (this.mouseX / this.starfieldWidth) - 0.5;
            for (let batch = 0; batch < 4; batch++) {
                const speed = this.starSpeeds[batch];
                const batchStars = this.starBatches[batch];
                // Parallax sensitivity: closer batches move more
                const parallaxStrength = (batch + 1) * 12; // tweak as needed
                for (let i = 0; i < batchStars.length; i++) {
                    const star = batchStars[i];
                    // Infinite upward drift and parallax
                    if (!star._y || !star._x) {
                        star._y = (parseFloat(star.dataset.baseTop) / 100) * this.starfieldHeight;
                        star._x = (parseFloat(star.dataset.baseLeft) / 100) * this.starfieldWidth;
                    }
                    star._y += speed * 2; // continuous upward drift
                    // Parallax with scroll
                    let y = star._y + (scrollTop * speed);
                    if (y < -40) {
                        star._y = this.starfieldHeight + 20;
                        star._x = Math.random() * this.starfieldWidth;
                        y = star._y + (scrollTop * speed); // reset y for new position
                    }
                    // Fade out in the last 40px above the viewport
                    let opacity = 1;
                    if (y < 0 && y > -40) {
                        opacity = (y + 40) / 40;
                    }
                    // Mouse parallax for X
                    const baseX = star._x;
                    const parallaxX = baseX + mouseNorm * parallaxStrength;
                    star.style.top = `${y}px`;
                    star.style.left = `${parallaxX}px`;
                    star.style.opacity = opacity;
                }
            }
            requestAnimationFrame(this.animateStarBatches.bind(this));
        },

        animateStarfield() {
            // Remove conflicting anime.js animations for star layers
            // Parallax is now handled by handleStarfieldParallax()
            // Twinkle is handled by CSS animations
        },

        handleStarfieldParallax() {
            // Remove handleStarfieldParallax from scroll event, as drift now handles both
        },

        // --- Enhanced Animations ---
        animateHero() {
            // Calculate exact typing animation width
            const typingText = document.querySelector('.typing-text');
            if (typingText) {
                // Create a temporary span to measure the exact text width
                const tempSpan = document.createElement('span');
                tempSpan.style.cssText = `
                    position: absolute;
                    visibility: hidden;
                    white-space: nowrap;
                    font-size: 2rem;
                    font-family: 'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                `;
                tempSpan.textContent = typingText.textContent;
                document.body.appendChild(tempSpan);
                
                const textWidth = tempSpan.offsetWidth;
                document.body.removeChild(tempSpan);
                
                // Set initial width to 0
                typingText.style.width = '0px';
                typingText.style.overflow = 'hidden';
                typingText.style.whiteSpace = 'nowrap';
                
                // Animate to exact text width - start immediately
                anime({
                    targets: typingText,
                    width: textWidth,
                    duration: 3000,
                    easing: 'steps(39)',
                    delay: 500
                });
            }

            anime.timeline({ easing: 'easeOutExpo', duration: 1500 })
                .add({ 
                    targets: '.hero-badge', 
                    opacity: [0, 1], 
                    scale: [0.8, 1],
                    duration: 1000
                })
                .add({ 
                    targets: '.title-line', 
                    opacity: [0, 1], 
                    translateY: [50, 0],
                    scale: [0.9, 1],
                    duration: 1800
                }, '-=800')
                .add({ 
                    targets: '.typing-text', 
                    opacity: [0, 1], 
                    translateY: [50, 0],
                    duration: 1500
                }, '-=1500')
                .add({ 
                    targets: '#button-group .cta-button', 
                    opacity: [0, 1], 
                    scale: [0.8, 1],
                    translateY: [30, 0],
                    duration: 1200
                }, '-=1200')
                .add({ 
                    targets: '#button-group .secondary-button', 
                    opacity: [0, 1], 
                    scale: [0.8, 1],
                    translateY: [30, 0],
                    duration: 1200
                }, '-=1100')
                .add({
                    targets: '.social-link',
                    opacity: [0, 1],
                    translateY: [30, 0],
                    scale: [0.9, 1],
                    duration: 1000,
                    delay: anime.stagger(200)
                }, '-=1000');
        },
        
        animateBackgroundShapes() {
            anime({
                targets: '.shape',
                scale: () => anime.random(0.8, 1.3),
                translateY: () => anime.random(-40, 40),
                translateX: () => anime.random(-40, 40),
                rotate: () => anime.random(0, 360),
                duration: () => anime.random(20000, 30000),
                easing: 'easeInOutSine',
                direction: 'alternate',
                loop: true,
                delay: anime.stagger(1000)
            });
        },

        // --- Progress Bar Animation ---
        animateProgressBars() {
            const progressBars = document.querySelectorAll('.progress-bar');
            progressBars.forEach(bar => {
                const progress = bar.getAttribute('data-progress');
                anime({
                    targets: bar,
                    width: `${progress}%`,
                    duration: 2000,
                    easing: 'easeOutExpo',
                    delay: anime.stagger(100)
                });
            });
        },

        // --- Social Link Animations ---
        animateSocialLink(e) {
            const link = e.currentTarget;
            const icon = link.querySelector('i');
            
            // Wiggle animation is handled by CSS
            anime({
                targets: icon,
                scale: [1, 1.2, 1],
                duration: 600,
                easing: 'easeInOutQuad'
            });
        },

        resetSocialLink(e) {
            const link = e.currentTarget;
            const icon = link.querySelector('i');
            
            anime({
                targets: icon,
                scale: 1,
                duration: 300,
                easing: 'easeOutQuad'
            });
        },

        // --- Skill Item Animations ---
        animateSkillItem(e) {
            const item = e.currentTarget;
            const icon = item.querySelector('.skill-icon');

            // Cancel any running animations
            if (item._hoverAnim) item._hoverAnim.pause();
            if (icon._hoverAnim) icon._hoverAnim.pause();

            // Animate icon: scale up and move slightly upward
            icon._hoverAnim = anime({
                targets: icon,
                scale: 1.05,
                translateY: -6,
                duration: 450,
                easing: 'easeOutCubic',
                complete: () => { icon._hoverAnim = null; }
            });
            // Animate card glow
            item._hoverAnim = anime({
                targets: item,
                boxShadow: [
                    '0 2px 8px rgba(79, 70, 229, 0.07)',
                    '0 4px 16px rgba(79, 70, 229, 0.12)'
                ],
                duration: 250,
                easing: 'easeOutCubic',
                complete: () => { item._hoverAnim = null; }
            });
        },

        resetSkillItem(e) {
            const item = e.currentTarget;
            const icon = item.querySelector('.skill-icon');

            // Cancel any running animations
            if (item._hoverAnim) item._hoverAnim.pause();
            if (icon._hoverAnim) icon._hoverAnim.pause();

            // Smoothly animate back to original state
            icon._hoverAnim = anime({
                targets: icon,
                scale: 1,
                translateY: 0,
                duration: 200,
                easing: 'easeOutCubic',
                complete: () => { icon._hoverAnim = null; }
            });
            item._hoverAnim = anime({
                targets: item,
                boxShadow: '0 2px 8px rgba(79, 70, 229, 0.08)',
                duration: 200,
                easing: 'easeOutCubic',
                complete: () => { item._hoverAnim = null; }
            });
        },

        // --- Scroll-based Logic ---
        setupScrollObserver() {
            this.setInitialAnimationStates();

            const options = { threshold: 0.2, rootMargin: '0px 0px -50px 0px' };
            const observer = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const target = entry.target;
                        target.classList.add('visible');

                        if (target.id === 'skills-grid') {
                            anime({
                                targets: '.skill-item',
                                opacity: [0, 1],
                                translateY: [30, 0],
                                scale: [0.98, 1],
                                duration: 600,
                                delay: anime.stagger(60, { easing: 'easeOutCubic' }),
                                easing: 'cubicBezier(.22,1,.36,1)'
                            });
                        }



                        observer.unobserve(target);
                    }
                });
            }, options);

            document.querySelectorAll('[data-animation]').forEach(el => observer.observe(el));
            observer.observe(document.getElementById('skills-grid'));

        },

        setInitialAnimationStates() {
            // Set initial states for elements that will be animated
            const skillItems = document.querySelectorAll('.skill-item');
            
            skillItems.forEach(item => {
                item.style.opacity = '0';
                item.style.transform = 'translateY(40px) scale(0.9)';
            })
        },
        
        updateScrollProgress() {
            const scrollProgress = document.getElementById('scrollProgress');
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            const docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
            const scrollPercent = (scrollTop / docHeight) * 100;
            
            anime({
                targets: scrollProgress,
                width: `${scrollPercent}%`,
                duration: 100,
                easing: 'easeOutQuad'
            });
        },
        
        updateActiveNav() {
            const sections = ['hero', 'skills', 'resume', 'contact'];
            let currentSection = '';
            
            sections.forEach(sectionId => {
                const section = document.getElementById(sectionId);
                if (section.getBoundingClientRect().top < window.innerHeight / 2) {
                    currentSection = sectionId;
                }
            });
            
            document.querySelectorAll('.main-nav-link').forEach(link => {
                const isActive = link.getAttribute('href') === `#${currentSection}`;
                link.classList.toggle('active', isActive);
                
                if (isActive) {
                    anime({
                        targets: link,
                        scale: [1, 1.05, 1],
                        duration: 300,
                        easing: 'easeOutQuad'
                    });
                }
            });

            // Section indicator dots
            document.querySelectorAll('.section-dot').forEach(dot => {
                const section = dot.getAttribute('data-section');
                dot.classList.toggle('active', section === currentSection);
            });

            // Animate nav-indicator bubble
            const nav = document.getElementById('mainNav');
            const indicator = nav.querySelector('.nav-indicator');
            const activeLink = nav.querySelector('.main-nav-link.active');
            if (activeLink && indicator) {
                const navRect = nav.getBoundingClientRect();
                const linkRect = activeLink.getBoundingClientRect();
                const left = linkRect.left - navRect.left;
                const width = linkRect.width;
                indicator.style.left = `${left}px`;
                indicator.style.width = `${width}px`;
            } else if (indicator) {
                indicator.style.width = '0';
            }
        },

        handleNavScroll() {
        // Ensure nav bar always remains visible and fixed
        },

        handleHeroParallax() {
            const heroContent = document.querySelector('.hero-center');
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            const speed = 0.3;
            
            anime({
                targets: heroContent,
                translateY: scrollTop * speed,
                duration: 100,
                easing: 'easeOutQuad'
            });
        },

       
        
    };

    // Initialize the app
    App.init();
});