/**
 * Script.js - General functionality for the site
 */

// Document ready function
document.addEventListener('DOMContentLoaded', function() {
    // Initialize any components that need it
    initializeComponents();
    
    // Setup event listeners
    setupEventListeners();
});

/**
 * Initialize site components
 */
function initializeComponents() {
    // Initialize tooltips
    if (typeof $.fn.tooltip === 'function') {
        $('[data-toggle="tooltip"]').tooltip();
    }
    
    // Initialize popovers
    if (typeof $.fn.popover === 'function') {
        $('[data-toggle="popover"]').popover();
    }
}

/**
 * Setup event listeners for the site
 */
function setupEventListeners() {
    // Menu toggle for mobile
    const menuIcon = document.querySelector('.menu-icon');
    if (menuIcon) {
        menuIcon.addEventListener('click', menutoggle);
    }
    
    // Add to cart forms
    setupAddToCartForms();
}

/**
 * Toggle the mobile menu
 */
function menutoggle() {
    const menuItems = document.getElementById("MenuItems");
    const menuIcon = document.querySelector('.menu-icon');
    
    if (menuItems) {
        menuItems.classList.toggle('active');
        menuIcon.classList.toggle('active');
        document.body.style.overflow = menuItems.classList.contains('active') ? 'hidden' : '';
        
        // Add smooth sliding animation
        if (menuItems.classList.contains('active')) {
            menuItems.style.transform = 'translateX(0)';
            menuItems.style.opacity = '1';
        } else {
            menuItems.style.transform = 'translateX(-100%)';
            menuItems.style.opacity = '0';
        }
    }
}

// Add touch ripple effect
document.addEventListener('DOMContentLoaded', function() {
    const buttons = document.querySelectorAll('.btn, .mobile-nav-item');
    
    buttons.forEach(button => {
        button.addEventListener('touchstart', createRipple);
    });
    
    function createRipple(event) {
        const button = event.currentTarget;
        const ripple = document.createElement('span');
        const rect = button.getBoundingClientRect();
        
        ripple.className = 'ripple';
        ripple.style.left = `${event.touches[0].clientX - rect.left}px`;
        ripple.style.top = `${event.touches[0].clientY - rect.top}px`;
        
        button.appendChild(ripple);
        
        setTimeout(() => {
            ripple.remove();
        }, 600);
    }
});

// Close menu when clicking outside
document.addEventListener('click', function(event) {
    const menuItems = document.getElementById("MenuItems");
    const menuIcon = document.querySelector('.menu-icon');
    
    if (menuItems && menuItems.classList.contains('active')) {
        if (!menuItems.contains(event.target) && !menuIcon.contains(event.target)) {
            menuItems.classList.remove('active');
            document.body.style.overflow = '';
        }
    }
});

// Add touch support for product cards
document.addEventListener('DOMContentLoaded', function() {
    const productCards = document.querySelectorAll('.product-card');
    
    productCards.forEach(card => {
        card.addEventListener('touchstart', function() {
            this.style.transform = 'scale(0.98)';
        });
        
        card.addEventListener('touchend', function() {
            this.style.transform = 'scale(1)';
        });
    });
});

/**
 * Setup the add to cart forms
 */
function setupAddToCartForms() {
    const addToCartForms = document.querySelectorAll('.add-to-cart-form');
    
    addToCartForms.forEach(form => {
        form.addEventListener('submit', function(e) {
            // This is handled via AJAX in the template
        });
    });
}

/**
 * Format a price with the proper currency symbol
 * @param {number} price - The price to format
 * @param {string} currency - The currency code (default: USD)
 * @returns {string} The formatted price
 */
function formatPrice(price, currency = 'USD') {
    const formatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency
    });
    
    return formatter.format(price);
}

/**
 * Show a flash message to the user
 * @param {string} message - The message to display
 * @param {string} type - The type of message (success, error, info, warning)
 */
function showFlashMessage(message, type = 'info') {
    // The function will only run when the DOM is fully loaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            createFlashMessage(message, type);
        });
    } else {
        createFlashMessage(message, type);
    }
}

/**
 * Helper function to create and insert a flash message
 * @param {string} message - The message to display
 * @param {string} type - The type of message
 */
function createFlashMessage(message, type) {
    try {
        // Create the message element
        const flashMessage = document.createElement('div');
        flashMessage.className = `alert alert-${type} alert-dismissible fade show`;
        flashMessage.setAttribute('role', 'alert');
        
        // Add the message content
        flashMessage.textContent = message;
        
        // Add the close button
        const closeButton = document.createElement('button');
        closeButton.type = 'button';
        closeButton.className = 'close';
        closeButton.setAttribute('data-dismiss', 'alert');
        closeButton.setAttribute('aria-label', 'Close');
        
        const closeIcon = document.createElement('span');
        closeIcon.setAttribute('aria-hidden', 'true');
        closeIcon.innerHTML = '&times;';
        
        closeButton.appendChild(closeIcon);
        flashMessage.appendChild(closeButton);
        
        // Find a container to append to
        const container = document.querySelector('.container') || document.body;
        
        if (container) {
            container.insertBefore(flashMessage, container.firstChild);
            
            // Remove after 5 seconds
            setTimeout(function() {
                flashMessage.classList.remove('show');
                setTimeout(function() {
                    if (flashMessage.parentNode) {
                        flashMessage.parentNode.removeChild(flashMessage);
                    }
                }, 150);
            }, 5000);
        }
    } catch (e) {
        console.error('Error showing flash message:', e);
    }
}
