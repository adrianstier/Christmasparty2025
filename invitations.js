// Invitations Management JavaScript

let currentInvitation = null;
let invitationStatuses = [];

// Template configurations
const templates = {
    elegant: {
        name: 'Elegant Christmas',
        icon: '🎄',
        bgClass: 'invitation-elegant'
    },
    festive: {
        name: 'Festive Fun',
        icon: '🎅',
        bgClass: 'invitation-festive'
    },
    modern: {
        name: 'Modern Minimalist',
        icon: '✨',
        bgClass: 'invitation-modern'
    },
    winter: {
        name: 'Winter Wonderland',
        icon: '❄️',
        bgClass: 'invitation-winter'
    }
};

// Initialize
function initializeInvitations() {
    loadInvitation();
    loadInvitationStatuses();
    updateStats();
    renderInvitationStatuses();
    populateGuestChecklist();
    updatePreviews();
}

// Load saved invitation
function loadInvitation() {
    const saved = localStorage.getItem('currentInvitation');
    if (saved) {
        currentInvitation = JSON.parse(saved);
        displayCurrentInvitation();
    }
}

// Save invitation
function saveInvitation(invitation) {
    currentInvitation = invitation;
    localStorage.setItem('currentInvitation', JSON.stringify(invitation));
}

// Load invitation statuses
function loadInvitationStatuses() {
    const saved = localStorage.getItem('invitationStatuses');
    if (saved) {
        invitationStatuses = JSON.parse(saved);
    } else {
        // Initialize from guest list
        const guests = JSON.parse(localStorage.getItem('guests')) || [];
        invitationStatuses = guests.map(guest => ({
            guestId: guest.id,
            guestName: guest.name,
            email: guest.email,
            phone: guest.phone,
            status: 'not_sent',
            sentDate: null,
            responseDate: null,
            method: null,
            message: ''
        }));
        saveInvitationStatuses();
    }
}

// Save invitation statuses
function saveInvitationStatuses() {
    localStorage.setItem('invitationStatuses', JSON.stringify(invitationStatuses));
}

// Display current invitation
function displayCurrentInvitation() {
    if (!currentInvitation) return;

    const section = document.getElementById('current-invitation-section');
    const preview = document.getElementById('invitation-preview');

    section.style.display = 'block';

    const template = templates[currentInvitation.template];

    preview.innerHTML = `
        <div class="invitation-card-mini ${template.bgClass}">
            <div class="invitation-icon-mini">${template.icon}</div>
            <h3>${currentInvitation.title}</h3>
            <div class="invitation-detail">📅 ${formatDate(currentInvitation.date)}</div>
            <div class="invitation-detail">⏰ ${currentInvitation.time}</div>
            <div class="invitation-detail">📍 ${currentInvitation.venue}</div>
        </div>
    `;
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

// Update stats
function updateStats() {
    const sent = invitationStatuses.filter(s => s.status !== 'not_sent').length;
    const accepted = invitationStatuses.filter(s => s.status === 'accepted').length;
    const pending = invitationStatuses.filter(s => s.status === 'sent').length;
    const declined = invitationStatuses.filter(s => s.status === 'declined').length;

    document.getElementById('invites-sent').textContent = sent;
    document.getElementById('invites-accepted').textContent = accepted;
    document.getElementById('invites-pending').textContent = pending;
    document.getElementById('invites-declined').textContent = declined;
}

// Render invitation statuses
function renderInvitationStatuses() {
    const tbody = document.getElementById('invitation-status-body');
    const searchTerm = document.getElementById('search-invitations').value.toLowerCase();
    const statusFilter = document.getElementById('filter-status').value;

    let filtered = invitationStatuses.filter(status => {
        const matchesSearch = status.guestName.toLowerCase().includes(searchTerm);
        const matchesFilter = statusFilter === 'all' || status.status === statusFilter;
        return matchesSearch && matchesFilter;
    });

    if (filtered.length === 0) {
        tbody.innerHTML = '<tr class="no-data"><td colspan="6">No invitations found</td></tr>';
        return;
    }

    tbody.innerHTML = filtered.map(status => {
        const statusBadge = getStatusBadge(status.status);
        const method = status.method ? (status.method === 'email' ? '📧 Email' : '💬 SMS') : '-';
        const responseDate = status.responseDate ? new Date(status.responseDate).toLocaleDateString() : '-';
        const contact = status.email || status.phone || 'No contact info';

        return `
            <tr>
                <td>${status.guestName}</td>
                <td>${contact}</td>
                <td>${method}</td>
                <td>${statusBadge}</td>
                <td>${responseDate}</td>
                <td>
                    <button class="action-btn edit" onclick="resendInvitation(${status.guestId})">Resend</button>
                    <button class="action-btn delete" onclick="viewGuestMessage(${status.guestId})">View</button>
                </td>
            </tr>
        `;
    }).join('');
}

// Get status badge HTML
function getStatusBadge(status) {
    const badges = {
        not_sent: '<span class="rsvp-badge" style="background: #F3F4F6; color: #6B7280;">Not Sent</span>',
        sent: '<span class="rsvp-badge rsvp-pending">Sent</span>',
        accepted: '<span class="rsvp-badge rsvp-confirmed">Accepted</span>',
        declined: '<span class="rsvp-badge rsvp-declined">Declined</span>'
    };
    return badges[status] || badges.not_sent;
}

// Select template
function selectTemplate(templateId) {
    document.getElementById('invitation-template').value = templateId;
    showCreateInvitationModal();
}

// Show create invitation modal
function showCreateInvitationModal() {
    const modal = document.getElementById('create-invitation-modal');
    modal.classList.add('active');

    // Pre-fill with current invitation if exists
    if (currentInvitation) {
        document.getElementById('event-title').value = currentInvitation.title;
        document.getElementById('event-date').value = currentInvitation.date;
        document.getElementById('event-time').value = currentInvitation.time;
        document.getElementById('event-venue').value = currentInvitation.venue;
        document.getElementById('event-message').value = currentInvitation.message || '';
        document.getElementById('dress-code').value = currentInvitation.dressCode || '';
        document.getElementById('rsvp-deadline').value = currentInvitation.rsvpDeadline || '';
        document.getElementById('special-instructions').value = currentInvitation.specialInstructions || '';
        document.getElementById('invitation-template').value = currentInvitation.template;
    }
}

// Close create invitation modal
function closeCreateInvitationModal() {
    document.getElementById('create-invitation-modal').classList.remove('active');
}

// Create invitation form submit
document.getElementById('create-invitation-form').addEventListener('submit', function(e) {
    e.preventDefault();

    const invitation = {
        title: document.getElementById('event-title').value,
        template: document.getElementById('invitation-template').value,
        date: document.getElementById('event-date').value,
        time: document.getElementById('event-time').value,
        venue: document.getElementById('event-venue').value,
        message: document.getElementById('event-message').value,
        dressCode: document.getElementById('dress-code').value,
        rsvpDeadline: document.getElementById('rsvp-deadline').value,
        specialInstructions: document.getElementById('special-instructions').value,
        createdDate: new Date().toISOString()
    };

    saveInvitation(invitation);
    displayCurrentInvitation();
    closeCreateInvitationModal();

    // Add activity
    const activities = JSON.parse(localStorage.getItem('activities')) || [];
    activities.unshift(`Created invitation: ${invitation.title} - ${new Date().toLocaleString()}`);
    if (activities.length > 10) activities.length = 10;
    localStorage.setItem('activities', JSON.stringify(activities));

    alert('Invitation created successfully!');
});

// Edit invitation
function editInvitation() {
    showCreateInvitationModal();
}

// Delete invitation
function deleteInvitation() {
    if (confirm('Are you sure you want to delete this invitation?')) {
        localStorage.removeItem('currentInvitation');
        currentInvitation = null;
        document.getElementById('current-invitation-section').style.display = 'none';

        // Add activity
        const activities = JSON.parse(localStorage.getItem('activities')) || [];
        activities.unshift(`Deleted invitation - ${new Date().toLocaleString()}`);
        if (activities.length > 10) activities.length = 10;
        localStorage.setItem('activities', JSON.stringify(activities));
    }
}

// Preview invitation
function previewInvitation() {
    if (!currentInvitation) {
        alert('Please create an invitation first!');
        return;
    }

    // Build RSVP URL with invitation data
    const params = new URLSearchParams({
        title: currentInvitation.title,
        date: currentInvitation.date,
        time: currentInvitation.time,
        venue: currentInvitation.venue,
        message: currentInvitation.message || '',
        template: currentInvitation.template,
        dressCode: currentInvitation.dressCode || '',
        rsvpDeadline: currentInvitation.rsvpDeadline || '',
        specialInstructions: currentInvitation.specialInstructions || ''
    });

    window.open(`rsvp.html?${params.toString()}`, '_blank');
}

// Show send invitation modal
function showSendInvitationModal() {
    if (!currentInvitation) {
        alert('Please create an invitation first!');
        return;
    }

    const modal = document.getElementById('send-invitation-modal');
    modal.classList.add('active');
    populateGuestChecklist();
    updatePreviews();
}

// Close send invitation modal
function closeSendInvitationModal() {
    document.getElementById('send-invitation-modal').classList.remove('active');
}

// Populate guest checklist
function populateGuestChecklist() {
    const guests = JSON.parse(localStorage.getItem('guests')) || [];
    const checklist = document.getElementById('guest-checklist');

    if (guests.length === 0) {
        checklist.innerHTML = '<p style="color: var(--text-tertiary); font-style: italic;">No guests found. Add guests first!</p>';
        return;
    }

    checklist.innerHTML = guests.map(guest => {
        const status = invitationStatuses.find(s => s.guestId === guest.id);
        const contactMethod = guest.email ? 'Email' : guest.phone ? 'SMS' : 'No contact';
        const disabled = !guest.email && !guest.phone;

        return `
            <label class="guest-checkbox-item" ${disabled ? 'style="opacity: 0.5;"' : ''}>
                <input type="checkbox"
                       value="${guest.id}"
                       class="guest-select-checkbox"
                       ${disabled ? 'disabled' : ''}
                       ${status && status.status !== 'not_sent' ? 'checked' : ''}>
                <div class="guest-info">
                    <strong>${guest.name}</strong>
                    <small>${guest.email || guest.phone || 'No contact info'} (${contactMethod})</small>
                </div>
            </label>
        `;
    }).join('');
}

// Toggle select all
function toggleSelectAll() {
    const selectAll = document.getElementById('select-all-guests');
    const checkboxes = document.querySelectorAll('.guest-select-checkbox:not([disabled])');

    checkboxes.forEach(cb => {
        cb.checked = selectAll.checked;
    });
}

// Switch preview tab
function switchPreviewTab(tab) {
    const tabs = document.querySelectorAll('.preview-tab');
    const contents = document.querySelectorAll('.preview-content');

    tabs.forEach(t => t.classList.remove('active'));
    contents.forEach(c => c.style.display = 'none');

    event.target.classList.add('active');
    document.getElementById(`${tab}-preview`).style.display = 'block';
}

// Update previews
function updatePreviews() {
    if (!currentInvitation) return;

    const rsvpUrl = `${window.location.origin}/rsvp.html?id=GUEST_ID`;

    // Email preview
    const emailPreview = document.getElementById('email-preview-body');
    emailPreview.innerHTML = `
        <div style="padding: 20px; background: white; border-radius: 12px;">
            <div style="text-align: center; margin-bottom: 20px;">
                <h2 style="color: #B91C1C; margin-bottom: 10px;">🎄 You're Invited! 🎄</h2>
                <h3>${currentInvitation.title}</h3>
            </div>
            <div style="margin: 20px 0;">
                <p><strong>📅 Date:</strong> ${formatDate(currentInvitation.date)}</p>
                <p><strong>⏰ Time:</strong> ${currentInvitation.time}</p>
                <p><strong>📍 Venue:</strong> ${currentInvitation.venue}</p>
                ${currentInvitation.dressCode ? `<p><strong>👔 Dress Code:</strong> ${currentInvitation.dressCode}</p>` : ''}
            </div>
            <p style="line-height: 1.6; margin: 20px 0;">${currentInvitation.message}</p>
            <div style="text-align: center; margin: 30px 0;">
                <a href="${rsvpUrl}" style="display: inline-block; background: linear-gradient(135deg, #B91C1C 0%, #DC2626 100%); color: white; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: 600;">
                    RSVP Now
                </a>
            </div>
            ${currentInvitation.rsvpDeadline ? `<p style="text-align: center; color: #6B7280;"><small>Please respond by ${formatDate(currentInvitation.rsvpDeadline)}</small></p>` : ''}
        </div>
    `;

    // SMS preview
    const smsPreview = document.getElementById('sms-preview-body');
    smsPreview.innerHTML = `
        🎄 ${currentInvitation.title}

        📅 ${formatDate(currentInvitation.date)}
        ⏰ ${currentInvitation.time}
        📍 ${currentInvitation.venue}

        ${currentInvitation.message.substring(0, 100)}${currentInvitation.message.length > 100 ? '...' : ''}

        RSVP here: ${rsvpUrl}
        ${currentInvitation.rsvpDeadline ? `\n⏳ Please respond by ${formatDate(currentInvitation.rsvpDeadline)}` : ''}
    `;
}

// Send invitations
function sendInvitations() {
    const selectedGuests = Array.from(document.querySelectorAll('.guest-select-checkbox:checked'))
        .map(cb => parseInt(cb.value));

    if (selectedGuests.length === 0) {
        alert('Please select at least one guest!');
        return;
    }

    const method = document.querySelector('input[name="delivery-method"]:checked').value;
    const guests = JSON.parse(localStorage.getItem('guests')) || [];

    let sentCount = 0;

    selectedGuests.forEach(guestId => {
        const guest = guests.find(g => g.id === guestId);
        if (!guest) return;

        let deliveryMethod = method;
        if (method === 'auto') {
            deliveryMethod = guest.email ? 'email' : guest.phone ? 'sms' : null;
        } else if (method === 'email' && !guest.email) {
            return;
        } else if (method === 'sms' && !guest.phone) {
            return;
        }

        if (!deliveryMethod) return;

        // Update invitation status
        const statusIndex = invitationStatuses.findIndex(s => s.guestId === guestId);
        if (statusIndex !== -1) {
            invitationStatuses[statusIndex].status = 'sent';
            invitationStatuses[statusIndex].sentDate = new Date().toISOString();
            invitationStatuses[statusIndex].method = deliveryMethod;
        } else {
            invitationStatuses.push({
                guestId: guest.id,
                guestName: guest.name,
                email: guest.email,
                phone: guest.phone,
                status: 'sent',
                sentDate: new Date().toISOString(),
                responseDate: null,
                method: deliveryMethod,
                message: ''
            });
        }

        sentCount++;

        // In a real application, this would call an API to send actual emails/SMS
        console.log(`Sending ${deliveryMethod} to ${guest.name} (${guest.email || guest.phone})`);
    });

    saveInvitationStatuses();
    updateStats();
    renderInvitationStatuses();
    closeSendInvitationModal();

    // Add activity
    const activities = JSON.parse(localStorage.getItem('activities')) || [];
    activities.unshift(`Sent ${sentCount} invitation(s) - ${new Date().toLocaleString()}`);
    if (activities.length > 10) activities.length = 10;
    localStorage.setItem('activities', JSON.stringify(activities));

    alert(`Successfully sent ${sentCount} invitation(s)!\n\nNote: In a production environment, actual emails/SMS would be sent. For now, invitation status has been updated.`);
}

// Resend invitation
function resendInvitation(guestId) {
    const guest = JSON.parse(localStorage.getItem('guests') || '[]').find(g => g.id === guestId);
    if (!guest) return;

    if (confirm(`Resend invitation to ${guest.name}?`)) {
        const statusIndex = invitationStatuses.findIndex(s => s.guestId === guestId);
        if (statusIndex !== -1) {
            invitationStatuses[statusIndex].sentDate = new Date().toISOString();
            saveInvitationStatuses();
            renderInvitationStatuses();
            alert(`Invitation resent to ${guest.name}!`);
        }
    }
}

// View guest message
function viewGuestMessage(guestId) {
    const status = invitationStatuses.find(s => s.guestId === guestId);
    if (!status) return;

    const message = status.message || 'No message provided';
    alert(`Message from ${status.guestName}:\n\n${message}`);
}

// Search and filter
document.getElementById('search-invitations').addEventListener('input', renderInvitationStatuses);
document.getElementById('filter-status').addEventListener('change', renderInvitationStatuses);

// Close modals on outside click
window.addEventListener('click', function(e) {
    const createModal = document.getElementById('create-invitation-modal');
    const sendModal = document.getElementById('send-invitation-modal');

    if (e.target === createModal) {
        closeCreateInvitationModal();
    }
    if (e.target === sendModal) {
        closeSendInvitationModal();
    }
});

// Initialize on page load
document.addEventListener('DOMContentLoaded', initializeInvitations);
