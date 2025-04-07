// DOM Elements
const contactForm = document.getElementById('contact-form');

// Initialize
function initContact() {
    setupContactEventListeners();
}

// Setup contact event listeners
function setupContactEventListeners() {
    if (contactForm) {
        contactForm.addEventListener('submit', handleContactSubmit);
    }
}

// Handle contact form submission
function handleContactSubmit(e) {
    e.preventDefault();
    
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('contact-email').value.trim();
    const subject = document.getElementById('subject').value.trim();
    const message = document.getElementById('message').value.trim();
    
    if (name && email && subject && message) {
        // In a real app, this would send the form data to a server
        // For demo purposes, we'll just show a success message
        
        alert('Thank you for your message! We will get back to you soon.');
        contactForm.reset();
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initContact);