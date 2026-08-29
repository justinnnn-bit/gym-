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
        // Use Supabase client
        const result = await window.supabaseClient.loginMember(email, password);
        
        if (result.success) {
            // Store session
            localStorage.setItem('userSession', JSON.stringify(result.user));
            localStorage.setItem('userRole', 'member');
            
            // Redirect to main app
            window.location.href = '/index.html';
        } else {
            alert(result.error || 'Login failed. Please check your credentials.');
        }
    } catch (error) {
        console.error('Login error:', error);
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
        // Use Supabase client
        const result = await window.supabaseClient.registerMember(name, email, phone, password);
        
        if (result.success) {
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
            alert(result.error || 'Registration failed. Please try again.');
        }
    } catch (error) {
        console.error('Registration error:', error);
        alert('Error during registration. Please try again.');
    }
});

// Admin Login Handler
document.getElementById('admin-login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const username = document.getElementById('admin-username').value;
    const password = document.getElementById('admin-password').value;
    
    try {
        // Use Supabase client
        const result = await window.supabaseClient.loginAdmin(username, password);
        
        if (result.success) {
            // Store admin session
            localStorage.setItem('userSession', JSON.stringify(result.admin));
            localStorage.setItem('userRole', 'admin');
            
            // Redirect to main app
            window.location.href = '/index.html';
        } else {
            alert(result.error || 'Admin login failed. Please check your credentials.');
        }
    } catch (error) {
        console.error('Admin login error:', error);
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
