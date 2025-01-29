// Auth state management
class AuthManager {
    constructor() {
        this.isAuthenticated = false;
        this.currentUser = null;
        this.checkAuthState();
    }

    checkAuthState() {
        const token = localStorage.getItem('shpe_auth_token');
        if (token) {
            this.validateToken(token);
        }
    }

    async validateToken(token) {
        try {
            const response = await fetch('/api/auth/validate', {
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
            const response = await fetch('/api/auth/login', {
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
                window.location.href = '/dashboard.html';
            } else {
                throw new Error('Login failed');
            }
        } catch (error) {
            console.error('Login error:', error);
            this.showError('Invalid email or password');
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
        const authButtons = document.querySelectorAll('.auth-status');
        authButtons.forEach(button => {
            if (this.isAuthenticated) {
                button.innerHTML = `
                    <span>Welcome, ${this.currentUser.name}</span>
                    <button onclick="auth.logout()">Logout</button>
                `;
            } else {
                button.innerHTML = `
                    <a href="/login.html">Login</a>
                    <a href="/join.html" class="join-btn">Join SHPE</a>
                `;
            }
        });
    }

    showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'auth-error';
        errorDiv.textContent = message;
        
        const form = document.querySelector('.auth-form');
        form.insertBefore(errorDiv, form.firstChild);
        
        setTimeout(() => errorDiv.remove(), 5000);
    }
}

// Initialize auth manager
const auth = new AuthManager();

// Handle login form submission
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            await auth.login(email, password);
        });
    }
});