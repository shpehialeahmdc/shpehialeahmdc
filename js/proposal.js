// proposal.js
document.addEventListener('DOMContentLoaded', function() {
    const proposalForm = document.getElementById('projectProposalForm');
    
    // Populate officers dropdown
    const officerSelect = document.getElementById('supervisingOfficer');
    const officers = [
        { id: 1, name: "Cesar Roque", position: "President" },
        // Add other officers here
    ];
    
    officers.forEach(officer => {
        const option = document.createElement('option');
        option.value = officer.id;
        option.textContent = `${officer.name} - ${officer.position}`;
        officerSelect.appendChild(option);
    });
    
    // Handle form submission
    proposalForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const formData = new FormData(this);
        
        try {
            // If you have a backend API
            /*
            const response = await fetch('/api/proposals', {
                method: 'POST',
                body: formData
            });
            
            const result = await response.json();
            */
            
            // For email fallback
            const emailBody = `
                New Project Proposal
                
                Title: ${formData.get('projectTitle')}
                Category: ${formData.get('projectCategory')}
                Description: ${formData.get('projectDescription')}
                Objectives: ${formData.get('projectObjectives')}
                Required Resources: ${formData.get('requiredResources')}
                Team Size: ${formData.get('teamSize')}
                Timeline: ${formData.get('timeline')}
                Supervising Officer: ${formData.get('supervisingOfficer')}
                Additional Info: ${formData.get('additionalInfo')}
            `;
            
            // Redirect to email client
            window.location.href = `mailto:shpemdc@mdc.edu?subject=New Project Proposal: ${formData.get('projectTitle')}&body=${encodeURIComponent(emailBody)}`;
            
            alert('Thank you for your proposal! You will be redirected to your email client to send the proposal.');
            
        } catch (error) {
            console.error('Error submitting proposal:', error);
            alert('There was an error submitting your proposal. Please try again or contact an officer.');
        }
    });
});