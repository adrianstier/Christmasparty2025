// RSVP Page JavaScript

// Initialize
function initializeRSVP() {
    loadInvitationFromURL();
    setupFormHandlers();
}

// Load invitation details from URL parameters
function loadInvitationFromURL() {
    const params = new URLSearchParams(window.location.search);

    // Get invitation details from URL
    const title = params.get('title') || 'Christmas Party 2025';
    const date = params.get('date') || '2025-12-13';
    const time = params.get('time') || '15:00';
    const venue = params.get('venue') || '123 Holiday Lane, North Pole';
    const message = params.get('message') || 'Join us for a magical evening of celebration, joy, and festive cheer!';
    const template = params.get('template') || 'elegant';
    const dressCode = params.get('dressCode') || '';
    const rsvpDeadline = params.get('rsvpDeadline') || '';
    const specialInstructions = params.get('specialInstructions') || '';

    // Apply template styling
    applyTemplate(template);

    // Populate invitation details
    document.getElementById('event-title').textContent = title;
    document.getElementById('event-date').textContent = formatDate(date);
    document.getElementById('event-time').textContent = formatTime(time);
    document.getElementById('event-venue').textContent = venue;
    document.getElementById('event-message').textContent = message;

    // Show optional fields if they exist
    if (dressCode) {
        document.getElementById('dress-code').textContent = dressCode;
        document.getElementById('dress-code-row').style.display = 'flex';
    }

    if (rsvpDeadline) {
        document.getElementById('rsvp-deadline').textContent = formatDate(rsvpDeadline);
        document.getElementById('rsvp-deadline-row').style.display = 'flex';
    }

    if (specialInstructions) {
        document.getElementById('special-instructions').textContent = specialInstructions;
        document.getElementById('special-instructions-section').style.display = 'block';
    }

    // Store invitation data for RSVP submission
    window.invitationData = {
        title, date, time, venue, message, template,
        dressCode, rsvpDeadline, specialInstructions
    };
}

// Apply template styling
function applyTemplate(template) {
    const templates = {
        elegant: { icon: '🎄', class: 'invitation-elegant' },
        festive: { icon: '🎅', class: 'invitation-festive' },
        modern: { icon: '✨', class: 'invitation-modern' },
        winter: { icon: '❄️', class: 'invitation-winter' },
        tiki: { icon: '🌺', class: 'invitation-tiki' }
    };

    const selectedTemplate = templates[template] || templates.elegant;

    document.getElementById('invitation-icon').textContent = selectedTemplate.icon;
    document.getElementById('invitation-card').className = `invitation-display-full ${selectedTemplate.class}`;
}

// Format date
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// Format time
function formatTime(timeString) {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
}

// Setup form handlers
function setupFormHandlers() {
    // Show/hide fields based on RSVP response
    const responseOptions = document.querySelectorAll('input[name="rsvp-response"]');
    responseOptions.forEach(option => {
        option.addEventListener('change', function() {
            const acceptFields = document.getElementById('accept-fields');
            if (this.value === 'accept') {
                acceptFields.style.display = 'block';
            } else {
                acceptFields.style.display = 'none';
            }
        });
    });

    // Handle form submission
    document.getElementById('rsvp-form').addEventListener('submit', handleRSVPSubmit);
}

// Handle RSVP form submission
function handleRSVPSubmit(e) {
    e.preventDefault();

    const guestName = document.getElementById('guest-name').value;
    const guestEmail = document.getElementById('guest-email').value;
    const response = document.querySelector('input[name="rsvp-response"]:checked').value;
    const guestCount = response === 'accept' ? document.getElementById('guest-count').value : '0';
    const dietaryRestrictions = response === 'accept' ? document.getElementById('dietary-restrictions').value : '';
    const guestMessage = document.getElementById('guest-message').value;

    // Create RSVP object
    const rsvp = {
        guestName,
        guestEmail,
        response,
        guestCount: parseInt(guestCount),
        dietaryRestrictions,
        message: guestMessage,
        responseDate: new Date().toISOString(),
        invitationData: window.invitationData
    };

    // Save RSVP
    saveRSVP(rsvp);

    // Update UI to show success
    showSuccessMessage(response);

    // In a real application, this would send the RSVP to a backend API
    console.log('RSVP submitted:', rsvp);
}

// Save RSVP to localStorage
function saveRSVP(rsvp) {
    // Get existing RSVPs
    const rsvps = JSON.parse(localStorage.getItem('rsvps')) || [];

    // Check if this guest already responded
    const existingIndex = rsvps.findIndex(r =>
        r.guestName.toLowerCase() === rsvp.guestName.toLowerCase() ||
        (r.guestEmail && rsvp.guestEmail && r.guestEmail.toLowerCase() === rsvp.guestEmail.toLowerCase())
    );

    if (existingIndex !== -1) {
        // Update existing RSVP
        rsvps[existingIndex] = rsvp;
    } else {
        // Add new RSVP
        rsvps.push(rsvp);
    }

    localStorage.setItem('rsvps', JSON.stringify(rsvps));

    // Update guest list if exists
    updateGuestListWithRSVP(rsvp);

    // Update invitation statuses
    updateInvitationStatus(rsvp);
}

// Update guest list with RSVP
function updateGuestListWithRSVP(rsvp) {
    const guests = JSON.parse(localStorage.getItem('guests')) || [];

    // Try to find matching guest by name or email
    const guestIndex = guests.findIndex(g =>
        g.name.toLowerCase() === rsvp.guestName.toLowerCase() ||
        (g.email && rsvp.guestEmail && g.email.toLowerCase() === rsvp.guestEmail.toLowerCase())
    );

    if (guestIndex !== -1) {
        // Update existing guest
        guests[guestIndex].rsvp = rsvp.response === 'accept' ? 'confirmed' : 'declined';
        if (rsvp.dietaryRestrictions) {
            guests[guestIndex].dietaryRestrictions = rsvp.dietaryRestrictions;
        }
        localStorage.setItem('guests', JSON.stringify(guests));
    } else {
        // Add new guest if they're not in the list
        const newGuest = {
            id: Date.now(),
            name: rsvp.guestName,
            email: rsvp.guestEmail || '',
            phone: '',
            rsvp: rsvp.response === 'accept' ? 'confirmed' : 'declined',
            dietaryRestrictions: rsvp.dietaryRestrictions || '',
            plusOne: rsvp.guestCount > 1
        };
        guests.push(newGuest);
        localStorage.setItem('guests', JSON.stringify(guests));
    }
}

// Update invitation status
function updateInvitationStatus(rsvp) {
    const statuses = JSON.parse(localStorage.getItem('invitationStatuses')) || [];

    // Find matching invitation status
    const statusIndex = statuses.findIndex(s =>
        s.guestName.toLowerCase() === rsvp.guestName.toLowerCase() ||
        (s.email && rsvp.guestEmail && s.email.toLowerCase() === rsvp.guestEmail.toLowerCase())
    );

    if (statusIndex !== -1) {
        statuses[statusIndex].status = rsvp.response === 'accept' ? 'accepted' : 'declined';
        statuses[statusIndex].responseDate = rsvp.responseDate;
        statuses[statusIndex].message = rsvp.message;
        localStorage.setItem('invitationStatuses', JSON.stringify(statuses));
    }
}

// Show success message
function showSuccessMessage(response) {
    const formSection = document.getElementById('rsvp-form-section');
    const successSection = document.getElementById('success-message');
    const successText = document.getElementById('success-text');

    formSection.style.display = 'none';
    successSection.style.display = 'block';

    if (response === 'accept') {
        successText.textContent = "Your RSVP has been received. We look forward to celebrating with you!";
    } else {
        successText.textContent = "Thank you for letting us know. We'll miss you at the celebration!";
    }

    // Scroll to success message
    successSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', initializeRSVP);
