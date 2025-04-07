// DOM Elements
const themeSwitch = document.getElementById('theme-switch');
const userProfile = document.getElementById('user-profile');
const dropdownMenu = document.getElementById('dropdown-menu');
const overlay = document.getElementById('overlay');
const addTaskBtn = document.getElementById('add-task-btn');
const taskModal = document.getElementById('task-modal');
const closeModal = document.getElementById('close-modal');
const cancelTask = document.getElementById('cancel-task');
const taskForm = document.getElementById('task-form');
const tasksContainer = document.getElementById('tasks-container');
const filterBtns = document.querySelectorAll('.filter-btn');
const loginPromptModal = document.getElementById('login-prompt-modal');
const closeLoginPrompt = document.getElementById('close-login-prompt');
const logoutBtn = document.getElementById('logout-btn');

// User state
let currentUser = null;
let tasks = [];
let currentFilter = 'all';

// Initialize the app
function initApp() {
    loadTheme();
    checkAuth();
    setupEventListeners();
    loadTasks();
}

// Load saved theme
function loadTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
        themeSwitch.checked = true;
    }
}

// Check if user is authenticated
function checkAuth() {
    const userData = localStorage.getItem('currentUser');
    if (userData) {
        currentUser = JSON.parse(userData);
        updateUIForLoggedInUser();
    } else {
        updateUIForGuestUser();
    }
}

// Update UI for logged in user
function updateUIForLoggedInUser() {
    const usernameElements = document.querySelectorAll('#username, #welcome-name, #profile-username, #about-username, #contact-username');
    const userAvatarElements = document.querySelectorAll('#user-avatar, #profile-user-avatar, #about-user-avatar, #contact-user-avatar');
    
    usernameElements.forEach(el => {
        if (el) el.textContent = currentUser.name;
    });
    
    userAvatarElements.forEach(el => {
        if (el) el.src = currentUser.avatar || 'img/avatar-placeholder.jpg';
    });
}

// Update UI for guest user
function updateUIForGuestUser() {
    const usernameElements = document.querySelectorAll('#username, #welcome-name, #profile-username, #about-username, #contact-username');
    const userAvatarElements = document.querySelectorAll('#user-avatar, #profile-user-avatar, #about-user-avatar, #contact-user-avatar');
    
    usernameElements.forEach(el => {
        if (el) el.textContent = 'Guest';
    });
    
    userAvatarElements.forEach(el => {
        if (el) el.src = 'img/avatar-placeholder.jpg';
    });
}

// Setup event listeners
function setupEventListeners() {
    // Theme toggle
    themeSwitch.addEventListener('change', toggleTheme);
    
    // User dropdown
    userProfile.addEventListener('click', toggleDropdown);
    
    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (!userProfile.contains(e.target) && !dropdownMenu.contains(e.target)) {
            dropdownMenu.classList.remove('active');
        }
    });
    
    // Task modal
    if (addTaskBtn) {
        addTaskBtn.addEventListener('click', () => {
            if (currentUser) {
                openTaskModal();
            } else {
                showLoginPrompt();
            }
        });
    }
    
    if (closeModal) closeModal.addEventListener('click', closeTaskModal);
    if (cancelTask) cancelTask.addEventListener('click', closeTaskModal);
    if (overlay) overlay.addEventListener('click', closeAllModals);
    
    // Task form submission
    if (taskForm) {
        taskForm.addEventListener('submit', handleTaskSubmit);
    }
    
    // Task filters
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = btn.dataset.filter;
            renderTasks();
        });
    });
    
    // Login prompt
    if (closeLoginPrompt) {
        closeLoginPrompt.addEventListener('click', closeLoginPromptModal);
    }
    
    // Logout
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
}

// Toggle theme
function toggleTheme() {
    if (themeSwitch.checked) {
        document.body.classList.add('dark-mode');
        localStorage.setItem('theme', 'dark');
    } else {
        document.body.classList.remove('dark-mode');
        localStorage.setItem('theme', 'light');
    }
}

// Toggle user dropdown
function toggleDropdown() {
    dropdownMenu.classList.toggle('active');
}

// Open task modal
function openTaskModal() {
    taskModal.classList.add('active');
    overlay.classList.add('active');
    document.getElementById('task-title').focus();
    document.getElementById('modal-title').textContent = 'Add New Task';
    taskForm.reset();
    taskForm.dataset.mode = 'add';
    taskForm.dataset.taskId = '';
}

// Close task modal
function closeTaskModal() {
    taskModal.classList.remove('active');
    overlay.classList.remove('active');
}

// Close all modals
function closeAllModals() {
    closeTaskModal();
    closeLoginPromptModal();
}

// Show login prompt
function showLoginPrompt() {
    loginPromptModal.classList.add('active');
    overlay.classList.add('active');
}

// Close login prompt
function closeLoginPromptModal() {
    loginPromptModal.classList.remove('active');
    overlay.classList.remove('active');
}

// Handle task form submission
function handleTaskSubmit(e) {
    e.preventDefault();
    
    const taskTitle = document.getElementById('task-title').value;
    const taskDescription = document.getElementById('task-description').value;
    const dueDate = document.getElementById('due-date').value;
    const priority = document.getElementById('priority').value;
    
    if (taskForm.dataset.mode === 'add') {
        const newTask = {
            id: Date.now().toString(),
            title: taskTitle,
            description: taskDescription,
            dueDate: dueDate,
            priority: priority,
            completed: false,
            createdAt: new Date().toISOString(),
            userId: currentUser.id
        };
        
        tasks.push(newTask);
    } else if (taskForm.dataset.mode === 'edit') {
        const taskId = taskForm.dataset.taskId;
        const taskIndex = tasks.findIndex(task => task.id === taskId);
        
        if (taskIndex !== -1) {
            tasks[taskIndex] = {
                ...tasks[taskIndex],
                title: taskTitle,
                description: taskDescription,
                dueDate: dueDate,
                priority: priority
            };
        }
    }
    
    saveTasks();
    renderTasks();
    closeTaskModal();
}

// Load tasks from local storage
function loadTasks() {
    const savedTasks = localStorage.getItem('tasks');
    if (savedTasks) {
        tasks = JSON.parse(savedTasks);
    }
    renderTasks();
}

// Save tasks to local storage
function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Render tasks based on current filter
function renderTasks() {
    if (!tasksContainer) return;
    
    let filteredTasks = [];
    
    if (currentUser) {
        filteredTasks = tasks.filter(task => task.userId === currentUser.id);
        
        if (currentFilter === 'completed') {
            filteredTasks = filteredTasks.filter(task => task.completed);
        } else if (currentFilter === 'pending') {
            filteredTasks = filteredTasks.filter(task => !task.completed);
        }
    }
    
    // Update pending tasks count
    const pendingTasksCount = currentUser ? 
        tasks.filter(task => task.userId === currentUser.id && !task.completed).length : 0;
    
    const pendingTasksElement = document.getElementById('pending-tasks');
    if (pendingTasksElement) {
        pendingTasksElement.textContent = pendingTasksCount;
    }
    
    if (filteredTasks.length === 0) {
        tasksContainer.innerHTML = `
            <div class="empty-state">
                <img src="img/empty-tasks.svg" alt="No tasks">
                <h3>No tasks found</h3>
                <p>${currentUser ? 'Add a new task to get started' : 'Login to manage your tasks'}</p>
            </div>
        `;
        return;
    }
    
    tasksContainer.innerHTML = '';
    
    filteredTasks.forEach(task => {
        const taskCard = document.createElement('div');
        taskCard.className = 'task-card';
        taskCard.innerHTML = `
            <div class="task-header">
                <h3 class="task-title">${task.title}</h3>
                <span class="task-priority priority-${task.priority}">${task.priority}</span>
            </div>
            <p class="task-description">${task.description || 'No description'}</p>
            <div class="task-meta">
                <div class="task-due-date">
                    <i class="fas fa-calendar-alt"></i>
                    <span>${task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date'}</span>
                </div>
                <div class="task-created">
                    <i class="fas fa-clock"></i>
                    <span>${new Date(task.createdAt).toLocaleDateString()}</span>
                </div>
            </div>
            <div class="task-actions">
                <div class="task-complete">
                    <input type="checkbox" id="task-${task.id}" ${task.completed ? 'checked' : ''}>
                    <label for="task-${task.id}">${task.completed ? 'Completed' : 'Mark as complete'}</label>
                </div>
                <div class="task-menu">
                    <button class="task-menu-btn">
                        <i class="fas fa-ellipsis-v"></i>
                    </button>
                    <div class="task-menu-dropdown">
                        <ul>
                            <li><a href="#" class="edit-task" data-id="${task.id}"><i class="fas fa-edit"></i> Edit</a></li>
                            <li><a href="#" class="delete-task delete" data-id="${task.id}"><i class="fas fa-trash-alt"></i> Delete</a></li>
                        </ul>
                    </div>
                </div>
            </div>
        `;
        
        tasksContainer.appendChild(taskCard);
        
        // Task checkbox event
        const checkbox = taskCard.querySelector(`#task-${task.id}`);
        checkbox.addEventListener('change', () => {
            toggleTaskComplete(task.id);
        });
        
        // Task menu toggle
        const menuBtn = taskCard.querySelector('.task-menu-btn');
        const menuDropdown = taskCard.querySelector('.task-menu-dropdown');
        
        menuBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            menuDropdown.classList.toggle('active');
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', () => {
            menuDropdown.classList.remove('active');
        });
        
        // Edit task
        const editBtn = taskCard.querySelector('.edit-task');
        editBtn.addEventListener('click', (e) => {
            e.preventDefault();
            editTask(task.id);
        });
        
        // Delete task
        const deleteBtn = taskCard.querySelector('.delete-task');
        deleteBtn.addEventListener('click', (e) => {
            e.preventDefault();
            deleteTask(task.id);
        });
    });
}

// Toggle task complete status
function toggleTaskComplete(taskId) {
    const taskIndex = tasks.findIndex(task => task.id === taskId);
    if (taskIndex !== -1) {
        tasks[taskIndex].completed = !tasks[taskIndex].completed;
        saveTasks();
        renderTasks();
    }
}

// Edit task
function editTask(taskId) {
    const task = tasks.find(task => task.id === taskId);
    if (task) {
        document.getElementById('task-title').value = task.title;
        document.getElementById('task-description').value = task.description || '';
        document.getElementById('due-date').value = task.dueDate || '';
        document.getElementById('priority').value = task.priority;
        
        taskForm.dataset.mode = 'edit';
        taskForm.dataset.taskId = taskId;
        document.getElementById('modal-title').textContent = 'Edit Task';
        
        openTaskModal();
    }
}

// Delete task
function deleteTask(taskId) {
    if (confirm('Are you sure you want to delete this task?')) {
        tasks = tasks.filter(task => task.id !== taskId);
        saveTasks();
        renderTasks();
    }
}

// Handle logout
function handleLogout(e) {
    e.preventDefault();
    localStorage.removeItem('currentUser');
    currentUser = null;
    updateUIForGuestUser();
    renderTasks();
    
    // Redirect to home if on profile page
    if (window.location.pathname.includes('profile.html')) {
        window.location.href = 'index.html';
    }
}

// Check if we're on a protected page
function checkProtectedPage() {
    const isProfilePage = window.location.pathname.includes('profile.html');
    if (isProfilePage && !currentUser) {
        showLoginPrompt();
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    initApp();
    checkProtectedPage();
});