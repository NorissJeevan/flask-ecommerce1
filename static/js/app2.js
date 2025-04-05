/**
 * App2.js - Handles product page functionality
 */

// Document ready function
$(document).ready(function() {
    // Handle sign up button click
    $(".signUpButton").click(function() {
        console.log('Sign up button clicked');
        $("#signUpModal").modal('show');
    });

    // Handle quantity form submission
    $('#quantityOfUnicornsForm').submit(function(e) {
        e.preventDefault();
        var numberOfUnicorns = $("#quantityOfUnicorns option:selected").text();
        console.log("Selected quantity: " + numberOfUnicorns);
        
        // Update cart items count
        $("#cartItems").text(numberOfUnicorns);
        
        // This will be handled by the AJAX in the template
    });

    // Initialize popovers
    $('#chatPopover').popover({
        container: 'body',
        html: true,
        placement: 'top',
        title: 'Chat with us',
        content: '<div class="chat-popover-content"><p>Have a question about our products?</p><form><div class="form-group"><input type="text" class="form-control" placeholder="Type your message..."></div><button type="submit" class="btn btn-primary btn-sm">Send</button></form></div>'
    });

    // Close other popovers when a new one is opened
    $('[data-toggle="popover"]').on('click', function() {
        $('[data-toggle="popover"]').not(this).popover('hide');
    });

    // Close popover when clicking outside
    $(document).on('click', function(e) {
        if (!$(e.target).closest('.popover').length && !$(e.target).is('#chatPopover')) {
            $('#chatPopover').popover('hide');
        }
    });

    // Sign up button in modal
    $('#signUpBtn').click(function() {
        // Get form values
        const firstName = $('#formGroupFirstNameInput').val();
        const lastName = $('#formGroupLastNameInput2').val();
        const email = $('#formGroupInputEmail').val();
        
        if (firstName && lastName && email) {
            alert('Thank you for signing up for our newsletter!');
            $('#signUpModal').modal('hide');
            
            // Clear form
            $('#formGroupFirstNameInput').val('');
            $('#formGroupLastNameInput2').val('');
            $('#formGroupInputEmail').val('');
        } else {
            alert('Please fill in all fields');
        }
    });
});

// Function to toggle menu for responsive design
function menutoggle() {
    var menuItems = document.getElementById("menu-items");
    if (menuItems.style.maxHeight) {
        menuItems.style.maxHeight = null;
    } else {
        menuItems.style.maxHeight = "200px";
    }
}
