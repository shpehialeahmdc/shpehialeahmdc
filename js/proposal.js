// proposal.js
document.addEventListener('DOMContentLoaded', function() {
    const proposalForm = document.getElementById('projectProposalForm');
    
    // Officer data
    const officers = [
        { 
            id: 1, 
            name: "Cesar Roque", 
            position: "President",
            email: "cesar.roque002@mymdc.net",
            status: "owner"
        }
        // Add other officers here as needed
    ];
    
    // Initialize officer dropdown
    initializeOfficerDropdown();
    
    // Form submission handler
    proposalForm.addEventListener('submit', handleFormSubmission);

    // Initialize officer dropdown
    function initializeOfficerDropdown() {
        const officerSelect = document.getElementById('supervisingOfficer');
        
        officers.forEach(officer => {
            const option = document.createElement('option');
            option.value = officer.id;
            option.textContent = `${officer.name} - ${officer.position}`;
            option.dataset.email = officer.email;
            option.dataset.status = officer.status;
            officerSelect.appendChild(option);
        });

        // Handle officer selection styling
        officerSelect.addEventListener('change', function() {
            const selectedOption = this.options[this.selectedIndex];
            this.style.borderColor = selectedOption.dataset.status === 'owner' ? '#000033' : '';
            this.style.backgroundColor = selectedOption.dataset.status === 'owner' ? '#f0f0f5' : '';
        });
    }

    // Validate form data
    function validateForm(formData) {
        const required = ['projectTitle', 'projectCategory', 'projectDescription', 
                         'projectObjectives', 'requiredResources', 'teamSize', 'timeline'];
        
        for (let field of required) {
            if (!formData.get(field)) {
                throw new Error(`Please fill in the ${field.replace('project', '')} field`);
            }
        }
        return true;
    }

    // Create email content
    function createEmailContent(formData, officerSelect) {
        return {
            to: "cesar.roque002@mymdc.net",
            subject: `New Project Proposal: ${formData.get('projectTitle')}`,
            body: `
Project Proposal Details:
========================

Title: ${formData.get('projectTitle')}
Category: ${formData.get('projectCategory')}

Description:
-----------
${formData.get('projectDescription')}

Objectives:
----------
${formData.get('projectObjectives')}

Required Resources:
----------------
${formData.get('requiredResources')}

Team Information:
---------------
Estimated Team Size: ${formData.get('teamSize')}
Timeline: ${formData.get('timeline')}
Supervising Officer: ${officerSelect.options[officerSelect.selectedIndex].textContent}

Additional Information:
--------------------
${formData.get('additionalInfo') || 'None provided'}

Preliminary Research:
------------------
${formData.get('preliminaryResearch') || 'None provided'}

Submitted through SHPE MDC Hialeah website`
        };
    }

    // Show success message
    function showSuccessMessage() {
        const successMessage = document.createElement('div');
        successMessage.className = 'success-message';
        successMessage.innerHTML = `
            <div class="success-content">
                <h3>Proposal Ready to Send!</h3>
                <p>Your email client should have opened with the proposal details.</p>
                <p>Please send the email to complete your submission.</p>
                <button class="close-message">Close</button>
            </div>
        `;
        
        document.body.appendChild(successMessage);

        successMessage.querySelector('.close-message').addEventListener('click', () => {
            successMessage.remove();
            proposalForm.reset();
        });
    }

    // Handle form submission
    async function handleFormSubmission(e) {
        e.preventDefault();
        const formData = new FormData(this);
        const officerSelect = document.getElementById('supervisingOfficer');
        
        try {
            if (validateForm(formData)) {
                const emailData = createEmailContent(formData, officerSelect);

                // Since we're using Live Server (local development),
                // directly open email client instead of making API call
                const mailtoLink = `mailto:${emailData.to}?subject=${encodeURIComponent(emailData.subject)}&body=${encodeURIComponent(emailData.body)}`;
                window.location.href = mailtoLink;
                
                showSuccessMessage();
            }
        } catch (error) {
            alert(error.message);
        }
    }
});
