// main.js - goes in js/main.js
document.addEventListener('DOMContentLoaded', function() {
    // Mobile menu toggle
    const mobileMenu = document.getElementById('mobile-menu');
    const navLinks = document.querySelector('.nav-links');
    
    if (mobileMenu) {
        mobileMenu.addEventListener('click', function() {
            this.classList.toggle('active');
            navLinks.classList.toggle('active');
        });
    }
    
    // Close mobile menu when clicking outside
    document.addEventListener('click', function(event) {
        const isClickInside = navLinks.contains(event.target) || 
                             mobileMenu.contains(event.target);
        
        if (!isClickInside && navLinks.classList.contains('active')) {
            mobileMenu.classList.remove('active');
            navLinks.classList.remove('active');
        }
    });
    
    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    
    // Authentication status check
    function checkAuthStatus() {
        const token = localStorage.getItem('shpe_auth_token');
        const authButtons = document.querySelectorAll('.auth-dependent');
        
        if (token) {
            // User is logged in
            authButtons.forEach(button => {
                if (button.dataset.authState === 'logged-in') {
                    button.style.display = 'block';
                } else {
                    button.style.display = 'none';
                }
            });
        } else {
            // User is logged out
            authButtons.forEach(button => {
                if (button.dataset.authState === 'logged-out') {
                    button.style.display = 'block';
                } else {
                    button.style.display = 'none';
                }
            });
        }
    }
    
    // Initialize authentication check
    checkAuthStatus();
    
    // Handle form submissions
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            const formData = new FormData(this);
            const data = Object.fromEntries(formData.entries());
            
            // Handle different form types
            if (this.id === 'contactForm') {
                handleContactForm(data);
            } else if (this.id === 'rsvpForm') {
                handleRSVP(data);
            }
        });
    });
    
    // Contact form handler
    function handleContactForm(data) {
        // Add your contact form submission logic here
        console.log('Contact form submitted:', data);
    }
    
    // RSVP handler
    function handleRSVP(data) {
        // Add your RSVP submission logic here
        console.log('RSVP submitted:', data);
    }
    
    // Initialize any carousels
    const carousels = document.querySelectorAll('.carousel');
    if (carousels.length > 0) {
        initializeCarousels();
    }
    
    function initializeCarousels() {
        carousels.forEach(carousel => {
            // Add your carousel initialization logic here
        });
    }
    
    // Handle scroll animations
    const animatedElements = document.querySelectorAll('.animate-on-scroll');
    
    function checkScroll() {
        animatedElements.forEach(element => {
            const elementTop = element.getBoundingClientRect().top;
            const windowHeight = window.innerHeight;
            
            if (elementTop < windowHeight * 0.8) {
                element.classList.add('visible');
            }
        });
    }
    
    window.addEventListener('scroll', checkScroll);
    checkScroll(); // Initial check
    
    // Handle theme preference
    const themeToggle = document.querySelector('.theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', function() {
            document.body.classList.toggle('dark-theme');
            const isDark = document.body.classList.contains('dark-theme');
            localStorage.setItem('theme', isDark ? 'dark' : 'light');
        });
    }
    
    // Load saved theme preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-theme');
    }
});

function menuMobile() {    /* show/hide the menu */
    let link = document.getElementById("mobile-nav-links");
    if (link.style.display === "block") {
        link.style.display = "none";
    } else {
        link.style.display = "block";
    }
}
