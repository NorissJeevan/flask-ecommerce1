/**
 * Auction.js - Handles auction functionality with real-time updates
 */

let socket; // Socket.IO connection

document.addEventListener('DOMContentLoaded', function() {
    // Initialize Socket.IO connection
    initSocketConnection();
    
    // Set up auction timer
    setupAuctionTimer();
    
    // Enable auto-bid toggle
    const autoBidCheckbox = document.getElementById('enableAutoBid');
    if (autoBidCheckbox) {
        autoBidCheckbox.addEventListener('change', function() {
            const autoBidOptions = document.getElementById('autoBidOptions');
            if (this.checked) {
                autoBidOptions.style.display = 'block';
            } else {
                autoBidOptions.style.display = 'none';
            }
        });
    }
    
    // Bid form submission with AJAX
    const bidForm = document.getElementById('bidForm');
    if (bidForm) {
        bidForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Client-side validation
            const bidAmount = document.getElementById('bidAmount').value;
            const currentBid = parseFloat(document.getElementById('currentBid').innerText.replace('$', ''));
            
            if (parseFloat(bidAmount) <= currentBid) {
                showAlert('Your bid must be higher than the current bid.', 'danger');
                return false;
            }
            
            // Get the auction ID
            const auctionId = this.elements['auction_id'].value;
            
            // Submit the bid via AJAX
            placeBid(auctionId, bidAmount);
        });
    }
    
    // Buy Now form submission with AJAX
    const buyNowForm = document.getElementById('buyNowForm');
    if (buyNowForm) {
        buyNowForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get the auction ID
            const auctionId = this.elements['auction_id'].value;
            
            // Submit the buy now request via AJAX
            buyNow(auctionId);
        });
    }
});

/**
 * Initialize Socket.IO connection
 */
function initSocketConnection() {
    try {
        // Connect to Socket.IO server
        socket = io();
        
        // On connection
        socket.on('connect', function() {
            console.log('Connected to Socket.IO server');
            
            // Join the auction room if on an auction page
            const bidForm = document.getElementById('bidForm');
            if (bidForm) {
                const auctionId = bidForm.elements['auction_id'].value;
                socket.emit('join', { auction_id: auctionId });
            }
        });
        
        // Listen for bid updates
        socket.on('bid_update', function(data) {
            updateBidInfo(data);
        });
        
        // Listen for auction ended events
        socket.on('auction_ended', function(data) {
            endAuction(data);
        });
        
        // Handle connection errors
        socket.on('connect_error', function(error) {
            console.error('Socket.IO connection error:', error);
        });
    } catch (error) {
        console.error('Error initializing Socket.IO:', error);
    }
}

/**
 * Update the auction page with new bid information
 * @param {Object} data - The bid update data
 */
function updateBidInfo(data) {
    // Update current bid display
    const currentBidElement = document.getElementById('currentBid');
    if (currentBidElement) {
        currentBidElement.textContent = '$' + data.current_bid.toFixed(2);
    }
    
    // Update highest bidder display
    const highestBidderElement = document.getElementById('highestBidder');
    if (highestBidderElement) {
        highestBidderElement.textContent = data.highest_bidder;
    }
    
    // Update bid count
    const bidCountElement = document.getElementById('bidCount');
    if (bidCountElement) {
        bidCountElement.textContent = data.bid_count + ' bids';
    }
    
    // Update minimum bid
    const bidAmountInput = document.getElementById('bidAmount');
    if (bidAmountInput) {
        const newMinBid = (data.current_bid + 0.50).toFixed(2);
        bidAmountInput.min = newMinBid;
        bidAmountInput.value = newMinBid;
        
        // Update the hint text
        const minBidHint = bidAmountInput.parentElement.nextElementSibling;
        if (minBidHint) {
            minBidHint.textContent = 'Minimum bid: $' + newMinBid;
        }
    }
    
    // Add the new bid to the bid history table
    const bidHistoryList = document.getElementById('bidHistoryList');
    if (bidHistoryList && data.new_bid) {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${data.new_bid.bidder}</td>
            <td>$${data.new_bid.amount.toFixed(2)}</td>
            <td>${data.new_bid.formatted_time}</td>
        `;
        
        // Insert at the top of the table
        bidHistoryList.insertBefore(row, bidHistoryList.firstChild);
        
        // Highlight the new row
        row.classList.add('bg-light');
        setTimeout(function() {
            row.classList.remove('bg-light');
        }, 3000);
    }
    
    // Show a success notification
    showAlert(`New bid of $${data.current_bid.toFixed(2)} placed by ${data.highest_bidder}`, 'success');
}

/**
 * End the auction and update the UI
 * @param {Object} data - The auction ended data
 */
function endAuction(data) {
    // Update the status
    const statusElement = document.getElementById('bidStatus');
    if (statusElement) {
        statusElement.textContent = "Ended";
        statusElement.classList.remove('badge-success');
        statusElement.classList.add('badge-secondary');
    }
    
    // Update the timer
    const timerElement = document.getElementById('auctionTimer');
    if (timerElement) {
        timerElement.textContent = "AUCTION ENDED";
    }
    
    // Disable bid and buy now buttons
    const bidButton = document.getElementById('placeBidBtn');
    const buyNowButton = document.getElementById('buyNowBtn');
    
    if (bidButton) bidButton.disabled = true;
    if (buyNowButton) buyNowButton.disabled = true;
    
    // Show a notification
    showAlert(data.message, 'info');
}

/**
 * Setup the auction countdown timer
 */
function setupAuctionTimer() {
    // Check if auction timer elements exist
    const daysElement = document.getElementById('days');
    const hoursElement = document.getElementById('hours');
    const minutesElement = document.getElementById('minutes');
    const secondsElement = document.getElementById('seconds');
    
    if (!daysElement || !hoursElement || !minutesElement || !secondsElement) {
        return;
    }
    
    // Get the end date from the page data
    // Extract the date from a data attribute or the page
    const endDateStr = document.getElementById('auctionTimer').getAttribute('data-end-time') || daysElement.getAttribute('data-end-time');
    const endDate = new Date(endDateStr || new Date().getTime() + 3600000).getTime(); // Default to 1 hour from now
    
    // Update the countdown every second
    const countdown = setInterval(function() {
        // Get the current time
        const now = new Date().getTime();
        
        // Calculate the time remaining
        const timeRemaining = endDate - now;
        
        // Calculate days, hours, minutes, and seconds
        const days = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
        const hours = Math.floor((timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000);
        
        // Update the timer elements
        daysElement.textContent = days;
        hoursElement.textContent = hours;
        minutesElement.textContent = minutes;
        secondsElement.textContent = seconds;
        
        // If the auction has ended
        if (timeRemaining < 0) {
            clearInterval(countdown);
            endAuction({
                message: 'This auction has ended due to time expiration.'
            });
        }
    }, 1000);
}

/**
 * Place a bid on an auction via AJAX
 * @param {string} auctionId - The ID of the auction
 * @param {number} bidAmount - The bid amount
 */
function placeBid(auctionId, bidAmount) {
    // Show a loading spinner on the bid button
    const bidButton = document.getElementById('placeBidBtn');
    const originalText = bidButton.textContent;
    bidButton.disabled = true;
    bidButton.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Bidding...';
    
    // Prepare the form data
    const formData = new FormData();
    formData.append('auction_id', auctionId);
    formData.append('bid_amount', bidAmount);
    
    // Make the AJAX request
    fetch('/place_bid', {
        method: 'POST',
        body: formData,
        headers: {
            'X-Requested-With': 'XMLHttpRequest'
        }
    })
    .then(response => response.json())
    .then(data => {
        // Re-enable the button
        bidButton.disabled = false;
        bidButton.textContent = originalText;
        
        if (data.success) {
            // The Socket.IO event will handle updating the UI
            console.log('Bid placed successfully');
        } else {
            // Show an error message
            showAlert(data.message, 'danger');
        }
    })
    .catch(error => {
        // Re-enable the button
        bidButton.disabled = false;
        bidButton.textContent = originalText;
        
        // Show an error message
        console.error('Error placing bid:', error);
        showAlert('An error occurred while placing your bid. Please try again.', 'danger');
    });
}

/**
 * Buy an item now (skip the auction) via AJAX
 * @param {string} auctionId - The ID of the auction
 */
function buyNow(auctionId) {
    // Show a loading spinner on the buy now button
    const buyNowButton = document.getElementById('buyNowBtn');
    const originalText = buyNowButton.textContent;
    buyNowButton.disabled = true;
    buyNowButton.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Processing...';
    
    // Prepare the form data
    const formData = new FormData();
    formData.append('auction_id', auctionId);
    
    // Make the AJAX request
    fetch('/buy_now', {
        method: 'POST',
        body: formData,
        headers: {
            'X-Requested-With': 'XMLHttpRequest'
        }
    })
    .then(response => response.json())
    .then(data => {
        // Re-enable the button
        buyNowButton.disabled = false;
        buyNowButton.textContent = originalText;
        
        if (data.success) {
            // Show a success message
            showAlert(data.message, 'success');
            
            // If there's a redirect URL, navigate to it after a short delay
            if (data.redirect_url) {
                setTimeout(function() {
                    window.location.href = data.redirect_url;
                }, 2000);
            }
        } else {
            // Show an error message
            showAlert(data.message, 'danger');
        }
    })
    .catch(error => {
        // Re-enable the button
        buyNowButton.disabled = false;
        buyNowButton.textContent = originalText;
        
        // Show an error message
        console.error('Error buying item:', error);
        showAlert('An error occurred while processing your purchase. Please try again.', 'danger');
    });
}

/**
 * Show an alert message on the page
 * @param {string} message - The message to display
 * @param {string} type - The type of alert (success, danger, info, warning)
 */
function showAlert(message, type = 'info') {
    // Create the alert element
    const alertElement = document.createElement('div');
    alertElement.className = `alert alert-${type} alert-dismissible fade show`;
    alertElement.setAttribute('role', 'alert');
    
    alertElement.innerHTML = `
        ${message}
        <button type="button" class="close" data-dismiss="alert" aria-label="Close">
            <span aria-hidden="true">&times;</span>
        </button>
    `;
    
    // Find a container for the alert
    const container = document.querySelector('.container');
    
    // Insert the alert at the top of the container
    container.insertBefore(alertElement, container.firstChild);
    
    // Automatically remove the alert after 5 seconds
    setTimeout(function() {
        alertElement.classList.remove('show');
        setTimeout(function() {
            alertElement.remove();
        }, 150);
    }, 5000);
}
