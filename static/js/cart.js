
document.addEventListener('DOMContentLoaded', function() {
    // Add to cart functionality for product listings
    const addToCartButtons = document.querySelectorAll('.add-to-cart');
    if (addToCartButtons.length > 0) {
        addToCartButtons.forEach(button => {
            button.addEventListener('click', function(e) {
                e.preventDefault();
                const form = this.closest('form');
                const formData = new FormData(form);
                
                fetch('/add_to_cart', {
                    method: 'POST',
                    body: formData
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        alert(data.message);
                        updateCartCount(data.cart_count);
                    } else {
                        alert('Error: ' + data.message);
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                    alert('An error occurred while adding to cart');
                });
            });
        });
    }
    
    // Cart page functionality
    if (window.location.pathname.includes('/cart')) {
        setupQuantityButtons();
        setupRemoveButtons();
    }
});

function setupQuantityButtons() {
    const increaseButtons = document.querySelectorAll('.increase-qty');
    const decreaseButtons = document.querySelectorAll('.decrease-qty');
    const quantityInputs = document.querySelectorAll('.item-qty');
    
    increaseButtons.forEach(button => {
        button.addEventListener('click', function() {
            const input = this.closest('.input-group').querySelector('input');
            const currentValue = parseInt(input.value);
            input.value = currentValue + 1;
            updateCartItem(input.dataset.id, input.value);
        });
    });
    
    decreaseButtons.forEach(button => {
        button.addEventListener('click', function() {
            const input = this.closest('.input-group').querySelector('input');
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

function setupRemoveButtons() {
    const removeButtons = document.querySelectorAll('.remove-item');
    
    removeButtons.forEach(button => {
        button.addEventListener('click', function() {
            if (confirm('Are you sure you want to remove this item from your cart?')) {
                const productId = this.dataset.id;
                const formData = new FormData();
                formData.append('product_id', productId);
                
                fetch('/remove_from_cart', {
                    method: 'POST',
                    body: formData
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        // Remove the item's row from the table
                        this.closest('tr').remove();
                        updateCartCount(data.cart_count);
                        
                        // If cart is empty, reload to show empty cart message
                        if (data.cart_count === 0) {
                            window.location.reload();
                        } else {
                            // Update cart totals
                            window.location.reload(); // For now, reload to recalculate totals
                        }
                    } else {
                        alert('Error: ' + data.message);
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                    alert('An error occurred while removing the item');
                });
            }
        });
    });
}

function updateCartCount(count) {
    const cartCountElement = document.querySelector('.cart-count');
    if (cartCountElement) {
        cartCountElement.textContent = count;
    }
}

function updateCartItem(productId, quantity) {
    const formData = new FormData();
    formData.append('product_id', productId);
    formData.append('quantity', quantity);
    
    fetch('/update_cart', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            window.location.reload(); // For now, reload to update totals
        } else {
            alert('Error: ' + data.message);
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('An error occurred while updating the cart');
    });
}
