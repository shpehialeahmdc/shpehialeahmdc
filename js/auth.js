// Auth state management
class AuthManager {
    constructor() {
        this.isAuthenticated = false;
        this.currentUser = null;
        this.baseUrl = 'http://localhost:5000'; // Update this for production
        this.checkAuthState();
        this.initializeEventListeners();
        this.initializeFAQ();
    }

    checkAuthState() {
        const token = localStorage.getItem('shpe_auth_token');
        if (token) {
            this.validateToken(token);
        }
    }

    async validateToken(token) {
        try {
            const response = await fetch(`${this.baseUrl}/api/auth/validate`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                this.isAuthenticated = true;
                this.currentUser = data.user;
                this.updateUI();
            } else {
                this.logout();
            }
        } catch (error) {
            console.error('Auth validation error:', error);
            this.logout();
        }
    }

    async login(email, password) {
        try {
            const response = await fetch(`${this.baseUrl}/api/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            if (response.ok) {
                const data = await response.json();
                localStorage.setItem('shpe_auth_token', data.token);
                this.isAuthenticated = true;
                this.currentUser = data.user;
                this.updateUI();
                window.location.href = '/pages/dashboard.html';
            } else {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Login failed');
            }
        } catch (error) {
            console.error('Login error:', error);
            this.showError(error.message);
        }
    }

    async register(formData) {
        try {
            // Validate email domain
            if (!formData.email.endsWith('@mymdc.net')) {
                throw new Error('Please use your @mymdc.net email address');
            }

            // Validate password strength
            if (formData.password.length < 8) {
                throw new Error('Password must be at least 8 characters long');
            }

            const response = await fetch(`${this.baseUrl}/api/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                this.showSuccess('Registration successful! Please check your email to verify your account.');
                setTimeout(() => {
                    window.location.href = '/pages/login.html';
                }, 2000);
            } else {
                const data = await response.json();
                throw new Error(data.message || 'Registration failed');
            }
        } catch (error) {
            console.error('Registration error:', error);
            this.showError(error.message);
        }
    }

    logout() {
        localStorage.removeItem('shpe_auth_token');
        this.isAuthenticated = false;
        this.currentUser = null;
        this.updateUI();
        window.location.href = '/index.html';
    }

    updateUI() {
        const authStatus = document.querySelector('.auth-status');
        if (authStatus) {
            if (this.isAuthenticated) {
                authStatus.innerHTML = `
                    <span>Welcome, ${this.currentUser.name}</span>
                    <button onclick="auth.logout()" class="logout-btn">Logout</button>
                `;
            } else {
                authStatus.innerHTML = `
                    <a href="/pages/login.html" class="login-btn">Login</a>
                `;
            }
        }
    }

    showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'auth-error';
        errorDiv.textContent = message;
        
        const form = document.querySelector('.auth-form');
        if (form) {
            form.insertBefore(errorDiv, form.firstChild);
            setTimeout(() => errorDiv.remove(), 5000);
        }
    }

    showSuccess(message) {
        const successDiv = document.createElement('div');
        successDiv.className = 'auth-success';
        successDiv.textContent = message;
        
        const form = document.querySelector('.auth-form');
        if (form) {
            form.insertBefore(successDiv, form.firstChild);
            setTimeout(() => successDiv.remove(), 5000);
        }
    }

    initializeFAQ() {
        const faqItems = document.querySelectorAll('.faq-item');
        
        faqItems.forEach(item => {
            const question = item.querySelector('.faq-question');
            const answer = item.querySelector('.faq-answer');
            
            question.addEventListener('click', () => {
                const isActive = item.classList.contains('active');
                
                // Close all other FAQs
                faqItems.forEach(otherItem => {
                    if (otherItem !== item) {
                        otherItem.classList.remove('active');
                    }
                });
                
                // Toggle current FAQ
                item.classList.toggle('active');
            });
        });
    }

    initializeEventListeners() {
        document.addEventListener('DOMContentLoaded', () => {
            // Registration form handling
            const registerForm = document.getElementById('registerForm');
            if (registerForm) {
                registerForm.addEventListener('submit', async (e) => {
                    e.preventDefault();
                    
                    const password = document.getElementById('password').value;
                    const confirmPassword = document.getElementById('confirmPassword').value;

                    if (password !== confirmPassword) {
                        this.showError('Passwords do not match');
                        return;
                    }

                    const formData = {
                        name: document.getElementById('fullName').value,
                        email: document.getElementById('mdcEmail').value,
                        student_id: document.getElementById('studentId').value,
                        password: password
                    };

                    await this.register(formData);
                });
            }

            // Login form handling (on login page)
            const loginForm = document.getElementById('loginForm');
            if (loginForm) {
                loginForm.addEventListener('submit', async (e) => {
                    e.preventDefault();
                    const email = document.getElementById('loginEmail').value;
                    const password = document.getElementById('loginPassword').value;
                    await this.login(email, password);
                });
            }
        });
    }
}

// Initialize auth manager
const auth = new AuthManager();

// FAQ Toggle functionality
document.querySelectorAll('.faq-question').forEach(question => {
    question.addEventListener('click', () => {
        const faqItem = question.parentElement;
        faqItem.classList.toggle('active');
    });
});

// Form submission handling
document.getElementById('registerForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Password validation
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    if (password !== confirmPassword) {
        alert('Passwords do not match!');
        return;
    }

    const formData = {
        fullName: document.getElementById('fullName').value,
        studentId: document.getElementById('studentId').value,
        mdcEmail: document.getElementById('mdcEmail').value,
        password: password
    };

    try {
        const response = await fetch('/api/signup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        alert('Account created successfully! Please check your MDC email for verification.');
        window.location.href = '/login.html';
    } catch (error) {
        console.error('Error:', error);
        alert('Failed to create account. Please try again later.');
    }
});

// Email validation
document.getElementById('mdcEmail').addEventListener('input', function() {
    const email = this.value;
    const isValid = email.endsWith('@mymdc.net');
    this.setCustomValidity(isValid ? '' : 'Please use your @mymdc.net email address');
});

function menuMobile() {    /* show/hide the menu */
    let link = document.getElementById("mobile-nav-links");
    if (link.style.display === "block") {
        link.style.display = "none";
    } else {
        link.style.display = "block";
    }
}
