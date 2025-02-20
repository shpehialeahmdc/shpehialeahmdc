// project-management.js

class ProjectManager {
    constructor() {
        this.initializeEventListeners();
    }
    
    initializeEventListeners() {
        // Join Project buttons
        document.querySelectorAll('.join-project-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.handleProjectJoin(e));
        });
        
        // File upload handling
        const fileUpload = document.getElementById('projectFileUpload');
        if (fileUpload) {
            fileUpload.addEventListener('change', (e) => this.handleFileUpload(e));
        }
    }
    
    async handleProjectJoin(e) {
        e.preventDefault();
        const projectId = e.target.dataset.projectId;
        
        // Check if user is logged in
        const isLoggedIn = this.checkUserAuth();
        
        if (!isLoggedIn) {
            alert('Please log in to join projects');
            window.location.href = '/login.html';
            return;
        }
        
        try {
            // If you have a backend API
            /*
            const response = await fetch('/api/projects/join', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ projectId })
            });
            
            const result = await response.json();
            */
            
            // Fallback to WhatsApp/Email
            const projectTitle = e.target.dataset.projectTitle;
            const emailBody = `I would like to join the project: ${projectTitle}`;
            
            // Offer both WhatsApp and Email options
            const choice = confirm('How would you like to contact us?\nOK - Email\nCancel - WhatsApp');
            
            if (choice) {
                // Email
                window.location.href = `mailto:shpemdc@mdc.edu?subject=Join Project: ${projectTitle}&body=${encodeURIComponent(emailBody)}`;
            } else {
                // WhatsApp
                // Replace with your WhatsApp group link
                window.location.href = 'https://chat.whatsapp.com/your-group-link';
            }
            
        } catch (error) {
            console.error('Error joining project:', error);
            alert('There was an error joining the project. Please try again or contact an officer.');
        }
    }
    
    async handleFileUpload(e) {
        const files = e.target.files;
        const projectId = e.target.dataset.projectId;
        
        if (!this.checkUserAuth()) {
            alert('Please log in to upload files');
            return;
        }
        
        // Create FormData for file upload
        const formData = new FormData();
        for (let file of files) {
            formData.append('files', file);
        }
        formData.append('projectId', projectId);
        
        try {
            // If you have a backend API
            /*
            const response = await fetch('/api/projects/upload', {
                method: 'POST',
                body: formData
            });
            
            const result = await response.json();
            */
            
            // Fallback to email
            alert('Please send your files to shpemdc@mdc.edu with the project name in the subject line.');
            
        } catch (error) {
            console.error('Error uploading files:', error);
            alert('There was an error uploading your files. Please try again or contact an officer.');
        }
    }
    
    checkUserAuth() {
        // Replace with your actual auth check
        return localStorage.getItem('user_token') !== null;
    }
}

// Initialize the project manager
document.addEventListener('DOMContentLoaded', () => {
    new ProjectManager();
});

// Add this to your existing project-management.js
document.addEventListener('DOMContentLoaded', function() {
    // Create scroll indicator element
    const scrollIndicator = document.createElement('div');
    scrollIndicator.className = 'scroll-indicator';
    scrollIndicator.innerHTML = '↑';
    document.body.appendChild(scrollIndicator);

    // Show/hide scroll indicator based on scroll position
    window.addEventListener('scroll', function() {
        if (window.pageYOffset > 300) {
            scrollIndicator.classList.add('visible');
        } else {
            scrollIndicator.classList.remove('visible');
        }
    });

    // Smooth scroll to top when indicator is clicked
    scrollIndicator.addEventListener('click', function() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
});

function menuMobile() {    /* show/hide the menu */
    let link = document.getElementById("mobile-nav-links");
    
    if (link.style.display === "block") {
        link.style.display = "none";
        
    } else {
        link.style.display = "block";
    }
}

