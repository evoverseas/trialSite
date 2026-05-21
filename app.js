// EV Overseas Website JavaScript

document.addEventListener('DOMContentLoaded', function () {
    // ============================================
    // ANNOUNCEMENT BANNER INITIALIZATION
    // ============================================
    initAnnounceBanner();

    // Animated Counter Implementation
    const counters = document.querySelectorAll('.counter');
    const speed = 200;

    function animateCounter(counter) {
        const target = +counter.getAttribute('data-target');
        let count = 0;
        const inc = target / speed;

        function updateCount() {
            if (count < target) {
                count += inc;
                counter.innerText = Math.ceil(count);
                setTimeout(updateCount, 1);
            } else {
                counter.innerText = target;
            }
        }

        updateCount();
    }

    // Intersection Observer for counter animation
    const countersObserverOptions = {
        threshold: 0.5
    };

    const countersObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const counters = entry.target.querySelectorAll('.counter');
                counters.forEach(counter => animateCounter(counter));
                countersObserver.unobserve(entry.target);
            }
        });
    }, countersObserverOptions);

    // Observe stats section
    const statsSection = document.querySelector('.hero-stats');
    if (statsSection) {
        countersObserver.observe(statsSection);
    }

    // Mobile Navigation
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('nav-menu');
    const navbar = document.getElementById('navbar');

    if (hamburger && navMenu) {
        hamburger.addEventListener('click', function () {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
            document.body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : 'auto';
        });

        // Close mobile menu when clicking on a link
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', function (e) {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
                document.body.style.overflow = 'auto';
            });
        });
    }

    // Navbar scroll effect
    // Navbar scroll effect
    window.addEventListener('scroll', function () {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

        // Add background to navbar on scroll
        if (scrollTop > 50) {
            navbar.style.background = 'rgba(255, 255, 255, 0.95)';
            navbar.style.backdropFilter = 'blur(12px)';
            navbar.style.boxShadow = '0 4px 20px rgba(0,0,0,0.08)';
        } else {
            navbar.style.background = 'rgba(255, 255, 255, 0.98)';
            navbar.style.backdropFilter = 'blur(12px)';
            navbar.style.boxShadow = 'var(--shadow-sm)';
        }
    });

    // Fix smooth scrolling for all navigation links
    function smoothScrollTo(targetId) {
        const target = document.getElementById(targetId);
        if (target) {
            const offsetTop = target.offsetTop - 80; // Account for fixed navbar
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
        }
    }

    // Handle all navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            smoothScrollTo(targetId);
        });
    });

    // Fix CTA buttons functionality — navigate to contact page
    const ctaButtons = document.querySelectorAll('.nav-cta');
    ctaButtons.forEach(btn => {
        btn.addEventListener('click', function (e) {
            e.preventDefault();
            window.location.href = 'contact.html';
        });
    });

    // Fix hero buttons
    const heroButtons = document.querySelectorAll('.hero-buttons .btn');
    heroButtons.forEach(btn => {
        btn.addEventListener('click', function (e) {
            e.preventDefault();
            const btnText = this.textContent.toLowerCase();
            if (btnText.includes('counseling') || btnText.includes('consultation')) {
                smoothScrollTo('contact');
            } else if (btnText.includes('services')) {
                smoothScrollTo('services');
            }
        });
    });

    // Contact Form Handling with improved validation
    const contactForm = document.getElementById('contactForm');

    if (contactForm) {
        contactForm.addEventListener('submit', function (e) {
            e.preventDefault();

            // Validate form before submission
            if (!validateForm()) {
                return;
            }

            // Get form data
            const formData = new FormData(contactForm);
            const data = Object.fromEntries(formData);

            // Show brief loading state with spinner
            const submitBtn = contactForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<span style="display:inline-flex;align-items:center;gap:8px;"><svg width="18" height="18" viewBox="0 0 24 24" style="animation:spin 0.8s linear infinite;"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" fill="none" stroke-dasharray="31.4 31.4" stroke-linecap="round"/></svg> Sending...</span>';
            submitBtn.disabled = true;

            // Show success immediately (optimistic UI) — don't make user wait for Apps Script
            setTimeout(() => {
                showMessage(data.name || 'there', 'success');
                contactForm.reset();
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            }, 600);

            // Send data in background (fire-and-forget)
            submitFormToGoogleSheets(data).catch(error => {
                console.error('Background submission error:', error);
            });
        });
    }

    // Animate elements on scroll
    const animationObserverOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const animationObserver = new IntersectionObserver(function (entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-fade-in-up');
            }
        });
    }, animationObserverOptions);

    // Observe all cards and sections
    const elementsToAnimate = document.querySelectorAll('.service-card, .destination-card, .testimonial-card, .journey-card, .about-content');
    elementsToAnimate.forEach(el => {
        animationObserver.observe(el);
    });

    // Add click handlers for journey cards (analytics / tracking placeholder)
    const journeyCards = document.querySelectorAll('.journey-card');
    journeyCards.forEach(card => {
        card.addEventListener('click', function () {
            const title = card.querySelector('h3') ? card.querySelector('h3').textContent : 'Journey Step';
            console.log(`Journey card clicked: ${title}`);
        });
    });

    // Initialize scroll animations
    initScrollAnimations();

    // Improved focus management for accessibility (moved here from bottom of file)
    const focusableElements = document.querySelectorAll(
        'a, button, input, textarea, select, [tabindex]:not([tabindex="-1"])'
    );
    focusableElements.forEach(el => {
        el.addEventListener('focus', function () {
            this.style.outline = '2px solid var(--color-primary)';
            this.style.outlineOffset = '2px';
        });
        el.addEventListener('blur', function () {
            this.style.outline = '';
        });
    });

    // University Search Functionality
    const universitySearchForm = document.getElementById('universitySearchForm');
    const searchResults = document.getElementById('searchResults');

    // Sample university data - In production, this would come from your backend
    const universities = [
        {
            name: "California State University",
            country: "USA",
            courses: ["masters", "bachelors"],
            fields: ["engineering", "it", "business"],
            budget: "20-25",
            logo: "./images/universities/csu-logo.png",
            location: "California, USA",
            ranking: "#120 in US News",
            tuitionFee: "₹22 Lakhs/year",
            acceptance: "75%"
        },
        {
            name: "University of Manchester",
            country: "UK",
            courses: ["masters", "phd"],
            fields: ["engineering", "business", "medicine"],
            budget: "25+",
            logo: "./images/universities/manchester-logo.png",
            location: "Manchester, UK",
            ranking: "#27 in QS World Rankings",
            tuitionFee: "₹26 Lakhs/year",
            acceptance: "65%"
        },
        // Add more universities as needed
    ];

    if (universitySearchForm) {
        universitySearchForm.addEventListener('submit', function (e) {
            e.preventDefault();

            const country = document.getElementById('country').value;
            const course = document.getElementById('course').value;
            const field = document.getElementById('field').value;
            const budget = document.getElementById('budget').value;

            // Filter universities based on criteria
            const filteredUniversities = universities.filter(uni => {
                return (!country || uni.country === country) &&
                    (!course || uni.courses.includes(course)) &&
                    (!field || uni.fields.includes(field)) &&
                    (!budget || uni.budget === budget);
            });

            // Display results
            displaySearchResults(filteredUniversities);
        });
    }

    function displaySearchResults(results) {
        if (!searchResults) return;

        if (results.length === 0) {
            searchResults.innerHTML = `
                <div class="no-results">
                    <p>No universities found matching your criteria. Please try different filters or contact us for more options.</p>
                </div>
            `;
            return;
        }

        searchResults.innerHTML = results.map(uni => `
            <div class="university-card">
                <img src="${uni.logo}" alt="${uni.name} logo" class="university-logo" loading="lazy">
                <h3 class="university-name">${uni.name}</h3>
                <div class="university-location">
                    <i class="fas fa-map-marker-alt"></i> ${uni.location}
                </div>
                <div class="university-details">
                    <p><i class="fas fa-trophy"></i> ${uni.ranking}</p>
                    <p><i class="fas fa-money-bill-wave"></i> ${uni.tuitionFee}</p>
                    <p><i class="fas fa-check-circle"></i> ${uni.acceptance} Acceptance Rate</p>
                </div>
                <div class="university-cta">
                    <button class="btn btn--outline" onclick="window.location.href='contact.html'">Enquire Now</button>
                    <button class="btn btn--primary" onclick="window.location.href='contact.html'">Apply Now</button>
                </div>
            </div>
        `).join('');
    }

    // FAQ Section Interactivity (robust with ARIA + keyboard support)
    const faqContainer = document.querySelector('.faq-content');
    if (faqContainer) {
        // Initialize aria attributes
        faqContainer.querySelectorAll('.faq-question').forEach(btn => {
            btn.setAttribute('role', 'button');
            btn.setAttribute('aria-expanded', 'false');
            const answer = btn.nextElementSibling;
            if (answer && answer.classList.contains('faq-answer')) {
                const id = answer.id || ('faq-answer-' + Math.random().toString(36).substr(2, 9));
                answer.id = id;
                btn.setAttribute('aria-controls', id);
            }
            // Ensure focusable and clickable
            if (!btn.hasAttribute('tabindex')) btn.setAttribute('tabindex', '0');
        });

        // Use event delegation for clicks and keypresses
        faqContainer.addEventListener('click', (e) => {
            const btn = e.target.closest('.faq-question');
            if (!btn) return;
            toggleFaq(btn);
        });

        faqContainer.addEventListener('keydown', (e) => {
            const key = e.key;
            if (key !== 'Enter' && key !== ' ') return;
            const btn = e.target.closest('.faq-question');
            if (!btn) return;
            e.preventDefault();
            toggleFaq(btn);
        });
    }

    function toggleFaq(button) {
        const answer = button.nextElementSibling;
        if (!answer || !answer.classList.contains('faq-answer')) return;

        console.log('Toggling FAQ for:', button.textContent.trim());

        const parentCategory = button.closest('.faq-category');
        // Close other open answers in same category
        if (parentCategory) {
            parentCategory.querySelectorAll('.faq-question.active').forEach(openBtn => {
                if (openBtn !== button) {
                    openBtn.classList.remove('active');
                    openBtn.setAttribute('aria-expanded', 'false');
                    const otherAnswer = openBtn.nextElementSibling;
                    if (otherAnswer && otherAnswer.classList.contains('faq-answer')) {
                        otherAnswer.classList.remove('show');
                    }
                }
            });
        }

        const isOpen = button.classList.toggle('active');
        button.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        if (isOpen) {
            answer.classList.add('show');
        } else {
            answer.classList.remove('show');
        }
    }

    // Fallback: attach direct listeners to each faq-question (in case delegation misses)
    document.querySelectorAll('.faq-question').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleFaq(btn);
        });
        btn.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                toggleFaq(btn);
            }
        });
    });

    // ============================================
    // STUDENT ABROAD HUB INTERACTIVE ENGINES
    // ============================================

    // Dynamic lead source context variables
    let leadSource = 'drawer';
    let selectedScholarshipName = '';
    let selectedScholarshipCountry = '';
    let originalDrawerBodyHtml = '';

    const drawerBodyEl = document.querySelector('.drawer-body');
    if (drawerBodyEl) {
        originalDrawerBodyHtml = drawerBodyEl.innerHTML;
    }

    // Helper to open drawer with context
    window.openDrawerWithContext = function (source, context = {}) {
        const drawer = document.getElementById('quick-match-drawer');
        if (!drawer) return;

        leadSource = source;
        drawer.classList.add('open');

        // Restore original body content first (in case success screen was showing)
        const drawerBody = drawer.querySelector('.drawer-body');
        if (drawerBody && originalDrawerBodyHtml) {
            drawerBody.innerHTML = originalDrawerBodyHtml;
            // Re-bind the submit event handler since the form got replaced!
            bindDrawerFormSubmit();
        }

        const drawerHeaderTitle = drawer.querySelector('.drawer-header h3');
        const drawerGpaLabel = drawer.querySelector('label[for="drawer-gpa"]');
        const drawerGpaInput = document.getElementById('drawer-gpa');
        const drawerDestSelect = document.getElementById('drawer-destination');

        if (source === 'calculator') {
            if (drawerHeaderTitle) drawerHeaderTitle.textContent = `Get ${context.country} Expense PDF`;
            if (drawerGpaLabel) drawerGpaLabel.textContent = `Current CGPA / Percentage (Optional)`;
            if (drawerGpaInput) {
                drawerGpaInput.placeholder = `e.g. 8.5 CGPA (Helps match scholarships)`;
                drawerGpaInput.value = `Inquired via Cost Calculator`;
            }
            if (drawerDestSelect) drawerDestSelect.value = context.country;
        } else if (source === 'scholarship') {
            selectedScholarshipName = context.scholarshipName;
            selectedScholarshipCountry = context.scholarshipCountry;

            if (drawerHeaderTitle) drawerHeaderTitle.textContent = `Scholarship Eligibility`;
            if (drawerGpaLabel) drawerGpaLabel.textContent = `Your GPA / Academic Score`;
            if (drawerGpaInput) {
                drawerGpaInput.placeholder = `e.g. 8.5 CGPA (Required for evaluation)`;
                drawerGpaInput.value = ``;
            }
            if (drawerDestSelect) drawerDestSelect.value = context.scholarshipCountry;
        } else {
            // standard drawer
            if (drawerHeaderTitle) drawerHeaderTitle.textContent = `45s Eligibility Check`;
            if (drawerGpaLabel) drawerGpaLabel.textContent = `Current CGPA / Percentage`;
            if (drawerGpaInput) {
                drawerGpaInput.placeholder = `e.g. 8.5 CGPA or 78%`;
                drawerGpaInput.value = ``;
            }
        }
    };

    // 1. Data Repositories
    const hubUniversities = {
        USA: [
            { name: "Northeastern University", location: "Boston, MA", tuitionFee: "₹26 Lakhs/year", ranking: "#53 National", acceptanceRate: "20%", minGpa: 7.5, minIelts: 6.5 },
            { name: "University of Texas, Arlington", location: "Arlington, TX", tuitionFee: "₹18 Lakhs/year", ranking: "#110 Public", acceptanceRate: "80%", minGpa: 6.5, minIelts: 6.0 },
            { name: "California State University", location: "East Bay, CA", tuitionFee: "₹16 Lakhs/year", ranking: "#25 Regional West", acceptanceRate: "75%", minGpa: 6.0, minIelts: 6.0 },
            { name: "Southeast Missouri State Univ.", location: "Cape Girardeau, MO", tuitionFee: "₹12 Lakhs/year", ranking: "#70 Regional Midwest", acceptanceRate: "86%", minGpa: 5.5, minIelts: 5.5 }
        ],
        UK: [
            { name: "Teesside University", location: "Middlesbrough, UK", tuitionFee: "₹14 Lakhs/year", ranking: "#80 UK Guardian", acceptanceRate: "82%", minGpa: 5.5, minIelts: 5.5 },
            { name: "University of Chester", location: "Chester, UK", tuitionFee: "₹15 Lakhs/year", ranking: "#74 UK Guardian", acceptanceRate: "78%", minGpa: 6.0, minIelts: 6.0 },
            { name: "University of Cumbria", location: "Carlisle, UK", tuitionFee: "₹13 Lakhs/year", ranking: "#95 UK Guardian", acceptanceRate: "85%", minGpa: 5.5, minIelts: 5.5 },
            { name: "Cardiff Metropolitan University", location: "Cardiff, Wales", tuitionFee: "₹16 Lakhs/year", ranking: "#68 Times UK", acceptanceRate: "70%", minGpa: 6.5, minIelts: 6.0 }
        ],
        Germany: [
            { name: "Technical University of Munich", location: "Munich, Germany", tuitionFee: "€0 (Public Free)", ranking: "#37 QS World", acceptanceRate: "15%", minGpa: 8.5, minIelts: 6.5 },
            { name: "RWTH Aachen University", location: "Aachen, Germany", tuitionFee: "€0 (Public Free)", ranking: "#99 QS World", acceptanceRate: "28%", minGpa: 8.0, minIelts: 6.5 },
            { name: "SRH Berlin Univ. of Applied Sciences", location: "Berlin, Germany", tuitionFee: "₹9.5 Lakhs/year (Private)", ranking: "#10 Regional Private", acceptanceRate: "65%", minGpa: 6.0, minIelts: 6.0 },
            { name: "GISMA University of Applied Sciences", location: "Potsdam, Germany", tuitionFee: "₹10.5 Lakhs/year (Private)", ranking: "#15 Private Business", acceptanceRate: "75%", minGpa: 5.5, minIelts: 5.5 }
        ],
        Australia: [
            { name: "University of Sydney", location: "Sydney, NSW", tuitionFee: "₹24 Lakhs/year", ranking: "#19 QS World", acceptanceRate: "30%", minGpa: 8.0, minIelts: 6.5 },
            { name: "Deakin University", location: "Melbourne, VIC", tuitionFee: "₹18 Lakhs/year", ranking: "#230 QS World", acceptanceRate: "75%", minGpa: 6.5, minIelts: 6.0 },
            { name: "University of Wollongong", location: "Wollongong, NSW", tuitionFee: "₹17 Lakhs/year", ranking: "#160 QS World", acceptanceRate: "78%", minGpa: 6.0, minIelts: 6.0 },
            { name: "Torrens University", location: "Adelaide, SA", tuitionFee: "₹13 Lakhs/year", ranking: "Top Private Australia", acceptanceRate: "85%", minGpa: 5.5, minIelts: 5.5 }
        ]
    };

    const scholarships = [
        { name: "Fulbright Foreign Student Program", country: "USA", amount: "100% Tuition & Living Cost", type: "government", gpa: "8.0+ CGPA", test: "IELTS 7.0+ / TOEFL 100+" },
        { name: "Chevening Scholarships", country: "UK", amount: "Full Tuition + Living Costs", type: "government", gpa: "7.5+ CGPA", test: "IELTS 6.5+" },
        { name: "DAAD Postgraduate Scholarships", country: "Germany", amount: "Full €934/mo + Travel", type: "government", gpa: "8.0+ CGPA", test: "IELTS 6.0+ or B2 German" },
        { name: "Australia Awards Scholarships", country: "Australia", amount: "100% Tuition, Travel & Living", type: "government", gpa: "7.5+ CGPA", test: "IELTS 6.5+" },
        { name: "GREAT Scholarships", country: "UK", amount: "Up to £10,000 Tuition Waiver", type: "government", gpa: "7.0+ CGPA", test: "IELTS 6.5+" },
        { name: "CSU President's Merit Award", country: "USA", amount: "$5,000 - $12,000 Annual Waiver", type: "university", gpa: "8.5+ CGPA", test: "IELTS 6.5+ / GRE 305+" },
        { name: "Heinrich Böll Foundation Grants", country: "Germany", amount: "€850/mo + Health Cover", type: "external", gpa: "8.2+ CGPA", test: "IELTS 6.0+" },
        { name: "Deakin International Scholarship", country: "Australia", amount: "25% Tuition Fee Waiver", type: "university", gpa: "7.0+ CGPA", test: "IELTS 6.0+" }
    ];

    // 2. Hub Tab Navigation Logic
    const hubTabBtns = document.querySelectorAll('.hub-tab-btn');
    const hubTabPanes = document.querySelectorAll('.hub-tab-pane');

    if (hubTabBtns.length && hubTabPanes.length) {
        hubTabBtns.forEach(btn => {
            btn.addEventListener('click', function () {
                const targetTab = btn.getAttribute('data-tab');
                hubTabBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                hubTabPanes.forEach(pane => {
                    pane.classList.remove('active');
                    if (pane.id === `pane-${targetTab}`) {
                        pane.classList.add('active');
                        if (targetTab === 'calculator') {
                            updateCostCalculator();
                        }
                    }
                });
                trackEvent('hub_tab_switch', { tab: targetTab });
            });
        });
    }

    // 3. Smart Profile Matcher Quiz Logic
    let quizActiveStep = 1;
    const quizPrevBtn = document.getElementById('quiz-prev-btn');
    const quizNextBtn = document.getElementById('quiz-next-btn');
    const quizProgress = document.getElementById('quiz-progress');
    const quizStepText = document.getElementById('quiz-step-text');
    const quizPercentText = document.getElementById('quiz-percent-text');
    const quizForm = document.getElementById('hubQuizForm');
    const quizGpaSlider = document.getElementById('quiz-gpa');
    const quizGpaVal = document.getElementById('gpa-val');
    const quizEnglishTest = document.getElementById('quiz-english-test');
    const englishScoreGroup = document.getElementById('english-score-group');

    // GPA Slider real-time change
    if (quizGpaSlider && quizGpaVal) {
        quizGpaSlider.addEventListener('input', function () {
            quizGpaVal.textContent = parseFloat(this.value).toFixed(1) + ' CGPA';
        });
    }

    // Toggle english score input
    if (quizEnglishTest && englishScoreGroup) {
        quizEnglishTest.addEventListener('change', function () {
            if (this.value === 'None') {
                englishScoreGroup.style.display = 'none';
            } else {
                englishScoreGroup.style.display = 'block';
                const scoreInput = document.getElementById('quiz-english-score');
                if (scoreInput) {
                    scoreInput.placeholder = this.value === 'IELTS' ? 'e.g. 6.5' : (this.value === 'TOEFL' ? 'e.g. 90' : 'e.g. 58');
                }
            }
        });
    }

    // Handle Country card clicks
    const countryCards = document.querySelectorAll('.quiz-option-card');
    const quizDestinationInput = document.getElementById('quiz-destination');
    
    countryCards.forEach(card => {
        card.addEventListener('click', function () {
            countryCards.forEach(c => c.classList.remove('selected'));
            this.classList.add('selected');
            if (quizDestinationInput) {
                quizDestinationInput.value = this.getAttribute('data-value');
            }
        });
    });

    function showQuizStep(step) {
        document.querySelectorAll('.quiz-step').forEach(el => el.classList.remove('active'));
        const activeEl = document.querySelector(`.quiz-step[data-step="${step}"]`);
        if (activeEl) activeEl.classList.add('active');

        // Update progress bar
        let percent = 33;
        let stepTitle = "Step 1 of 3: Academic Destination";
        if (step === 2) {
            percent = 66;
            stepTitle = "Step 2 of 3: Academic Profile";
        } else if (step === 3) {
            percent = 100;
            stepTitle = "Step 3 of 3: Personalized Matches";
        }

        if (quizProgress) quizProgress.style.width = `${percent}%`;
        if (quizStepText) quizStepText.textContent = stepTitle;
        if (quizPercentText) quizPercentText.textContent = `${percent}% Complete`;

        // Update Nav buttons
        if (quizPrevBtn) {
            quizPrevBtn.style.visibility = step === 1 ? 'hidden' : 'visible';
        }
        if (quizNextBtn) {
            if (step === 3) {
                quizNextBtn.style.display = 'none';
            } else {
                quizNextBtn.style.display = 'block';
                quizNextBtn.innerHTML = 'Next Step <i class="fas fa-arrow-right" style="margin-left: 8px;"></i>';
            }
        }
    }

    if (quizNextBtn) {
        quizNextBtn.addEventListener('click', function () {
            if (quizActiveStep === 1) {
                // Validate destination
                if (!quizDestinationInput || !quizDestinationInput.value) {
                    alert('Please select your preferred study destination to proceed!');
                    return;
                }
                quizActiveStep = 2;
                showQuizStep(quizActiveStep);
            } else if (quizActiveStep === 2) {
                // Validate IELTS score if visible
                if (quizEnglishTest.value !== 'None') {
                    const scoreInputEl = document.getElementById('quiz-english-score');
                    const score = scoreInputEl ? parseFloat(scoreInputEl.value) : 0;
                    if (!score || score <= 0) {
                        alert('Please enter your expected English score to get matching recommendations.');
                        return;
                    }
                }
                quizActiveStep = 3;
                showQuizStep(quizActiveStep);
            }
        });
    }

    if (quizPrevBtn) {
        quizPrevBtn.addEventListener('click', function () {
            if (quizActiveStep > 1) {
                quizActiveStep--;
                showQuizStep(quizActiveStep);
            }
        });
    }

    // Submit handler for Smart Profile Matcher Form
    if (quizForm) {
        quizForm.addEventListener('submit', async function (e) {
            e.preventDefault();

            const name = document.getElementById('quiz-name').value.trim();
            const email = document.getElementById('quiz-email').value.trim();
            const phone = document.getElementById('quiz-phone').value.trim();
            const destination = quizDestinationInput.value;
            const degree = document.getElementById('quiz-degree').value;
            const gpa = parseFloat(quizGpaSlider.value).toFixed(1);
            const testType = quizEnglishTest.value;
            const testScore = testType !== 'None' ? document.getElementById('quiz-english-score').value : 'N/A';

            if (!name || !email || !phone) {
                alert('Please fill out all fields to unlock your university matches!');
                return;
            }

            // Get matching universities
            const matches = hubUniversities[destination] || [];
            let filteredMatches = matches.filter(uni => parseFloat(gpa) >= uni.minGpa);
            if (filteredMatches.length === 0) {
                filteredMatches = matches.slice(-2); // Fallback to last 2
            }

            // Populate matching universities cards dynamically
            const resultsGrid = document.querySelector('.quiz-results-grid');
            if (resultsGrid) {
                resultsGrid.innerHTML = filteredMatches.map(uni => `
                    <div class="uni-match-card" style="animation: fadeIn 0.4s ease;">
                        <div class="uni-match-header">
                            <span class="uni-match-badge">${parseFloat(gpa) >= uni.minGpa + 0.5 ? 'High Chance' : 'Target Match'}</span>
                            <span style="font-size: var(--text-xs); color: var(--color-success); font-weight: 700;">Matched!</span>
                        </div>
                        <h4>${uni.name}</h4>
                        <div class="uni-match-detail"><i class="fas fa-map-marker-alt"></i> ${uni.location}</div>
                        <div class="uni-match-detail"><i class="fas fa-money-bill-wave"></i> Tuition: ${uni.tuitionFee}</div>
                        <div class="uni-match-detail"><i class="fas fa-trophy"></i> Rank: ${uni.ranking}</div>
                        <div class="uni-match-detail"><i class="fas fa-check-circle"></i> Acceptance: ${uni.acceptanceRate}</div>
                    </div>
                `).join('');
            }

            // Submit lead to Google Sheets
            const submitBtn = quizForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerText;
            submitBtn.innerText = 'Unlocking...';
            submitBtn.disabled = true;

            const payload = {
                name: name,
                email: email,
                phone: phone,
                destination: destination,
                course: `${degree} via Hub Smart Matcher`,
                message: `Matched Profile GPA: ${gpa}. English Test: ${testType} (${testScore}). Universities unlocked: ${filteredMatches.map(u => u.name).join(', ')}`
            };

            try {
                // Submit lead to Google Sheets in background
                submitFormToGoogleSheets(payload).catch(error => console.error(error));

                // Unblur results overlay
                const overlay = document.querySelector('.quiz-locked-overlay');
                if (overlay) overlay.style.display = 'none';

                const blurredResults = document.querySelector('.quiz-blurred-results');
                if (blurredResults) blurredResults.classList.remove('quiz-blurred-results');

                // Update next navigation element
                const quizNav = document.getElementById('quiz-nav');
                if (quizNav) {
                    quizNav.innerHTML = `
                        <div style="text-align: center; width: 100%; margin-top: 16px;">
                            <p style="font-size: var(--text-sm); color: var(--color-success); font-weight: 700; margin-bottom: 12px;">🎉 Congratulations! Your matches are unlocked.</p>
                            <a href="https://wa.me/919666963756?text=Hi%2C%20I%20just%20unlocked%20my%20university%20matches%20on%20your%20website.%20My%20GPA%20is%20${gpa}%20and%20I%20want%20to%20study%20in%20${destination}." target="_blank" class="btn btn--primary" style="background:#25D366; box-shadow:none; border-color:transparent;">
                                <i class="fab fa-whatsapp" style="margin-right: 8px;"></i> Talk to our Lead Expert on WhatsApp
                            </a>
                        </div>
                    `;
                }
            } catch (err) {
                console.error(err);
                submitBtn.innerText = originalText;
                submitBtn.disabled = false;
            }
        });
    }

    // Close / Bypass handler for Profile Matcher Locked Overlay
    const unlockCloseBtn = document.querySelector('.unlock-close-btn');
    if (unlockCloseBtn) {
        unlockCloseBtn.addEventListener('click', function () {
            const destination = quizDestinationInput ? quizDestinationInput.value : 'USA';
            const gpa = quizGpaSlider ? parseFloat(quizGpaSlider.value).toFixed(1) : '7.0';

            // Get matching universities
            const matches = hubUniversities[destination] || [];
            let filteredMatches = matches.filter(uni => parseFloat(gpa) >= uni.minGpa);
            if (filteredMatches.length === 0) {
                filteredMatches = matches.slice(-2); // Fallback to last 2
            }

            // Populate matching universities cards dynamically
            const resultsGrid = document.querySelector('.quiz-results-grid');
            if (resultsGrid) {
                resultsGrid.innerHTML = filteredMatches.map(uni => `
                    <div class="uni-match-card" style="animation: fadeIn 0.4s ease;">
                        <div class="uni-match-header">
                            <span class="uni-match-badge">${parseFloat(gpa) >= uni.minGpa + 0.5 ? 'High Chance' : 'Target Match'}</span>
                            <span style="font-size: var(--text-xs); color: var(--color-success); font-weight: 700;">Matched!</span>
                        </div>
                        <h4>${uni.name}</h4>
                        <div class="uni-match-detail"><i class="fas fa-map-marker-alt"></i> ${uni.location}</div>
                        <div class="uni-match-detail"><i class="fas fa-money-bill-wave"></i> Tuition: ${uni.tuitionFee}</div>
                        <div class="uni-match-detail"><i class="fas fa-trophy"></i> Rank: ${uni.ranking}</div>
                        <div class="uni-match-detail"><i class="fas fa-check-circle"></i> Acceptance: ${uni.acceptanceRate}</div>
                    </div>
                `).join('');
            }

            // Hide the locked overlay
            const overlay = document.querySelector('.quiz-locked-overlay');
            if (overlay) overlay.style.display = 'none';

            // Remove blur
            const blurredResults = document.querySelector('.quiz-blurred-results');
            if (blurredResults) blurredResults.classList.remove('quiz-blurred-results');

            // Update navigation button to show WhatsApp Lead helper
            const quizNav = document.getElementById('quiz-nav');
            if (quizNav) {
                quizNav.innerHTML = `
                    <div style="text-align: center; width: 100%; margin-top: 16px;">
                        <p style="font-size: var(--text-sm); color: var(--color-gray-600); margin-bottom: 12px;">💡 Want a certified expert to review your university shortlist?</p>
                        <a href="https://wa.me/919666963756?text=Hi%2C%20I%20just%20unlocked%20my%20university%20matches%20on%20your%20website.%20My%20GPA%20is%20${gpa}%20and%20I%20want%20to%20study%20in%20${destination}." target="_blank" class="btn btn--primary" style="background:#25D366; box-shadow:none; border-color:transparent;">
                            <i class="fab fa-whatsapp" style="margin-right: 8px;"></i> Talk to our Lead Expert on WhatsApp
                        </a>
                    </div>
                `;
            }

            // Track bypass event in GA4
            trackEvent('quiz_bypass', { destination: destination, gpa: gpa });
        });
    }

    // 4. Cost and Living Budget Calculator Logic
    const calcCountry = document.getElementById('calc-country');
    const calcTuition = document.getElementById('calc-tuition');
    const calcTuitionVal = document.getElementById('calc-tuition-val');
    const calcRent = document.getElementById('calc-rent');
    const calcLifestyle = document.getElementById('calc-lifestyle');
    const calcTotal = document.getElementById('calc-total');

    function updateCostCalculator() {
        if (!calcCountry) return;

        const country = calcCountry.value;
        let tuitionVal = parseInt(calcTuition.value);

        // Render tuition value dynamic label
        if (calcTuitionVal) {
            calcTuitionVal.textContent = country === 'Germany' && tuitionVal === 0 
                ? '€0 (Tuition Free Public)' 
                : `₹${tuitionVal} Lakhs`;
        }

        // Establish Cost parameters in INR Lakhs per Year
        let baseRent = 4.2; // Default Standard
        let baseLiving = 2.4; // Default Standard
        let insuranceVisa = 0.8; // Default Standard

        if (country === 'USA') {
            baseRent = 5.4;
            baseLiving = 3.0;
            insuranceVisa = 1.0;
        } else if (country === 'UK') {
            baseRent = 4.8;
            baseLiving = 2.6;
            insuranceVisa = 0.9;
        } else if (country === 'Germany') {
            baseRent = 4.0;
            baseLiving = 2.0;
            insuranceVisa = 0.8;
            // Snapping cap removed as requested to allow smooth sliding up to 20L+ for Germany
        } else if (country === 'Australia') {
            baseRent = 5.0;
            baseLiving = 2.8;
            insuranceVisa = 1.0;
        }

        // Apply accommodation tier multipliers
        const rentTier = calcRent.value;
        let rentMultiplier = 1.0;
        if (rentTier === 'shared') rentMultiplier = 0.75;
        if (rentTier === 'campus') rentMultiplier = 1.6;
        const totalRent = baseRent * rentMultiplier;

        // Apply lifestyle multipliers
        const lifestyleTier = calcLifestyle.value;
        let lifestyleMultiplier = 1.0;
        if (lifestyleTier === 'budget') lifestyleMultiplier = 0.75;
        if (lifestyleTier === 'comfort') lifestyleMultiplier = 1.6;
        const totalLiving = baseLiving * lifestyleMultiplier;

        // Compute Total
        const computedTotal = tuitionVal + totalRent + totalLiving + insuranceVisa;

        // Render Total Cost
        if (calcTotal) {
            calcTotal.textContent = `₹${computedTotal.toFixed(1)} Lakhs`;
        }

        // Render Individual items and progress bars
        const itemTuitionEl = document.getElementById('item-tuition');
        const itemRentEl = document.getElementById('item-rent');
        const itemLivingEl = document.getElementById('item-living');
        const itemInsuranceEl = document.getElementById('item-insurance');

        if (itemTuitionEl) itemTuitionEl.textContent = country === 'Germany' && tuitionVal === 0 ? '€0 (Public)' : `₹${tuitionVal.toFixed(1)} Lakhs`;
        if (itemRentEl) itemRentEl.textContent = `₹${totalRent.toFixed(1)} Lakhs`;
        if (itemLivingEl) itemLivingEl.textContent = `₹${totalLiving.toFixed(1)} Lakhs`;
        if (itemInsuranceEl) itemInsuranceEl.textContent = `₹${insuranceVisa.toFixed(1)} Lakhs`;

        // Calculate progress percentage widths
        const barTuition = document.getElementById('bar-tuition');
        const barRent = document.getElementById('bar-rent');
        const barLiving = document.getElementById('bar-living');
        const barInsurance = document.getElementById('bar-insurance');

        if (barTuition) barTuition.style.width = `${(tuitionVal / computedTotal) * 100}%`;
        if (barRent) barRent.style.width = `${(totalRent / computedTotal) * 100}%`;
        if (barLiving) barLiving.style.width = `${(totalLiving / computedTotal) * 100}%`;
        if (barInsurance) barInsurance.style.width = `${(insuranceVisa / computedTotal) * 100}%`;
    }

    // Attach Calculator Event Listeners
    if (calcCountry) {
        calcCountry.addEventListener('change', updateCostCalculator);
        calcTuition.addEventListener('input', updateCostCalculator);
        calcRent.addEventListener('change', updateCostCalculator);
        calcLifestyle.addEventListener('change', updateCostCalculator);
    }

    // Trigger WhatsApp lead generation inside Cost Calculator
    const calcLeadTrigger = document.getElementById('calc-lead-trigger');
    if (calcLeadTrigger) {
        calcLeadTrigger.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation(); // Prevent document click listener from immediately closing the drawer
            const countryVal = calcCountry ? calcCountry.value : 'USA';
            window.openDrawerWithContext('calculator', { country: countryVal });
            trackEvent('calc_lead_click', { country: countryVal });
        });
    }

    // 5. Scholarship Search & Filter Logic
    const schSearchInput = document.getElementById('sch-search');
    const schCountrySelect = document.getElementById('sch-country');
    const schTypeSelect = document.getElementById('sch-type');
    const schResultsGrid = document.getElementById('scholarship-results-grid');

    function renderScholarships() {
        if (!schResultsGrid) return;

        const query = schSearchInput ? schSearchInput.value.toLowerCase().trim() : '';
        const country = schCountrySelect ? schCountrySelect.value : 'all';
        const type = schTypeSelect ? schTypeSelect.value : 'all';

        const filtered = scholarships.filter(sch => {
            const matchesQuery = sch.name.toLowerCase().includes(query) || sch.amount.toLowerCase().includes(query) || sch.gpa.toLowerCase().includes(query);
            const matchesCountry = country === 'all' || sch.country === country;
            const matchesType = type === 'all' || sch.type === type;
            return matchesQuery && matchesCountry && matchesType;
        });

        if (filtered.length === 0) {
            schResultsGrid.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--color-gray-500);">
                    <i class="fas fa-search" style="font-size: 2rem; margin-bottom: 12px; color: var(--color-gray-300);"></i>
                    <p>No scholarships found matching your criteria. Try adjusting the search term or filters.</p>
                </div>
            `;
            return;
        }

        // Render card buttons with HTML5 data attributes to completely bypass unescaped inline single quotes
        schResultsGrid.innerHTML = filtered.map(sch => `
            <div class="scholarship-card">
                <div>
                    <span class="sch-badge">${sch.type.charAt(0).toUpperCase() + sch.type.slice(1)}</span>
                    <h4>${sch.name}</h4>
                    <div class="sch-amount">${sch.amount}</div>
                    <div class="sch-details">
                        <div class="sch-detail-item"><i class="fas fa-map-marker-alt"></i> ${sch.country}</div>
                        <div class="sch-detail-item"><i class="fas fa-graduation-cap"></i> ${sch.gpa}</div>
                        <div class="sch-detail-item"><i class="fas fa-language"></i> ${sch.test}</div>
                    </div>
                </div>
                <button class="btn btn--outline btn--sm sch-cta-btn" data-name="${sch.name.replace(/"/g, '&quot;')}" data-country="${sch.country}">
                    Check My Eligibility
                </button>
            </div>
        `).join('');
    }

    if (schSearchInput) {
        schSearchInput.addEventListener('input', renderScholarships);
        schCountrySelect.addEventListener('change', renderScholarships);
        schTypeSelect.addEventListener('change', renderScholarships);
    }
    
    // Global function to trigger drawer for scholarships (preserving backwards compatibility)
    window.openScholarshipDrawer = function (schName, schCountry) {
        window.openDrawerWithContext('scholarship', { scholarshipName: schName, scholarshipCountry: schCountry });
        trackEvent('scholarship_eligibility_click', { scholarship_name: schName });
    };

    // Event Delegation for scholarship grid eligibility buttons
    if (schResultsGrid) {
        schResultsGrid.addEventListener('click', function (e) {
            const btn = e.target.closest('.sch-cta-btn');
            if (btn) {
                e.preventDefault();
                e.stopPropagation(); // Prevent bubbling up to document click close listener
                const schName = btn.getAttribute('data-name');
                const schCountry = btn.getAttribute('data-country');
                window.openDrawerWithContext('scholarship', { scholarshipName: schName, scholarshipCountry: schCountry });
            }
        });
    }

    // Initial load
    renderScholarships();

    // 6. Sliding Floating Drawer Logic
    const drawerToggle = document.getElementById('drawer-toggle');
    const drawerClose = document.getElementById('drawer-close');
    const drawer = document.getElementById('quick-match-drawer');

    if (drawerToggle && drawer && drawerClose) {
        drawerToggle.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation(); // Prevent bubbling up to document click close listener
            if (drawer.classList.contains('open')) {
                drawer.classList.remove('open');
            } else {
                window.openDrawerWithContext('drawer');
            }
            trackEvent('drawer_toggle', { action: drawer.classList.contains('open') ? 'open' : 'close' });
        });

        drawerClose.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
            drawer.classList.remove('open');
        });

        // Close drawer when clicking outside, ignoring clicks on drawer triggers (which handle their own open/close)
        document.addEventListener('click', function (e) {
            if (drawer.classList.contains('open') && 
                !drawer.contains(e.target) && 
                !drawerToggle.contains(e.target) &&
                !e.target.closest('#calc-lead-trigger') &&
                !e.target.closest('.sch-cta-btn')) {
                drawer.classList.remove('open');
            }
        });
    }

    // Drawer form submission handling encapsulated in a re-bindable function
    function bindDrawerFormSubmit() {
        const drawerForm = document.getElementById('drawerForm');
        if (!drawerForm) return;

        drawerForm.addEventListener('submit', async function (e) {
            e.preventDefault();

            const name = document.getElementById('drawer-name').value.trim();
            const phone = document.getElementById('drawer-phone').value.trim();
            const destination = document.getElementById('drawer-destination').value;
            const gpa = document.getElementById('drawer-gpa').value.trim();
            const degree = document.getElementById('drawer-degree').value;

            if (!name || !phone || !gpa) {
                alert('Please fill in all details to get your results!');
                return;
            }

            const submitBtn = drawerForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<span style="display:inline-flex;align-items:center;gap:8px;"><svg width="18" height="18" viewBox="0 0 24 24" style="animation:spin 0.8s linear infinite;"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" fill="none" stroke-dasharray="31.4 31.4" stroke-linecap="round"/></svg> Submitting...</span>';
            submitBtn.disabled = true;

            // Generate context-aware metadata for the lead submission
            let courseName = `${degree} Matched via Drawer`;
            let logMsg = `Matched via Floating Assessment Drawer. GPA/Context: ${gpa}. Intended degree: ${degree}. Preferred country: ${destination}`;
            
            if (leadSource === 'calculator') {
                const totalCostVal = calcTotal ? calcTotal.textContent : 'N/A';
                courseName = `${degree} Cost Inquiry (${destination})`;
                logMsg = `Cost Calculator Lead. Destination: ${destination}. Course: ${degree}. Total Est Cost: ${totalCostVal}. GPA/Context: ${gpa}.`;
            } else if (leadSource === 'scholarship') {
                courseName = `Scholarship Inquiry: ${selectedScholarshipName}`;
                logMsg = `Scholarship Eligibility Check. Scholarship: ${selectedScholarshipName}. Destination: ${destination}. GPA: ${gpa}. Degree: ${degree}.`;
            }

            const payload = {
                name: name,
                email: 'no-email-drawer@evoverseas.com',
                phone: phone,
                destination: destination,
                course: courseName,
                message: logMsg
            };

            try {
                // Submit to Google Sheets in background
                submitFormToGoogleSheets(payload).catch(error => console.error(error));

                // Show elegant, context-specific success screen in drawer body
                const drawerBody = document.querySelector('.drawer-body');
                if (drawerBody) {
                    let successTitle = "Matches Found Successfully!";
                    let successText = `Your profile matches <strong>6 top universities</strong> in ${destination} for a ${degree} program.`;
                    let whatsappBtnText = "Get Matches list on WhatsApp";
                    let whatsappText = `Hi, I just completed the profile evaluation on your website. My name is ${encodeURIComponent(name)}. GPA is ${encodeURIComponent(gpa)}. Please share my matched universities list.`;

                    if (leadSource === 'calculator') {
                        const totalCostVal = calcTotal ? calcTotal.textContent : 'N/A';
                        successTitle = "📄 PDF is Ready!";
                        successText = `Your personalized expense analysis for <strong>${destination}</strong> (estimated at <strong>${totalCostVal}/year</strong>) has been compiled.`;
                        whatsappBtnText = "Get Expense PDF on WhatsApp";
                        whatsappText = `Hi, I just calculated my study cost for ${destination} on your website. The estimated annual cost is ${encodeURIComponent(totalCostVal)}. Please share my detailed Expense PDF on WhatsApp. My name is ${encodeURIComponent(name)}.`;
                    } else if (leadSource === 'scholarship') {
                        successTitle = "🎓 Eligibility Approved!";
                        successText = `Based on your academic score (<strong>${gpa}</strong>), you have a <strong>high chance</strong> of securing the <strong>${selectedScholarshipName}</strong> in ${destination}.`;
                        whatsappBtnText = "Get Scholarship Guide PDF";
                        whatsappText = `Hi, I want to check my eligibility for the ${encodeURIComponent(selectedScholarshipName)} scholarship in ${destination}. My GPA is ${encodeURIComponent(gpa)}. Please share the eligibility details and application guide. My name is ${encodeURIComponent(name)}.`;
                    }

                    drawerBody.innerHTML = `
                        <div style="text-align: center; padding: 40px 10px; animation: fadeIn 0.4s ease;">
                            <div style="font-size: 4rem; margin-bottom: 20px;">${leadSource === 'calculator' ? '📄' : (leadSource === 'scholarship' ? '🎓' : '🎉')}</div>
                            <h3 style="font-family:var(--font-heading); color:var(--color-primary); font-size:var(--text-xl); margin-bottom:12px;">${successTitle}</h3>
                            <p style="font-size:var(--text-sm); color:var(--color-gray-600); margin-bottom:24px;">${successText}</p>
                            
                            <a href="https://wa.me/919666963756?text=${whatsappText}" 
                               target="_blank" 
                               class="btn btn--primary" 
                               style="background: #25D366; width: 100%; border-color:transparent; text-decoration:none; display:inline-flex; align-items:center; justify-content:center; gap:8px;">
                                <i class="fab fa-whatsapp"></i> ${whatsappBtnText}
                            </a>
                            
                            <button class="btn btn--outline reset-drawer-btn" style="width: 100%; margin-top: 12px;">Evaluate Another Profile</button>
                        </div>
                    `;

                    // Bind event listener to reset button (to restore the form without page reload!)
                    const resetBtn = drawerBody.querySelector('.reset-drawer-btn');
                    if (resetBtn) {
                        resetBtn.addEventListener('click', function () {
                            if (originalDrawerBodyHtml) {
                                drawerBody.innerHTML = originalDrawerBodyHtml;
                                bindDrawerFormSubmit();
                            }
                        });
                    }
                }
            } catch (err) {
                console.error(err);
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            }
        });
    }

    // Initial binding on DOM load
    bindDrawerFormSubmit();
});

// Improved form validation
function validateForm() {
    const form = document.getElementById('contactForm');
    const name = form.querySelector('#name').value.trim();
    const email = form.querySelector('#email').value.trim();
    const phone = form.querySelector('#phone').value.trim();
    const destination = form.querySelector('#destination').value;
    const course = form.querySelector('#course').value.trim();

    let isValid = true;

    // Clear previous errors
    clearFormErrors();

    if (!name) {
        showFieldError(form.querySelector('#name'), 'Name is required');
        isValid = false;
    }

    if (!email) {
        showFieldError(form.querySelector('#email'), 'Email is required');
        isValid = false;
    } else if (!validateEmail(email)) {
        showFieldError(form.querySelector('#email'), 'Please enter a valid email address');
        isValid = false;
    }

    if (!phone) {
        showFieldError(form.querySelector('#phone'), 'Phone number is required');
        isValid = false;
    } else if (!validatePhone(phone)) {
        showFieldError(form.querySelector('#phone'), 'Please enter a valid phone number');
        isValid = false;
    }

    if (!destination) {
        showFieldError(form.querySelector('#destination'), 'Please select a destination');
        isValid = false;
    }

    if (!course) {
        showFieldError(form.querySelector('#course'), 'Course interest is required');
        isValid = false;
    }

    return isValid;
}

function clearFormErrors() {
    const errors = document.querySelectorAll('.field-error');
    errors.forEach(error => error.remove());

    const fields = document.querySelectorAll('.form-control');
    fields.forEach(field => {
        field.style.borderColor = 'var(--color-border)';
    });
}

function showMessage(nameOrMessage, type) {
    // Remove any existing messages
    const existingMessages = document.querySelectorAll('.form-message-overlay');
    existingMessages.forEach(msg => msg.remove());

    const contactForm = document.getElementById('contactForm');

    if (type === 'success') {
        // Premium success confirmation
        const messageDiv = document.createElement('div');
        messageDiv.className = 'form-message-overlay';
        messageDiv.innerHTML = `
            <div class="form-message-card success">
                <div class="form-message-icon">
                    <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
                        <circle cx="28" cy="28" r="28" fill="#059669" opacity="0.1"/>
                        <circle cx="28" cy="28" r="20" fill="#059669" opacity="0.2"/>
                        <path d="M20 28.5L25.5 34L36 22" stroke="#059669" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="checkmark-path"/>
                    </svg>
                </div>
                <h3 class="form-message-title">Thank You, ${nameOrMessage}! 🎉</h3>
                <p class="form-message-text">Your application has been submitted successfully. Our counselor will reach out to you within <strong>24 hours</strong>.</p>
                <div class="form-message-actions">
                    <a href="https://wa.me/919666963756?text=Hi%2C%20I%20just%20submitted%20a%20form%20on%20your%20website.%20My%20name%20is%20${encodeURIComponent(nameOrMessage)}." target="_blank" class="form-msg-btn whatsapp">
                        <i class="fab fa-whatsapp"></i> Chat on WhatsApp
                    </a>
                    <button class="form-msg-btn close" onclick="this.closest('.form-message-overlay').remove(); document.getElementById('contactForm').style.display=''">
                        Close
                    </button>
                </div>
            </div>
        `;

        contactForm.parentNode.insertBefore(messageDiv, contactForm);
        contactForm.style.display = 'none';

        // Scroll to message
        messageDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });

        // Show form again after 15 seconds
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.style.opacity = '0';
                messageDiv.style.transition = 'opacity 0.4s ease';
                setTimeout(() => {
                    messageDiv.remove();
                    contactForm.style.display = '';
                }, 400);
            }
        }, 15000);

    } else {
        // Error message
        const messageDiv = document.createElement('div');
        messageDiv.className = 'form-message-overlay';
        messageDiv.innerHTML = `
            <div class="form-message-card error">
                <div class="form-message-icon">
                    <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
                        <circle cx="28" cy="28" r="28" fill="#DC2626" opacity="0.1"/>
                        <circle cx="28" cy="28" r="20" fill="#DC2626" opacity="0.2"/>
                        <path d="M22 22L34 34M34 22L22 34" stroke="#DC2626" stroke-width="3" stroke-linecap="round"/>
                    </svg>
                </div>
                <h3 class="form-message-title">Oops! Something went wrong</h3>
                <p class="form-message-text">${nameOrMessage}</p>
                <div class="form-message-actions">
                    <a href="tel:+919666963756" class="form-msg-btn whatsapp" style="background:#0A2342;">
                        <i class="fas fa-phone-alt"></i> Call Us Directly
                    </a>
                    <button class="form-msg-btn close" onclick="this.closest('.form-message-overlay').remove(); document.getElementById('contactForm').style.display=''">
                        Try Again
                    </button>
                </div>
            </div>
        `;

        contactForm.parentNode.insertBefore(messageDiv, contactForm);
        messageDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });

        setTimeout(() => {
            if (messageDiv.parentNode) messageDiv.remove();
        }, 10000);
    }
}

// Google Sheets Integration Function
async function submitFormToGoogleSheets(data) {
    const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxDvs7F0II0wyRYKF8TTCDv3wSJzlI9kzPfrEmn2pvLtEXwNCDlVzrBDUygUPxGuP8d7w/exec';

    try {
        const response = await fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'text/plain',
            },
            body: JSON.stringify(data),
            redirect: 'follow'
        });

        // Apps Script may return opaque response via redirect
        // If we can parse JSON, great — otherwise treat as success if no error thrown
        try {
            const result = await response.json();
            if (result.result === 'error') {
                throw new Error(result.message || 'Form submission failed');
            }
            return result;
        } catch (parseError) {
            // Response wasn't JSON (common with Apps Script redirects) — treat as success
            console.log('Form submitted (non-JSON response):', response.status);
            return { result: 'success' };
        }
    } catch (error) {
        console.error('Submission error:', error);
        throw error;
    }
}

// Improved email validation (less strict)
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Phone validation (accepts various formats)
function validatePhone(phone) {
    const cleaned = phone.replace(/\s|-|\(|\)/g, '');
    const phoneRegex = /^[\+]?[0-9]{10,15}$/;
    return phoneRegex.test(cleaned);
}

function showFieldError(field, message) {
    field.style.borderColor = 'var(--color-error)';

    // Remove existing error
    const existingError = field.parentNode.querySelector('.field-error');
    if (existingError) {
        existingError.remove();
    }

    const errorDiv = document.createElement('div');
    errorDiv.className = 'field-error';
    errorDiv.style.color = 'var(--color-error)';
    errorDiv.style.fontSize = 'var(--font-size-sm)';
    errorDiv.style.marginTop = 'var(--space-4)';
    errorDiv.textContent = message;

    field.parentNode.appendChild(errorDiv);
}

// Add scroll-based animations
function initScrollAnimations() {
    const animatedElements = document.querySelectorAll('.service-card, .destination-card, .testimonial-card, .journey-card');

    const animationObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }, index * 100);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        animationObserver.observe(el);
    });
}

// Add keyboard navigation support
document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
        const hamburger = document.getElementById('hamburger');
        const navMenu = document.getElementById('nav-menu');

        if (navMenu && navMenu.classList.contains('active')) {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
            document.body.style.overflow = 'auto';
        }
    }
});

// Utility function for scrolling
window.scrollToSection = function (sectionId) {
    const target = document.getElementById(sectionId);
    if (target) {
        const offsetTop = target.offsetTop - 80;
        window.scrollTo({
            top: offsetTop,
            behavior: 'smooth'
        });
    }
};

// Enhanced Analytics Tracking (REPLACE existing trackEvent function)
function trackEvent(eventName, eventData = {}) {
    console.log(`Analytics Event: ${eventName}`, eventData);

    // Send to Google Analytics 4
    if (typeof gtag !== 'undefined') {
        gtag('event', eventName, {
            event_category: eventData.page_section || 'general',
            event_label: eventData.button_text || eventData.service_name || eventData.destination || '',
            value: eventData.value || 1
        });
    }
}

// Add form submission tracking (ADD this to your form submit handler)
var contactFormEl = document.getElementById('contactForm');
if (contactFormEl) {
    contactFormEl.addEventListener('submit', function () {
        if (typeof gtag !== 'undefined') {
            gtag('event', 'form_submit', {
                event_category: 'engagement',
                event_label: 'contact_form',
                value: 1
            });
        }
    });
}


function getPageSection(element) {
    const section = element.closest('section');
    return section ? section.id || section.className : 'unknown';
}

// ...existing code...

// ============================================
// ANNOUNCEMENT BANNER FUNCTIONS
// ============================================
function initAnnounceBanner() {
    const banner = document.getElementById('announceBanner');
    if (!banner) return;

    // Check if banner is enabled via data attribute
    const isEnabled = banner.getAttribute('data-enabled') === 'true';

    // Check if user has closed the banner in this session
    const isClosed = sessionStorage.getItem('bannerClosed') === 'true';

    if (isEnabled && !isClosed) {
        banner.classList.remove('hidden');
        document.body.classList.add('banner-visible');
        // Set CSS variable for banner height
        updateBannerHeight();
        window.addEventListener('resize', updateBannerHeight);
    } else {
        banner.classList.add('hidden');
        document.body.classList.remove('banner-visible');
        document.body.style.setProperty('--banner-height', '0px');
    }
}

function updateBannerHeight() {
    const banner = document.getElementById('announceBanner') || document.getElementById('rebrandBanner');
    if (banner && !banner.classList.contains('hidden')) {
        const height = banner.offsetHeight;
        document.body.style.setProperty('--banner-height', height + 'px');
    }
}

// Close banner function (called from HTML onclick)
window.closeBanner = function () {
    const banner = document.getElementById('announceBanner');
    if (banner) {
        banner.classList.add('hidden');
        document.body.classList.remove('banner-visible');
        document.body.style.setProperty('--banner-height', '0px');
        // Remember that user closed the banner for this session
        sessionStorage.setItem('bannerClosed', 'true');
    }
};

// ============================================
// CLOSE ANNOUNCE BANNER (for onclick handler)
// ============================================
window.closeAnnounceBanner = function () {
    const banner = document.getElementById('announceBanner');
    if (banner) {
        banner.classList.add('hidden');
        document.body.classList.remove('banner-visible');
        document.body.style.setProperty('--banner-height', '0px');
        // Remember that user closed the banner for this session
        sessionStorage.setItem('bannerClosed', 'true');
    }
};

// Initialize announce banner on page load (auto-enable for this banner)
document.addEventListener('DOMContentLoaded', function () {
    const banner = document.getElementById('announceBanner');
    if (banner) {
        // Check if user has closed the banner in this session
        const isClosed = sessionStorage.getItem('bannerClosed') === 'true';

        if (!isClosed) {
            banner.classList.remove('hidden');
            document.body.classList.add('banner-visible');
            // Set CSS variable for banner height
            const height = banner.offsetHeight;
            document.body.style.setProperty('--banner-height', height + 'px');
            window.addEventListener('resize', () => {
                if (!banner.classList.contains('hidden')) {
                    document.body.style.setProperty('--banner-height', banner.offsetHeight + 'px');
                }
            });
        } else {
            banner.classList.add('hidden');
            document.body.classList.remove('banner-visible');
            document.body.style.setProperty('--banner-height', '0px');
        }
    }
});
