// DOM Elements
const loginForm = document.getElementById('login-form');
const signupForm = document.getElementById('signup-form');
const emailInput = document.getElementById('email');
const signupEmailInput = document.getElementById('signup-email');
const fullnameInput = document.getElementById('fullname');
const otpInput = document.getElementById('otp');
const signupOtpInput = document.getElementById('signup-otp');
const otpSection = document.getElementById('otp-section');
const signupOtpSection = document.getElementById('signup-otp-section');
const loginBtn = document.getElementById('login-btn');
const signupBtn = document.getElementById('signup-btn');
const verifyOtpBtn = document.getElementById('verify-otp-btn');
const signupVerifyOtpBtn = document.getElementById('signup-verify-otp-btn');
const resendOtpBtn = document.getElementById('resend-otp');
const signupResendOtpBtn = document.getElementById('signup-resend-otp');
const timerElement = document.getElementById('timer');
const signupTimerElement = document.getElementById('signup-timer');

// Variables
let timerInterval;
let signupTimerInterval;
let currentEmail = '';
let currentOtp = '';

// Initialize
function init() {
    setupEventListeners();
}

// Setup event listeners
function setupEventListeners() {
    if (loginForm) {
        loginForm.addEventListener('submit', handleLoginSubmit);
    }
    
    if (signupForm) {
        signupForm.addEventListener('submit', handleSignupSubmit);
    }
    
    if (verifyOtpBtn) {
        verifyOtpBtn.addEventListener('click', verifyLoginOtp);
    }
    
    if (signupVerifyOtpBtn) {
        signupVerifyOtpBtn.addEventListener('click', verifySignupOtp);
    }
    
    if (resendOtpBtn) {
        resendOtpBtn.addEventListener('click', () => {
            sendOtp(currentEmail, 'login');
        });
    }
    
    if (signupResendOtpBtn) {
        sign  () => {
            sendOtp(currentEmail, 'login');
        });
    }
    
    if (signupResendOtpBtn) {
        signupResendOtpBtn.addEventListener('click', () => {
            sendOtp(currentEmail, 'signup');
        });
    }
}

// Handle login form submission
function handleLoginSubmit(e) {
    e.preventDefault();
    
    if (otpSection.classList.contains('hidden')) {
        // First step: Send OTP
        const email = emailInput.value.trim();
        if (email) {
            currentEmail = email;
            sendOtp(email, 'login');
        }
    }
}

// Handle signup form submission
function handleSignupSubmit(e) {
    e.preventDefault();
    
    if (signupOtpSection.classList.contains('hidden')) {
        // First step: Send OTP
        const email = signupEmailInput.value.trim();
        const fullname = document.getElementById('fullname').value.trim();
        
        if (email && fullname) {
            currentEmail = email;
            sendOtp(email, 'signup');
        }
    }
}

// Send OTP
function sendOtp(email, type) {
    // Show loading state
    const button = type === 'login' ? loginBtn : signupBtn;
    const originalText = button.textContent;
    button.disabled = true;
    button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending OTP...';
    
    // Make API call to backend
    fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
    })
    .then(response => response.json())
    .then(data => {
        // Reset button state
        button.disabled = false;
        button.textContent = originalText;
        
        if (data.error) {
            alert(data.error);
            return;
        }
        
        // For demo purposes, we'll use a fixed OTP
        // In a real app, the OTP would be sent to the user's email
        currentOtp = '123456';
        
        // Show OTP section
        if (type === 'login') {
            otpSection.classList.remove('hidden');
            loginBtn.classList.add('hidden');
            verifyOtpBtn.classList.remove('hidden');
            startTimer(timerElement, resendOtpBtn);
        } else {
            signupOtpSection.classList.remove('hidden');
            signupBtn.classList.add('hidden');
            signupVerifyOtpBtn.classList.remove('hidden');
            startTimer(signupTimerElement, signupResendOtpBtn);
        }
        
        // Show success message
        alert(`OTP sent successfully to ${email}. For demo purposes, use: 123456`);
    })
    .catch(error => {
        // Reset button state
        button.disabled = false;
        button.textContent = originalText;
        
        console.error('Error:', error);
        alert('Failed to send OTP. Please try again.');
    });
}

// Verify login OTP
function verifyLoginOtp() {
    const enteredOtp = otpInput.value.trim();
    
    if (!enteredOtp) {
        alert('Please enter the OTP');
        return;
    }
    
    // Show loading state
    verifyOtpBtn.disabled = true;
    verifyOtpBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Verifying...';
    
    // For demo purposes, we'll verify against the fixed OTP
    // In a real app, this would be verified against the backend
    if (enteredOtp === currentOtp) {
        // Make API call to verify OTP
        fetch('/api/auth/verify-otp', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                email: currentEmail,
                otp: enteredOtp
            }),
        })
        .then(response => response.json())
        .then(data => {
            verifyOtpBtn.disabled = false;
            verifyOtpBtn.textContent = 'Verify OTP';
            
            if (data.error) {
                alert(data.error);
                return;
            }
            
            // Check if user exists
            const users = JSON.parse(localStorage.getItem('users') || '[]');
            let user = users.find(u => u.email === currentEmail);
            
            if (!user) {
                // Create a new user if not found
                user = {
                    id: Date.now().toString(),
                    name: 'User',
                    email: currentEmail,
                    avatar: null,
                    createdAt: new Date().toISOString()
                };
                users.push(user);
                localStorage.setItem('users', JSON.stringify(users));
            }
            
            // Login successful
            localStorage.setItem('currentUser', JSON.stringify(user));
            
            // Show success message and redirect
            alert('Login successful!');
            window.location.href = 'index.html';
        })
        .catch(error => {
            verifyOtpBtn.disabled = false;
            verifyOtpBtn.textContent = 'Verify OTP';
            
            console.error('Error:', error);
            alert('Failed to verify OTP. Please try again.');
        });
    } else {
        verifyOtpBtn.disabled = false;
        verifyOtpBtn.textContent = 'Verify OTP';
        alert('Invalid OTP. Please try again.');
    }
}

// Verify signup OTP
function verifySignupOtp() {
    const enteredOtp = signupOtpInput.value.trim();
    const fullname = document.getElementById('fullname').value.trim();
    
    if (!enteredOtp) {
        alert('Please enter the OTP');
        return;
    }
    
    // Show loading state
    signupVerifyOtpBtn.disabled = true;
    signupVerifyOtpBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Verifying...';
    
    // For demo purposes, we'll verify against the fixed OTP
    if (enteredOtp === currentOtp) {
        // Make API call to verify OTP
        fetch('/api/auth/verify-otp', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                email: currentEmail,
                otp: enteredOtp
            }),
        })
        .then(response => response.json())
        .then(data => {
            signupVerifyOtpBtn.disabled = false;
            signupVerifyOtpBtn.textContent = 'Verify OTP';
            
            if (data.error) {
                alert(data.error);
                return;
            }
            
            // Create new user
            const users = JSON.parse(localStorage.getItem('users') || '[]');
            
            // Check if user already exists
            if (users.some(u => u.email === currentEmail)) {
                alert('User already exists. Please login instead.');
                window.location.href = 'login.html';
                return;
            }
            
            const newUser = {
                id: Date.now().toString(),
                name: fullname,
                email: currentEmail,
                avatar: null,
                createdAt: new Date().toISOString()
            };
            
            users.push(newUser);
            localStorage.setItem('users', JSON.stringify(users));
            
            // Auto login
            localStorage.setItem('currentUser', JSON.stringify(newUser));
            
            // Show success message and redirect
            alert('Account created successfully!');
            window.location.href = 'index.html';
        })
        .catch(error => {
            signupVerifyOtpBtn.disabled = false;
            signupVerifyOtpBtn.textContent = 'Verify OTP';
            
            console.error('Error:', error);
            alert('Failed to verify OTP. Please try again.');
        });
    } else {
        signupVerifyOtpBtn.disabled = false;
        signupVerifyOtpBtn.textContent = 'Verify OTP';
        alert('Invalid OTP. Please try again.');
    }
}

// Start timer for OTP resend
function startTimer(timerElement, resendButton) {
    let timeLeft = 60;
    
    if (timerElement === timerElement && timerInterval) {
        clearInterval(timerInterval);
    } else if (signupTimerInterval) {
        clearInterval(signupTimerInterval);
    }
    
    resendButton.disabled = true;
    
    const interval = setInterval(() => {
        timeLeft--;
        timerElement.textContent = timeLeft;
        
        if (timeLeft <= 0) {
            clearInterval(interval);
            resendButton.disabled = false;
        }
    }, 1000);
    
    if (timerElement === document.getElementById('timer')) {
        timerInterval = interval;
    } else {
        signupTimerInterval = interval;
    }
}

// Generate a random 6-digit OTP
function generateOtp() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', init);