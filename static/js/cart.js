/**
 * Cart.js - Handles shopping cart functionality
 */

document.addEventListener('DOMContentLoaded', function() {
    // Add to cart functionality for product listings
    const addToCartButtons = document.querySelectorAll('.add-to-cart');
    if (addToCartButtons.length > 0) {
        addToCartButtons.forEach(button => {
            button.addEventListener('click', function(e) {
                // This is handled via AJAX in the template
                
                // Fallback if AJAX fails
                if (!window.fetch) {
                    // Submit the form normally
                    return true;
                }
            });
        });
    }
    
    // Cart page functionality
    if (window.location.pathname.includes('/cart')) {
        // Quantity buttons
        setupQuantityButtons();
        
        // Remove buttons
        setupRemoveButtons();
    }
});

/**
 * Setup the quantity adjustment buttons in the cart
 */
function setupQuantityButtons() {
    const increaseButtons = document.querySelectorAll('.increase-qty');
    const decreaseButtons = document.querySelectorAll('.decrease-qty');
    const quantityInputs = document.querySelectorAll('.item-qty');
    
    increaseButtons.forEach(button => {
        button.addEventListener('click', function() {
            const input = this.parentNode.parentNode.querySelector('input');
            const currentValue = parseInt(input.value);
            input.value = currentValue + 1;
            updateCartItem(input.dataset.id, input.value);
        });
    });
    
    decreaseButtons.forEach(button => {
        button.addEventListener('click', function() {
            const input = this.parentNode.parentNode.querySelector('input');
            const currentValue = parseInt(input.value);
            if (currentValue > 1) {
                input.value = currentValue - 1;
                updateCartItem(input.dataset.id, input.value);
            }
        });
    });
    
    quantityInputs.forEach(input => {
        input.addEventListener('change', function() {
            let value = parseInt(this.value);
            if (isNaN(value) || value < 1) {
                value = 1;
                this.value = 1;
            }
            updateCartItem(this.dataset.id, value);
        });
    });
}

/**
 * Setup the remove from cart buttons
 */
function setupRemoveButtons() {
    const removeButtons = document.querySelectorAll('.remove-item');
    
    removeButtons.forEach(button => {
        button.addEventListener('click', function() {
            if (confirm('Are you sure you want to remove this item from your cart?')) {
                const productId = this.dataset.id;
                removeFromCart(productId);
            }
        });
    });
}

/**
 * Update the quantity of an item in the cart
 * @param {string} productId - The ID of the product
 * @param {number} quantity - The new quantity
 */
function updateCartItem(productId, quantity) {
    console.log(`Updating cart item ${productId} to quantity ${quantity}`);
    // In a real implementation, this would make an AJAX call to update the cart
    // For now, we'll just reload the page
    window.location.reload();
}

/**
 * Remove an item from the cart
 * @param {string} productId - The ID of the product to remove
 */
function removeFromCart(productId) {
    console.log(`Removing item ${productId} from cart`);
    // In a real implementation, this would make an AJAX call to remove the item
    // For now, we'll just reload the page
    window.location.reload();
}
