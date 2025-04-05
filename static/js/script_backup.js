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
    const menuItems = document.getElementById("menu-items");
    if (menuItems) {
        if (menuItems.style.maxHeight) {
            menuItems.style.maxHeight = null;
        } else {
            menuItems.style.maxHeight = "200px";
        }
    }
}

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
    // Make sure DOM is ready
    if (!document.body) {
        // If DOM is not ready, wait for it
        document.addEventListener('DOMContentLoaded', function() {
            showFlashMessage(message, type);
        });
        return;
    }
    
    // Create the message element
    const flashMessage = document.createElement('div');
    flashMessage.className = `alert alert-${type} alert-dismissible fade show`;
    flashMessage.setAttribute('role', 'alert');
    
    // Add the message content
    flashMessage.innerHTML = `
        ${message}
        <button type="button" class="close" data-dismiss="alert" aria-label="Close">
            <span aria-hidden="true">&times;</span>
        </button>
    `;
    
    // Add to the document
    document.body.insertBefore(flashMessage, document.body.firstChild);
    
    // Remove after 5 seconds
    setTimeout(() => {
        flashMessage.classList.remove('show');
        setTimeout(() => {
            flashMessage.remove();
        }, 150);
    }, 5000);
}
