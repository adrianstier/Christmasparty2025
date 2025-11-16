// Planning Page JavaScript

let budget = { total: 5000, spent: 0 };
let expenses = [];
let notes = '';

// Initialize planning data
function initializePlanning() {
    loadBudget();
    loadExpenses();
    loadNotes();
    updateBudgetDisplay();
}

// Load budget from localStorage
function loadBudget() {
    const storedBudget = localStorage.getItem('budget');
    if (storedBudget) {
        budget = JSON.parse(storedBudget);
    }
}

// Save budget to localStorage
function saveBudget() {
    localStorage.setItem('budget', JSON.stringify(budget));
}

// Load expenses from localStorage
function loadExpenses() {
    const storedExpenses = localStorage.getItem('expenses');
    if (storedExpenses) {
        expenses = JSON.parse(storedExpenses);
    }
}

// Save expenses to localStorage
function saveExpenses() {
    localStorage.setItem('expenses', JSON.stringify(expenses));
}

// Load notes from localStorage
function loadNotes() {
    notes = localStorage.getItem('planningNotes') || '';
    document.getElementById('planning-notes').value = notes;
}

// Save notes to localStorage
function saveNotes() {
    notes = document.getElementById('planning-notes').value;
    localStorage.setItem('planningNotes', notes);

    // Show confirmation
    alert('Notes saved successfully!');

    // Add activity
    const activities = JSON.parse(localStorage.getItem('activities')) || [];
    activities.unshift(`Updated planning notes - ${new Date().toLocaleString()}`);
    if (activities.length > 10) activities.length = 10;
    localStorage.setItem('activities', JSON.stringify(activities));
}

// Edit budget
function editBudget() {
    const newBudget = prompt('Enter total budget ($):', budget.total);
    if (newBudget !== null && !isNaN(newBudget) && parseFloat(newBudget) >= 0) {
        budget.total = parseFloat(newBudget);
        saveBudget();
        updateBudgetDisplay();

        // Add activity
        const activities = JSON.parse(localStorage.getItem('activities')) || [];
        activities.unshift(`Updated budget to $${budget.total} - ${new Date().toLocaleString()}`);
        if (activities.length > 10) activities.length = 10;
        localStorage.setItem('activities', JSON.stringify(activities));
    }
}

// Update budget display
function updateBudgetDisplay() {
    const totalSpent = expenses.reduce((sum, exp) => sum + parseFloat(exp.amount || 0), 0);
    const remaining = budget.total - totalSpent;
    const percentage = budget.total > 0 ? Math.round((totalSpent / budget.total) * 100) : 0;

    document.getElementById('total-budget').textContent = budget.total.toFixed(2);
    document.getElementById('total-spent').textContent = totalSpent.toFixed(2);
    document.getElementById('remaining-budget').textContent = remaining.toFixed(2);

    // Update progress bar
    const progressFill = document.getElementById('budget-progress-fill');
    progressFill.style.width = `${Math.min(percentage, 100)}%`;

    document.getElementById('budget-progress-text').textContent =
        `${percentage}% of budget used`;

    // Change color if over budget
    if (percentage > 100) {
        progressFill.style.background = 'linear-gradient(90deg, #e74c3c 0%, #c0392b 100%)';
    } else if (percentage > 80) {
        progressFill.style.background = 'linear-gradient(90deg, #f39c12 0%, #e67e22 100%)';
    } else {
        progressFill.style.background = 'linear-gradient(90deg, #d4af37 0%, #f39c12 100%)';
    }

    renderExpenses();
}

// Show add expense modal
function showAddExpenseModal() {
    document.getElementById('add-expense-modal').classList.add('active');
    document.getElementById('add-expense-form').reset();
}

// Close add expense modal
function closeAddExpenseModal() {
    document.getElementById('add-expense-modal').classList.remove('active');
}

// Add expense
document.getElementById('add-expense-form').addEventListener('submit', function(e) {
    e.preventDefault();

    const expense = {
        id: Date.now(),
        category: document.getElementById('expense-category').value,
        description: document.getElementById('expense-description').value,
        amount: parseFloat(document.getElementById('expense-amount').value)
    };

    expenses.push(expense);
    saveExpenses();
    updateBudgetDisplay();
    closeAddExpenseModal();

    // Add activity
    const activities = JSON.parse(localStorage.getItem('activities')) || [];
    activities.unshift(`Added expense: ${expense.description} ($${expense.amount}) - ${new Date().toLocaleString()}`);
    if (activities.length > 10) activities.length = 10;
    localStorage.setItem('activities', JSON.stringify(activities));
});

// Render expenses table
function renderExpenses() {
    const tbody = document.getElementById('expenses-table-body');

    if (expenses.length === 0) {
        tbody.innerHTML = '<tr class="no-data"><td colspan="4">No expenses yet. Add your first expense above!</td></tr>';
        return;
    }

    tbody.innerHTML = expenses.map(exp => `
        <tr>
            <td>${exp.category}</td>
            <td>${exp.description}</td>
            <td>$${exp.amount.toFixed(2)}</td>
            <td>
                <button class="action-btn delete" onclick="deleteExpense(${exp.id})">Delete</button>
            </td>
        </tr>
    `).join('');
}

// Delete expense
function deleteExpense(id) {
    const expense = expenses.find(e => e.id === id);
    if (!expense) return;

    if (confirm(`Are you sure you want to delete "${expense.description}"?`)) {
        expenses = expenses.filter(e => e.id !== id);
        saveExpenses();
        updateBudgetDisplay();

        // Add activity
        const activities = JSON.parse(localStorage.getItem('activities')) || [];
        activities.unshift(`Deleted expense: ${expense.description} - ${new Date().toLocaleString()}`);
        if (activities.length > 10) activities.length = 10;
        localStorage.setItem('activities', JSON.stringify(activities));
    }
}

// Show add milestone modal
function showAddMilestoneModal() {
    document.getElementById('add-milestone-modal').classList.add('active');
    document.getElementById('add-milestone-form').reset();
}

// Close add milestone modal
function closeAddMilestoneModal() {
    document.getElementById('add-milestone-modal').classList.remove('active');
}

// Add milestone
document.getElementById('add-milestone-form').addEventListener('submit', function(e) {
    e.preventDefault();

    const date = document.getElementById('milestone-date').value;
    const title = document.getElementById('milestone-title').value;
    const tasksText = document.getElementById('milestone-tasks').value;
    const tasks = tasksText.split('\n').filter(t => t.trim() !== '');

    const timeline = document.querySelector('.timeline');
    const milestoneItem = document.createElement('div');
    milestoneItem.className = 'timeline-item';
    milestoneItem.innerHTML = `
        <div class="timeline-date">${date}</div>
        <div class="timeline-content">
            <h4>${title}</h4>
            <ul>
                ${tasks.map(task => `<li>${task}</li>`).join('')}
            </ul>
        </div>
    `;

    timeline.appendChild(milestoneItem);
    closeAddMilestoneModal();

    // Add activity
    const activities = JSON.parse(localStorage.getItem('activities')) || [];
    activities.unshift(`Added milestone: ${title} - ${new Date().toLocaleString()}`);
    if (activities.length > 10) activities.length = 10;
    localStorage.setItem('activities', JSON.stringify(activities));
});

// Close modals when clicking outside
window.addEventListener('click', function(e) {
    if (e.target === document.getElementById('add-expense-modal')) {
        closeAddExpenseModal();
    }
    if (e.target === document.getElementById('add-milestone-modal')) {
        closeAddMilestoneModal();
    }
});

// Initialize on page load
document.addEventListener('DOMContentLoaded', initializePlanning);
