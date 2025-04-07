// DOM Elements
const profileForm = document.getElementById('profile-form');
const displayNameInput = document.getElementById('display-name');
const profileEmailInput = document.getElementById('profile-email-input');
const avatarUpload = document.getElementById('avatar-upload');
const avatarPreview = document.getElementById('avatar-preview');
const profileDisplayName = document.getElementById('profile-display-name');
const profileEmail = document.getElementById('profile-email');
const joinedDate = document.getElementById('joined-date');
const totalTasksElement = document.getElementById('total-tasks');
const completedTasksElement = document.getElementById('completed-tasks');
const pendingTasksElement = document.getElementById('profile-pending-tasks');

// Initialize
function initProfile() {
    loadProfileData();
    setupProfileEventListeners();
}

// Load profile data
function loadProfileData() {
    const userData = localStorage.getItem('currentUser');
    if (!userData) {
        // Redirect to login if not logged in
        window.location.href = 'login.html';
        return;
    }
    
    const user = JSON.parse(userData);
    
    // Set form values
    displayNameInput.value = user.name || '';
    profileEmailInput.value = user.email || '';
    
    // Set profile info
    profileDisplayName.textContent = user.name || 'User';
    profileEmail.textContent = user.email || '';
    
    // Set avatar
    if (user.avatar) {
        avatarPreview.src = user.avatar;
    }
    
    // Set joined date
    if (user.createdAt) {
        const date = new Date(user.createdAt);
        joinedDate.textContent = date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
    }
    
    // Load task statistics
    loadTaskStats(user.id);
}

// Load task statistics
function loadTaskStats(userId) {
    const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
    const userTasks = tasks.filter(task => task.userId === userId);
    
    const totalTasks = userTasks.length;
    const completedTasks = userTasks.filter(task => task.completed).length;
    const pendingTasks = totalTasks - completedTasks;
    
    totalTasksElement.textContent = totalTasks;
    completedTasksElement.textContent = completedTasks;
    pendingTasksElement.textContent = pendingTasks;
}

// Setup profile event listeners
function setupProfileEventListeners() {
    // Profile form submission
    if (profileForm) {
        profileForm.addEventListener('submit', updateProfile);
    }
    
    // Avatar upload
    if (avatarUpload) {
        avatarUpload.addEventListener('change', handleAvatarUpload);
    }
}

// Update profile
function updateProfile(e) {
    e.preventDefault();
    
    const userData = localStorage.getItem('currentUser');
    if (!userData) return;
    
    const user = JSON.parse(userData);
    const newName = displayNameInput.value.trim();
    
    if (newName) {
        user.name = newName;
        
        // Update current user
        localStorage.setItem('currentUser', JSON.stringify(user));
        
        // Update in users array
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const userIndex = users.findIndex(u => u.id === user.id);
        
        if (userIndex !== -1) {
            users[userIndex] = user;
            localStorage.setItem('users', JSON.stringify(users));
        }
        
        // Update UI
        profileDisplayName.textContent = user.name;
        
        alert('Profile updated successfully!');
    }
}

// Handle avatar upload
function handleAvatarUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(event) {
        const imgData = event.target.result;
        
        // Update avatar preview
        avatarPreview.src = imgData;
        
        // Update user data
        const userData = localStorage.getItem('currentUser');
        if (!userData) return;
        
        const user = JSON.parse(userData);
        user.avatar = imgData;
        
        // Update current user
        localStorage.setItem('currentUser', JSON.stringify(user));
        
        // Update in users array
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const userIndex = users.findIndex(u => u.id === user.id);
        
        if (userIndex !== -1) {
            users[userIndex] = user;
            localStorage.setItem('users', JSON.stringify(users));
        }
    };
    
    reader.readAsDataURL(file);
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initProfile);