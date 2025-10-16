// Caloocan City Social Services Management System - JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Initialize all functionality
    initializeTimeAndDate();
    initializeModals();
    initializeServiceCards();
    initializeSmoothScrolling();
    initializeFormValidation();
});

// Live Time and Date Display
function initializeTimeAndDate() {
    const timeElement = document.getElementById('current-time');
    const dateElement = document.getElementById('current-date');
    
    function updateTimeAndDate() {
        const now = new Date();
        
        // Format time (12-hour format with AM/PM)
        const timeOptions = { 
            hour: 'numeric', 
            minute: '2-digit', 
            second: '2-digit',
            hour12: true 
        };
        timeElement.textContent = now.toLocaleTimeString('en-US', timeOptions);
        
        // Format date
        const dateOptions = { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        };
        dateElement.textContent = now.toLocaleDateString('en-US', dateOptions);
    }
    
    // Update immediately and then every second
    updateTimeAndDate();
    setInterval(updateTimeAndDate, 1000);
}

// Modal Functionality
function initializeModals() {
    const loginBtn = document.getElementById('loginBtn');
    const registerBtn = document.getElementById('registerBtn');
    const loginModal = document.getElementById('loginModal');
    const registerModal = document.getElementById('registerModal');
    const closeLoginModal = document.getElementById('closeLoginModal');
    const closeRegisterModal = document.getElementById('closeRegisterModal');
    
    // Open modals
    loginBtn.addEventListener('click', () => {
        loginModal.classList.remove('hidden');
        loginModal.classList.add('modal-enter');
        document.body.style.overflow = 'hidden';
    });
    
    registerBtn.addEventListener('click', () => {
        registerModal.classList.remove('hidden');
        registerModal.classList.add('modal-enter');
        document.body.style.overflow = 'hidden';
    });
    
    // Close modals
    closeLoginModal.addEventListener('click', () => {
        closeModal(loginModal);
    });
    
    closeRegisterModal.addEventListener('click', () => {
        closeModal(registerModal);
    });
    
    // Close modals when clicking outside
    loginModal.addEventListener('click', (e) => {
        if (e.target === loginModal) {
            closeModal(loginModal);
        }
    });
    
    registerModal.addEventListener('click', (e) => {
        if (e.target === registerModal) {
            closeModal(registerModal);
        }
    });
    
    // Close modals with Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            if (!loginModal.classList.contains('hidden')) {
                closeModal(loginModal);
            }
            if (!registerModal.classList.contains('hidden')) {
                closeModal(registerModal);
            }
        }
    });
    
    function closeModal(modal) {
        modal.classList.add('modal-exit');
        setTimeout(() => {
            modal.classList.add('hidden');
            modal.classList.remove('modal-exit', 'modal-enter');
            document.body.style.overflow = 'auto';
        }, 300);
    }
}

// Service Cards Functionality
function initializeServiceCards() {
    const serviceCards = document.querySelectorAll('.service-card');
    
    serviceCards.forEach(card => {
        card.addEventListener('click', function() {
            // Add click effect
            this.style.transform = 'scale(0.98)';
            setTimeout(() => {
                this.style.transform = '';
            }, 150);
            
            // Get service name for potential navigation
            const serviceName = this.querySelector('h3').textContent;
            console.log(`Service clicked: ${serviceName}`);
            
            // Here you can add navigation logic to specific service pages
            // For now, we'll just show an alert
            showServiceInfo(serviceName);
        });
        
        // Add keyboard navigation support
        card.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.click();
            }
        });
        
        // Make cards focusable
        card.setAttribute('tabindex', '0');
        card.setAttribute('role', 'button');
        card.setAttribute('aria-label', `View ${card.querySelector('h3').textContent} services`);
    });
}

// Show service information (placeholder function)
function showServiceInfo(serviceName) {
    const messages = {
        'AICS': 'Assistance to Individuals in Crisis Situation - Emergency financial assistance for individuals and families facing crisis situations.',
        'PDAO': 'Persons with Disability Affairs Office - Specialized services and support for persons with disabilities in our community.',
        'OSCA': 'Office for Senior Citizens Affairs - Dedicated services and programs for senior citizens and elderly care.',
        'AICS': 'Assistance to Individuals in Crisis Situation - Financial assistance for indigent residents in crisis situations.',
        'Livelihood': 'Employment & Income Generation - Support programs for sustainable livelihood and economic empowerment.',
        'Trainings': 'Skills Development & Education - Professional development and skills training programs for all ages.'
    };
    
    // Create a temporary notification
    showNotification(messages[serviceName] || `Information about ${serviceName} services`, 'info');
}

// Smooth Scrolling for Navigation
function initializeSmoothScrolling() {
    const navLinks = document.querySelectorAll('a[href^="#"]');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                const offsetTop = targetElement.offsetTop - 80; // Account for fixed navbar
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Form Validation
function initializeFormValidation() {
    const loginForm = document.querySelector('#loginModal form');
    const registerForm = document.querySelector('#registerModal form');
    
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleLogin(this);
        });
    }
    
    if (registerForm) {
        registerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleRegistration(this);
        });
    }
}

// Handle Login Form Submission
function handleLogin(form) {
    const formData = new FormData(form);
    const username = form.querySelector('input[type="text"]').value;
    const password = form.querySelector('input[type="password"]').value;
    
    // Basic validation
    if (!username || !password) {
        showNotification('Please fill in all required fields.', 'error');
        return;
    }
    
    // Simulate login process
    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.classList.add('loading');
    submitBtn.disabled = true;
    
    setTimeout(() => {
        submitBtn.classList.remove('loading');
        submitBtn.disabled = false;
        
        // Simulate successful login
        showNotification('Login successful! Redirecting...', 'success');
        
        // Close modal after delay
        setTimeout(() => {
            document.getElementById('loginModal').classList.add('hidden');
            document.body.style.overflow = 'auto';
        }, 1500);
        
    }, 2000);
}

// Handle Registration Form Submission
function handleRegistration(form) {
    const firstName = form.querySelector('input[placeholder="First name"]').value;
    const lastName = form.querySelector('input[placeholder="Last name"]').value;
    const email = form.querySelector('input[type="email"]').value;
    const password = form.querySelector('input[placeholder="Create a password"]').value;
    const confirmPassword = form.querySelector('input[placeholder="Confirm your password"]').value;
    const termsAccepted = form.querySelector('input[type="checkbox"]').checked;
    
    // Validation
    if (!firstName || !lastName || !email || !password || !confirmPassword) {
        showNotification('Please fill in all required fields.', 'error');
        return;
    }
    
    if (password !== confirmPassword) {
        showNotification('Passwords do not match.', 'error');
        return;
    }
    
    if (password.length < 8) {
        showNotification('Password must be at least 8 characters long.', 'error');
        return;
    }
    
    if (!termsAccepted) {
        showNotification('Please accept the terms and conditions.', 'error');
        return;
    }
    
    // Simulate registration process
    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.classList.add('loading');
    submitBtn.disabled = true;
    
    setTimeout(() => {
        submitBtn.classList.remove('loading');
        submitBtn.disabled = false;
        
        showNotification('Registration successful! Please check your email for verification.', 'success');
        
        // Close modal after delay
        setTimeout(() => {
            document.getElementById('registerModal').classList.add('hidden');
            document.body.style.overflow = 'auto';
        }, 2000);
        
    }, 2000);
}

// Notification System
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => notification.remove());
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg max-w-sm transform transition-all duration-300 translate-x-full`;
    
    // Set notification content based on type
    const icons = {
        success: '✓',
        error: '✗',
        info: 'ℹ',
        warning: '⚠'
    };
    
    const colors = {
        success: 'bg-green-500 text-white',
        error: 'bg-red-500 text-white',
        info: 'bg-blue-500 text-white',
        warning: 'bg-yellow-500 text-black'
    };
    
    notification.className += ` ${colors[type]}`;
    notification.innerHTML = `
        <div class="flex items-center space-x-3">
            <span class="text-xl font-bold">${icons[type]}</span>
            <p class="text-sm">${message}</p>
        </div>
    `;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.classList.remove('translate-x-full');
    }, 100);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        notification.classList.add('translate-x-full');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 5000);
}

// Add some interactive features to the hero section
document.addEventListener('DOMContentLoaded', function() {
    const heroButtons = document.querySelectorAll('.hero-text button');
    
    heroButtons.forEach(button => {
        button.addEventListener('click', function() {
            const buttonText = this.textContent;
            
            if (buttonText === 'Get Started') {
                // Scroll to services section
                document.querySelector('.grid').scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            } else if (buttonText === 'Learn More') {
                // Show about information
                showNotification('Learn more about Caloocan City Social Services and how we can help you.', 'info');
            }
        });
    });
});

// Add loading states to service card buttons
document.addEventListener('DOMContentLoaded', function() {
    const serviceButtons = document.querySelectorAll('.service-card button');
    
    serviceButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.stopPropagation(); // Prevent card click event
            
            const originalText = this.textContent;
            this.classList.add('loading');
            this.disabled = true;
            
            setTimeout(() => {
                this.classList.remove('loading');
                this.disabled = false;
                this.textContent = originalText;
                
                // Show success message
                showNotification(`Successfully accessed ${originalText} services!`, 'success');
            }, 1500);
        });
    });
});

// Add intersection observer for animations
document.addEventListener('DOMContentLoaded', function() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    // Observe service cards for animation
    const serviceCards = document.querySelectorAll('.service-card');
    serviceCards.forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(card);
    });
});
