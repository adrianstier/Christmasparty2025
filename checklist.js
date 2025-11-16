// Checklist JavaScript

// Initialize task states from localStorage
function initializeChecklist() {
    const taskStates = JSON.parse(localStorage.getItem('taskStates')) || {};

    // Apply saved states to checkboxes
    document.querySelectorAll('.task-item input[type="checkbox"]').forEach(checkbox => {
        if (taskStates[checkbox.id] === true) {
            checkbox.checked = true;
        }
    });

    updateProgress();
}

// Update progress bar
function updateProgress() {
    const checkboxes = document.querySelectorAll('.task-item input[type="checkbox"]');
    const total = checkboxes.length;
    const completed = Array.from(checkboxes).filter(cb => cb.checked).length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    // Update progress bar
    const progressFill = document.getElementById('progress-fill');
    progressFill.style.width = `${percentage}%`;

    // Update progress text
    document.getElementById('progress-text').textContent =
        `${completed} of ${total} tasks completed (${percentage}%)`;

    // Save states to localStorage
    const taskStates = {};
    checkboxes.forEach(checkbox => {
        taskStates[checkbox.id] = checkbox.checked;
    });
    localStorage.setItem('taskStates', JSON.stringify(taskStates));

    // Add activity if a task was just completed
    updateActivityLog();
}

// Update activity log
function updateActivityLog() {
    const activities = JSON.parse(localStorage.getItem('activities')) || [];
    const checkboxes = document.querySelectorAll('.task-item input[type="checkbox"]');
    const completed = Array.from(checkboxes).filter(cb => cb.checked).length;

    // Check if we should log (only on completion, not on every change)
    const lastLoggedCount = parseInt(localStorage.getItem('lastTaskCount') || '0');

    if (completed > lastLoggedCount) {
        activities.unshift(`Completed a task - ${new Date().toLocaleString()}`);
        if (activities.length > 10) activities.length = 10;
        localStorage.setItem('activities', JSON.stringify(activities));
    }

    localStorage.setItem('lastTaskCount', completed.toString());
}

// Show add task modal
function showAddTaskModal() {
    document.getElementById('add-task-modal').classList.add('active');
    document.getElementById('add-task-form').reset();
}

// Close add task modal
function closeAddTaskModal() {
    document.getElementById('add-task-modal').classList.remove('active');
}

// Add new task
document.getElementById('add-task-form').addEventListener('submit', function(e) {
    e.preventDefault();

    const description = document.getElementById('task-description').value;
    const category = document.getElementById('task-category').value;

    const taskId = `task-${category}-${Date.now()}`;
    const taskList = document.getElementById(`${category}-tasks`);

    if (!taskList) {
        alert('Invalid category selected');
        return;
    }

    // Create new task item
    const li = document.createElement('li');
    li.className = 'task-item';
    li.innerHTML = `
        <input type="checkbox" id="${taskId}" onchange="updateProgress()">
        <label for="${taskId}">${description}</label>
        <button onclick="deleteTask('${taskId}')" class="delete-task">×</button>
    `;

    taskList.appendChild(li);
    updateProgress();
    closeAddTaskModal();

    // Add activity
    const activities = JSON.parse(localStorage.getItem('activities')) || [];
    activities.unshift(`Added new task: ${description} - ${new Date().toLocaleString()}`);
    if (activities.length > 10) activities.length = 10;
    localStorage.setItem('activities', JSON.stringify(activities));
});

// Delete task
function deleteTask(taskId) {
    // If taskId doesn't have 'task-' prefix, add it
    const fullTaskId = taskId.startsWith('task-') ? taskId : `task-${taskId}`;

    const taskItem = document.getElementById(fullTaskId);
    if (taskItem && taskItem.parentElement) {
        const taskLabel = taskItem.nextElementSibling?.textContent || 'this task';

        if (confirm(`Are you sure you want to delete "${taskLabel}"?`)) {
            taskItem.parentElement.remove();

            // Remove from localStorage
            const taskStates = JSON.parse(localStorage.getItem('taskStates')) || {};
            delete taskStates[fullTaskId];
            localStorage.setItem('taskStates', JSON.stringify(taskStates));

            updateProgress();

            // Add activity
            const activities = JSON.parse(localStorage.getItem('activities')) || [];
            activities.unshift(`Deleted task: ${taskLabel} - ${new Date().toLocaleString()}`);
            if (activities.length > 10) activities.length = 10;
            localStorage.setItem('activities', JSON.stringify(activities));
        }
    }
}

// Close modal when clicking outside
window.addEventListener('click', function(e) {
    const modal = document.getElementById('add-task-modal');
    if (e.target === modal) {
        closeAddTaskModal();
    }
});

// Initialize on page load
document.addEventListener('DOMContentLoaded', initializeChecklist);
