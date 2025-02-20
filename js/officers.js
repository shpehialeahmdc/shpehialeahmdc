document.addEventListener('DOMContentLoaded', function() {
    // Add hover effect for officer cards
    const officerCards = document.querySelectorAll('.officer-card');
    
    officerCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });

    // Add smooth scroll for leadership section link
    const leadershipLink = document.querySelector('a[href="#leadership"]');
    if (leadershipLink) {
        leadershipLink.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector('#leadership');
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    }

    // Add copy email functionality
    const contactButtons = document.querySelectorAll('.contact-btn');
    contactButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const email = this.getAttribute('href').replace('mailto:', '');
            navigator.clipboard.writeText(email).then(() => {
                // Create and show tooltip
                const tooltip = document.createElement('div');
                tooltip.className = 'email-tooltip';
                tooltip.textContent = 'Email copied!';
                this.appendChild(tooltip);
                
                // Remove tooltip after 2 seconds
                setTimeout(() => {
                    tooltip.remove();
                }, 2000);
            });
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
