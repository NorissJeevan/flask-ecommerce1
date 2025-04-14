/**
 * Auth.js - Handles authentication functionality
 */

// Form validation functions
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email.toLowerCase());
}

function validatePassword(password) {
    return password.length >= 8;
}

// Check if user is logged in and handle form validation
document.addEventListener('DOMContentLoaded', function() {
    // Handle login form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            const email = document.getElementById('emailAddress');
            const password = document.getElementById('loginPassword');
            
            if (!validateEmail(email.value)) {
                e.preventDefault();
                alert('Please enter a valid email address');
                email.focus();
                return false;
            }
            
            if (!validatePassword(password.value)) {
                e.preventDefault();
                alert('Password must be at least 8 characters long');
                password.focus();
                return false;
            }
        });
    }
    
    // Handle register form
    const registerForm = document.getElementById('registerForm');
    
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            // This form is handled by Flask through normal form submission
            // This is just for additional client-side validation if needed
            
            const email = document.getElementById('emailAddress');
            const password = document.getElementById('loginPassword');
            
            if (email && password) {
                // Basic validation
                if (!email.value || !password.value) {
                    e.preventDefault();
                    alert('Please fill in all required fields');
                    return false;
                }
                
                // Email format validation
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(email.value)) {
                    e.preventDefault();
                    alert('Please enter a valid email address');
                    return false;
                }
                
                // Password length validation
                if (password.value.length < 6) {
                    e.preventDefault();
                    alert('Password must be at least 6 characters long');
                    return false;
                }
            }
        });
    }
    
    // Logout functionality
    const logoutLink = document.getElementById('logoutLink');
    if (logoutLink) {
        logoutLink.addEventListener('click', function(e) {
            e.preventDefault();
            window.location.href = "/logout";
        });
    }
});

// Switch between login and register forms
function toggleAuthForms() {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    
    if (loginForm && registerForm) {
        if (loginForm.style.display === 'none') {
            loginForm.style.display = 'block';
            registerForm.style.display = 'none';
            document.querySelector('.auth-switch-text').textContent = 'Don\'t have an account? Register';
        } else {
            loginForm.style.display = 'none';
            registerForm.style.display = 'block';
            document.querySelector('.auth-switch-text').textContent = 'Already have an account? Login';
        }
    }
}
