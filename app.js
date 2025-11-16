// Homepage JavaScript - Party Planning Central

// Initialize party details from localStorage or defaults
function initializePartyDetails() {
    const defaults = {
        date: 'December 20, 2025',
        time: '6:00 PM - 11:00 PM',
        venue: 'TBD'
    };

    const partyDetails = JSON.parse(localStorage.getItem('partyDetails')) || defaults;

    document.getElementById('party-date').textContent = partyDetails.date;
    document.getElementById('party-time').textContent = partyDetails.time;
    document.getElementById('party-venue').textContent = partyDetails.venue;
}

// Edit party detail
function editDetail(type) {
    const elementId = `party-${type}`;
    const currentValue = document.getElementById(elementId).textContent;
    const newValue = prompt(`Enter new ${type}:`, currentValue);

    if (newValue && newValue.trim() !== '') {
        document.getElementById(elementId).textContent = newValue.trim();

        // Save to localStorage
        const partyDetails = JSON.parse(localStorage.getItem('partyDetails')) || {};
        partyDetails[type] = newValue.trim();
        localStorage.setItem('partyDetails', JSON.stringify(partyDetails));

        addActivity(`Updated party ${type}`);
    }
}

// Update guest count
function updateGuestCount() {
    const guests = JSON.parse(localStorage.getItem('guests')) || [];
    const confirmed = guests.filter(g => g.rsvp === 'confirmed').length;
    const total = guests.length;

    document.getElementById('guest-count').textContent =
        `${confirmed} confirmed / ${total} invited`;
}

// Update task statistics
function updateTaskStats() {
    let totalTasks = 0;
    let completedTasks = 0;

    // Count all checkboxes on checklist page (stored in localStorage)
    const taskStates = JSON.parse(localStorage.getItem('taskStates')) || {};
    totalTasks = Object.keys(taskStates).length;
    completedTasks = Object.values(taskStates).filter(state => state === true).length;

    // If no tasks in localStorage, count default tasks
    if (totalTasks === 0) {
        totalTasks = 18; // Default number of tasks in checklist
        completedTasks = 0;
    }

    document.getElementById('tasks-completed').textContent =
        `${completedTasks}/${totalTasks}`;
}

// Update budget statistics
function updateBudgetStats() {
    const budget = JSON.parse(localStorage.getItem('budget')) || { total: 0, spent: 0 };
    const expenses = JSON.parse(localStorage.getItem('expenses')) || [];

    const totalSpent = expenses.reduce((sum, exp) => sum + parseFloat(exp.amount || 0), 0);
    const totalBudget = parseFloat(budget.total) || 0;
    const remaining = totalBudget - totalSpent;

    document.getElementById('budget-status').textContent =
        `$${totalSpent.toFixed(2)} / $${totalBudget.toFixed(2)}`;
}

// Calculate days until party
function updateDaysUntil() {
    const partyDetails = JSON.parse(localStorage.getItem('partyDetails')) || {};
    const partyDateStr = partyDetails.date || 'December 20, 2025';

    const partyDate = new Date(partyDateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    partyDate.setHours(0, 0, 0, 0);

    const diffTime = partyDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    const daysElement = document.getElementById('days-until');
    if (diffDays > 0) {
        daysElement.textContent = diffDays;
    } else if (diffDays === 0) {
        daysElement.textContent = 'TODAY! 🎉';
    } else {
        daysElement.textContent = 'Past';
    }
}

// Add activity to recent updates
function addActivity(message) {
    const activities = JSON.parse(localStorage.getItem('activities')) || [];
    const timestamp = new Date().toLocaleString();
    activities.unshift(`${message} - ${timestamp}`);

    // Keep only last 10 activities
    if (activities.length > 10) {
        activities.length = 10;
    }

    localStorage.setItem('activities', JSON.stringify(activities));
    displayActivities();
}

// Display recent activities
function displayActivities() {
    const activities = JSON.parse(localStorage.getItem('activities')) ||
        ['Party planning website created!'];

    const activityList = document.getElementById('activity-list');
    activityList.innerHTML = activities.map(activity =>
        `<li>${activity}</li>`
    ).join('');
}

// Initialize everything on page load
document.addEventListener('DOMContentLoaded', function() {
    initializePartyDetails();
    updateGuestCount();
    updateTaskStats();
    updateBudgetStats();
    updateDaysUntil();
    displayActivities();
});
