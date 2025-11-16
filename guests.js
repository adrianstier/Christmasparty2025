// Guest List Management JavaScript

let guests = [];
let filteredGuests = [];

// Initialize guests from localStorage
function initializeGuests() {
    const storedGuests = localStorage.getItem('guests');
    if (storedGuests) {
        guests = JSON.parse(storedGuests);
    } else {
        // Load from guests.json or use sample data
        guests = [
            {
                id: 1,
                name: "Sample Guest 1",
                email: "guest1@example.com",
                phone: "+1-234-567-8901",
                rsvp: "pending",
                dietaryRestrictions: "",
                plusOne: false
            },
            {
                id: 2,
                name: "Sample Guest 2",
                email: "guest2@example.com",
                phone: "+1-234-567-8902",
                rsvp: "confirmed",
                dietaryRestrictions: "Vegetarian",
                plusOne: true
            }
        ];
        saveGuests();
    }
    filteredGuests = [...guests];
    renderGuests();
    updateStats();
}

// Save guests to localStorage
function saveGuests() {
    localStorage.setItem('guests', JSON.stringify(guests));
}

// Render guest table
function renderGuests() {
    const tbody = document.getElementById('guest-table-body');

    if (filteredGuests.length === 0) {
        tbody.innerHTML = '<tr class="no-data"><td colspan="7">No guests found</td></tr>';
        return;
    }

    tbody.innerHTML = filteredGuests.map(guest => `
        <tr>
            <td>${guest.name}</td>
            <td>${guest.email || '-'}</td>
            <td>${guest.phone || '-'}</td>
            <td><span class="rsvp-badge rsvp-${guest.rsvp}">${guest.rsvp}</span></td>
            <td>${guest.dietaryRestrictions || '-'}</td>
            <td>${guest.plusOne ? '✓' : '✗'}</td>
            <td>
                <button class="action-btn edit" onclick="editGuest(${guest.id})">Edit</button>
                <button class="action-btn delete" onclick="deleteGuest(${guest.id})">Delete</button>
            </td>
        </tr>
    `).join('');
}

// Update statistics
function updateStats() {
    const total = guests.length;
    const confirmed = guests.filter(g => g.rsvp === 'confirmed').length;
    const pending = guests.filter(g => g.rsvp === 'pending').length;
    const declined = guests.filter(g => g.rsvp === 'declined').length;

    document.getElementById('total-guests').textContent = total;
    document.getElementById('confirmed-guests').textContent = confirmed;
    document.getElementById('pending-guests').textContent = pending;
    document.getElementById('declined-guests').textContent = declined;
}

// Show add guest modal
function showAddGuestModal() {
    document.getElementById('add-guest-modal').classList.add('active');
    document.getElementById('add-guest-form').reset();
}

// Close add guest modal
function closeAddGuestModal() {
    document.getElementById('add-guest-modal').classList.remove('active');
}

// Add new guest
document.getElementById('add-guest-form').addEventListener('submit', function(e) {
    e.preventDefault();

    const newGuest = {
        id: Date.now(),
        name: document.getElementById('guest-name').value,
        email: document.getElementById('guest-email').value,
        phone: document.getElementById('guest-phone').value,
        rsvp: document.getElementById('guest-rsvp').value,
        dietaryRestrictions: document.getElementById('guest-dietary').value,
        plusOne: document.getElementById('guest-plusone').checked
    };

    guests.push(newGuest);
    saveGuests();
    filteredGuests = [...guests];
    renderGuests();
    updateStats();
    closeAddGuestModal();

    // Add activity
    const activities = JSON.parse(localStorage.getItem('activities')) || [];
    activities.unshift(`Added guest: ${newGuest.name} - ${new Date().toLocaleString()}`);
    if (activities.length > 10) activities.length = 10;
    localStorage.setItem('activities', JSON.stringify(activities));
});

// Edit guest
function editGuest(id) {
    const guest = guests.find(g => g.id === id);
    if (!guest) return;

    const name = prompt('Name:', guest.name);
    if (name === null) return;

    const email = prompt('Email:', guest.email);
    if (email === null) return;

    const phone = prompt('Phone:', guest.phone);
    if (phone === null) return;

    const rsvp = prompt('RSVP Status (confirmed/pending/declined):', guest.rsvp);
    if (rsvp === null) return;

    const dietary = prompt('Dietary Restrictions:', guest.dietaryRestrictions);
    if (dietary === null) return;

    const plusOne = confirm('Bringing a +1?');

    guest.name = name;
    guest.email = email;
    guest.phone = phone;
    guest.rsvp = rsvp;
    guest.dietaryRestrictions = dietary;
    guest.plusOne = plusOne;

    saveGuests();
    applyFilters();
    updateStats();

    // Add activity
    const activities = JSON.parse(localStorage.getItem('activities')) || [];
    activities.unshift(`Updated guest: ${guest.name} - ${new Date().toLocaleString()}`);
    if (activities.length > 10) activities.length = 10;
    localStorage.setItem('activities', JSON.stringify(activities));
}

// Delete guest
function deleteGuest(id) {
    const guest = guests.find(g => g.id === id);
    if (!guest) return;

    if (confirm(`Are you sure you want to delete ${guest.name}?`)) {
        guests = guests.filter(g => g.id !== id);
        saveGuests();
        filteredGuests = [...guests];
        applyFilters();
        updateStats();

        // Add activity
        const activities = JSON.parse(localStorage.getItem('activities')) || [];
        activities.unshift(`Deleted guest: ${guest.name} - ${new Date().toLocaleString()}`);
        if (activities.length > 10) activities.length = 10;
        localStorage.setItem('activities', JSON.stringify(activities));
    }
}

// Search functionality
document.getElementById('search-guests').addEventListener('input', applyFilters);
document.getElementById('filter-rsvp').addEventListener('change', applyFilters);

function applyFilters() {
    const searchTerm = document.getElementById('search-guests').value.toLowerCase();
    const rsvpFilter = document.getElementById('filter-rsvp').value;

    filteredGuests = guests.filter(guest => {
        const matchesSearch =
            guest.name.toLowerCase().includes(searchTerm) ||
            (guest.email && guest.email.toLowerCase().includes(searchTerm)) ||
            (guest.phone && guest.phone.toLowerCase().includes(searchTerm));

        const matchesRsvp = rsvpFilter === 'all' || guest.rsvp === rsvpFilter;

        return matchesSearch && matchesRsvp;
    });

    renderGuests();
}

// Close modal when clicking outside
window.addEventListener('click', function(e) {
    const modal = document.getElementById('add-guest-modal');
    if (e.target === modal) {
        closeAddGuestModal();
    }
});

// Initialize on page load
document.addEventListener('DOMContentLoaded', initializeGuests);
