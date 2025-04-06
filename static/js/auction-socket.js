/**
 * Auction Socket.IO Integration
 * Handles real-time updates for auction functionality
 */

// Initialize Socket.IO connection when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Only initialize socket if we're on the auction page
    if (document.getElementById('auctionTimer')) {
        initializeSocketIO();
    }
});

let socket = null;

/**
 * Initialize the Socket.IO connection
 */
function initializeSocketIO() {
    // Get auction ID from the page data
    const auctionTimer = document.getElementById('auctionTimer');
    const auctionId = getAuctionIdFromUrl();
    
    if (!auctionId) {
        console.log('No auction ID found, skipping Socket.IO initialization');
        return;
    }
    
    // Parse the end time from the timer element's data attribute
    const endTimeStr = auctionTimer?.dataset?.endTime;
    if (endTimeStr) {
        // Initialize countdown with the end time from server
        initializeCountdown(new Date(endTimeStr));
    }
    
    // Connect to Socket.IO server
    socket = io();
    
    socket.on('connect', function() {
        console.log('Socket.IO connected');
        
        // Join the auction room
        socket.emit('join', {
            auction_id: auctionId
        });
    });
    
    // Listen for bid updates
    socket.on('bid_update', function(data) {
        console.log('Bid update received:', data);
        updateBidInfo(data);
    });
    
    // Listen for auction end events
    socket.on('auction_ended', function(data) {
        console.log('Auction ended event received:', data);
        endAuction(data);
    });
    
    socket.on('disconnect', function() {
        console.log('Socket.IO disconnected, attempting to reconnect...');
    });
}

/**
 * Get the auction ID from the URL
 * @returns {string|null} The auction ID or null if not found
 */
function getAuctionIdFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id');
}

/**
 * Initialize the countdown timer
 * @param {Date} endTime - The auction end time
 */
function initializeCountdown(endTime) {
    const timerElement = document.getElementById('auctionTimer');
    if (!timerElement) return;
    
    const daysElement = document.getElementById('days');
    const hoursElement = document.getElementById('hours');
    const minutesElement = document.getElementById('minutes');
    const secondsElement = document.getElementById('seconds');
    
    function updateTimer() {
        const now = new Date();
        const diff = endTime - now;
        
        if (diff <= 0) {
            clearInterval(timerInterval);
            timerElement.innerHTML = '<span class="auction-ended">Auction Ended</span>';
            
            // Disable bid button
            const bidButton = document.getElementById('placeBidBtn');
            if (bidButton) {
                bidButton.disabled = true;
                bidButton.innerText = 'Auction Ended';
            }
            
            return;
        }
        
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        
        if (daysElement) daysElement.textContent = days;
        if (hoursElement) hoursElement.textContent = hours;
        if (minutesElement) minutesElement.textContent = minutes;
        if (secondsElement) secondsElement.textContent = seconds;
    }
    
    // Initialize with the first update
    updateTimer();
    
    // Then update every second
    const timerInterval = setInterval(updateTimer, 1000);
}

/**
 * Update the bid information on the page
 * @param {Object} data - The bid data from Socket.IO
 */
function updateBidInfo(data) {
    // Update the current bid display
    const currentBidElement = document.getElementById('currentBid');
    if (currentBidElement && data.current_bid) {
        currentBidElement.textContent = '$' + data.current_bid.toFixed(2);
    }
    
    // Update the highest bidder display
    const highestBidderElement = document.getElementById('highestBidder');
    if (highestBidderElement && data.highest_bidder) {
        highestBidderElement.textContent = data.highest_bidder;
    }
    
    // Update the bid count display
    const bidCountElement = document.getElementById('bidCount');
    if (bidCountElement && data.bid_count) {
        bidCountElement.textContent = data.bid_count + ' bids';
    }
    
    // Add the new bid to the history table
    if (data.new_bid) {
        const bidHistoryList = document.getElementById('bidHistoryList');
        if (bidHistoryList) {
            const newRow = document.createElement('tr');
            newRow.innerHTML = `
                <td>${data.new_bid.bidder}</td>
                <td>$${data.new_bid.amount?.toFixed(2) || data.current_bid.toFixed(2)}</td>
                <td>${data.new_bid.formatted_time}</td>
            `;
            
            // Add the new row at the top
            if (bidHistoryList.firstChild) {
                bidHistoryList.insertBefore(newRow, bidHistoryList.firstChild);
            } else {
                bidHistoryList.appendChild(newRow);
            }
        }
    }
    
    // Show notification toast
    showNotification('New Bid', `A new bid of $${data.current_bid.toFixed(2)} has been placed by ${data.highest_bidder}`);
}

/**
 * End the auction and update the UI
 * @param {Object} data - The auction ended data
 */
function endAuction(data) {
    // Update the timer
    const timerElement = document.getElementById('auctionTimer');
    if (timerElement) {
        timerElement.innerHTML = '<span class="auction-ended">Auction Ended</span>';
    }
    
    // Disable bid button
    const bidButton = document.getElementById('placeBidBtn');
    if (bidButton) {
        bidButton.disabled = true;
        bidButton.innerText = 'Auction Ended';
    }
    
    // Disable buy now button
    const buyNowButton = document.getElementById('buyNowBtn');
    if (buyNowButton) {
        buyNowButton.disabled = true;
    }
    
    // Show notification toast
    showNotification('Auction Ended', data.message || 'This auction has ended');
}

/**
 * Show a notification toast
 * @param {string} title - The notification title
 * @param {string} message - The notification message
 */
function showNotification(title, message) {
    // Check if the toast container exists
    let toastContainer = document.getElementById('toast-container');
    if (!toastContainer) {
        // Create the toast container if it doesn't exist
        toastContainer = document.createElement('div');
        toastContainer.id = 'toast-container';
        toastContainer.style.position = 'fixed';
        toastContainer.style.top = '20px';
        toastContainer.style.right = '20px';
        toastContainer.style.zIndex = '1000';
        document.body.appendChild(toastContainer);
    }
    
    // Create the toast
    const toast = document.createElement('div');
    toast.className = 'toast show';
    toast.style.minWidth = '300px';
    toast.style.background = '#fff';
    toast.style.color = '#000';
    toast.style.borderLeft = '4px solid #007bff';
    toast.style.boxShadow = '0 0.25rem 0.75rem rgba(0, 0, 0, 0.1)';
    toast.style.marginBottom = '10px';
    toast.style.opacity = '1';
    
    toast.innerHTML = `
        <div style="padding: 0.75rem 1.25rem; border-bottom: 1px solid #efefef; background-color: rgba(0, 0, 0, 0.03); display: flex; justify-content: space-between; align-items: center;">
            <strong>${title}</strong>
            <button type="button" style="border: none; background: transparent; font-size: 1.5rem; font-weight: 700; line-height: 1; color: #000; text-shadow: 0 1px 0 #fff; opacity: 0.5; cursor: pointer;" onclick="this.parentElement.parentElement.remove()">×</button>
        </div>
        <div style="padding: 0.75rem 1.25rem;">
            ${message}
        </div>
    `;
    
    // Add the toast to the container
    toastContainer.appendChild(toast);
    
    // Remove the toast after 5 seconds
    setTimeout(() => {
        toast.remove();
    }, 5000);
}

/**
 * Place a bid on an auction
 * @param {number} auctionId - The ID of the auction
 * @param {number} bidAmount - The amount to bid
 */
function placeBid(auctionId, bidAmount) {
    // Validate the bid amount
    if (!bidAmount || isNaN(bidAmount) || bidAmount <= 0) {
        showNotification('Error', 'Please enter a valid bid amount', 'error');
        return;
    }
    
    // Create form data to submit via AJAX
    const formData = new FormData();
    formData.append('auction_id', auctionId);
    formData.append('bid_amount', bidAmount);
    
    // Send the bid via AJAX
    fetch('/place_bid', {
        method: 'POST',
        body: formData,
        headers: {
            'X-Requested-With': 'XMLHttpRequest'
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Clear the bid amount field
            const bidAmountField = document.getElementById('bidAmount');
            if (bidAmountField) {
                bidAmountField.value = '';
            }
            
            // Show success notification
            showNotification('Bid Successful', data.message || 'Your bid has been placed successfully');
        } else {
            // Show error notification
            showNotification('Bid Failed', data.message || 'There was an error placing your bid');
        }
    })
    .catch(error => {
        console.error('Error placing bid:', error);
        showNotification('Error', 'There was an error placing your bid');
    });
}

/**
 * Handle the "Buy Now" functionality
 * @param {number} auctionId - The ID of the auction
 */
function buyNow(auctionId) {
    if (!confirm('Are you sure you want to buy this item now? This will end the auction.')) {
        return;
    }
    
    // Create form data for the buy now action
    const formData = new FormData();
    formData.append('auction_id', auctionId);
    
    // Send the buy now request via AJAX
    fetch('/buy_now', {
        method: 'POST',
        body: formData,
        headers: {
            'X-Requested-With': 'XMLHttpRequest'
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showNotification('Purchase Successful', data.message || 'You have successfully purchased this item');
            
            // Redirect to cart if provided
            if (data.redirect_url) {
                setTimeout(() => {
                    window.location.href = data.redirect_url;
                }, 2000);
            }
        } else {
            showNotification('Purchase Failed', data.message || 'There was an error completing your purchase');
        }
    })
    .catch(error => {
        console.error('Error buying now:', error);
        showNotification('Error', 'There was an error completing your purchase');
    });
}

// Add event listeners for the auction buttons
document.addEventListener('DOMContentLoaded', function() {
    // Place Bid button
    const placeBidButton = document.getElementById('placeBidBtn');
    if (placeBidButton) {
        placeBidButton.addEventListener('click', function(event) {
            event.preventDefault();
            const auctionId = getAuctionIdFromUrl();
            const bidAmountElement = document.getElementById('bidAmount');
            const bidAmount = bidAmountElement ? parseFloat(bidAmountElement.value) : 0;
            
            if (auctionId) {
                placeBid(auctionId, bidAmount);
            }
        });
    }
    
    // Buy Now button
    const buyNowButton = document.getElementById('buyNowBtn');
    if (buyNowButton) {
        buyNowButton.addEventListener('click', function(event) {
            event.preventDefault();
            const auctionId = getAuctionIdFromUrl();
            
            if (auctionId) {
                buyNow(auctionId);
            }
        });
    }
});
