// Form Switching
function showLogin() {
    hideAllForms();
    document.getElementById('login-form-container').classList.add('active');
}

function showRegister() {
    hideAllForms();
    document.getElementById('register-form-container').classList.add('active');
}

function showAdminLogin() {
    hideAllForms();
    document.getElementById('admin-login-container').classList.add('active');
}

function hideAllForms() {
    document.querySelectorAll('.form-container').forEach(form => {
        form.classList.remove('active');
    });
}

// Toggle Password Visibility
function togglePassword(inputId) {
    const input = document.getElementById(inputId);
    const icon = input.parentElement.querySelector('.toggle-password');
    
    if (input.type === 'password') {
        input.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
    } else {
        input.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    }
}

// Login Form Handler
document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    
    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            // Store session
            localStorage.setItem('userSession', JSON.stringify(data.user));
            localStorage.setItem('userRole', 'member');
            
            // Redirect to main app
            window.location.href = '/index.html';
        } else {
            alert(data.error || 'Login failed. Please check your credentials.');
        }
    } catch (error) {
        alert('Error logging in. Please try again.');
    }
});

// Registration Form Handler
document.getElementById('register-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const name = document.getElementById('register-name').value;
    const email = document.getElementById('register-email').value;
    const phone = document.getElementById('register-phone').value;
    const password = document.getElementById('register-password').value;
    const confirmPassword = document.getElementById('register-confirm').value;
    const termsAccepted = document.getElementById('terms-accept').checked;
    
    // Validation
    if (!email.toLowerCase().endsWith('@gmail.com')) {
        alert('Please use a Gmail address for registration.');
        return;
    }
    
    if (password.length < 6) {
        alert('Password must be at least 6 characters long.');
        return;
    }
    
    if (password !== confirmPassword) {
        alert('Passwords do not match.');
        return;
    }
    
    if (!termsAccepted) {
        alert('Please accept the Terms & Conditions.');
        return;
    }
    
    try {
        console.log('Sending registration request to:', window.location.origin + '/api/auth/register');
        
        const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, phone, password })
        });
        
        console.log('Response status:', response.status);
        
        const data = await response.json();
        console.log('Response data:', data);
        
        if (response.ok) {
            // Show success modal
            showSuccessModal(
                'Registration Successful!',
                'Your account request has been submitted. An admin will review and approve it shortly. You will receive an email once approved.'
            );
            
            // Reset form
            document.getElementById('register-form').reset();
            
            // Switch to login after modal close
            setTimeout(() => {
                showLogin();
            }, 3000);
        } else {
            alert(data.error || 'Registration failed. Please try again.');
        }
    } catch (error) {
        console.error('Registration error:', error);
        alert('Error during registration. Is the server running? Check console for details.');
    }
});

// Admin Login Handler
document.getElementById('admin-login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const username = document.getElementById('admin-username').value;
    const password = document.getElementById('admin-password').value;
    
    try {
        const response = await fetch('/api/auth/admin-login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            // Store admin session
            localStorage.setItem('userSession', JSON.stringify(data.admin));
            localStorage.setItem('userRole', 'admin');
            
            // Redirect to main app
            window.location.href = '/index.html';
        } else {
            alert(data.error || 'Admin login failed. Please check your credentials.');
        }
    } catch (error) {
        alert('Error during admin login. Please try again.');
    }
});

// Success Modal Functions
function showSuccessModal(title, message) {
    const modal = document.getElementById('success-modal');
    document.getElementById('modal-title').textContent = title;
    document.getElementById('modal-message').textContent = message;
    modal.classList.add('show');
}

function closeSuccessModal() {
    const modal = document.getElementById('success-modal');
    modal.classList.remove('show');
}

// Check if already logged in
window.addEventListener('DOMContentLoaded', () => {
    const userSession = localStorage.getItem('userSession');
    if (userSession) {
        // Already logged in, redirect to main app
        window.location.href = '/index.html';
    }
});
