/**
 * Auction.js - Handles auction functionality
 */

document.addEventListener('DOMContentLoaded', function() {
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
    
    // Bid form submission
    const bidForm = document.getElementById('bidForm');
    if (bidForm) {
        bidForm.addEventListener('submit', function(e) {
            // This is handled via AJAX in the template
            
            // This is just for client-side validation
            const bidAmount = document.getElementById('bidAmount').value;
            const currentBid = parseFloat(document.getElementById('currentBid').innerText.replace('$', ''));
            
            if (parseFloat(bidAmount) <= currentBid) {
                e.preventDefault();
                alert('Your bid must be higher than the current bid.');
                return false;
            }
        });
    }
    
    // Buy Now form submission
    const buyNowForm = document.getElementById('buyNowForm');
    if (buyNowForm) {
        buyNowForm.addEventListener('submit', function(e) {
            // This is handled via AJAX in the template
        });
    }
});

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
    
    // Get the end date (this would come from the server in a real app)
    const endDate = new Date("2023-12-31T23:59:59").getTime();
    
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
            daysElement.parentElement.textContent = "AUCTION ENDED";
            
            // Update the status
            const statusElement = document.getElementById('bidStatus');
            if (statusElement) {
                statusElement.textContent = "Ended";
                statusElement.classList.remove('badge-success');
                statusElement.classList.add('badge-secondary');
            }
            
            // Disable bid and buy now buttons
            const bidButton = document.getElementById('placeBidBtn');
            const buyNowButton = document.getElementById('buyNowBtn');
            
            if (bidButton) bidButton.disabled = true;
            if (buyNowButton) buyNowButton.disabled = true;
        }
    }, 1000);
}

/**
 * Place a bid on an auction
 * @param {string} auctionId - The ID of the auction
 * @param {number} bidAmount - The bid amount
 */
function placeBid(auctionId, bidAmount) {
    // In a real implementation, this would make an AJAX call to place the bid
    // This is handled via AJAX in the template
    console.log(`Placing bid of ${bidAmount} on auction ${auctionId}`);
}

/**
 * Buy an item now (skip the auction)
 * @param {string} auctionId - The ID of the auction
 */
function buyNow(auctionId) {
    // In a real implementation, this would make an AJAX call to buy the item
    // This is handled via AJAX in the template
    console.log(`Buying item from auction ${auctionId} now`);
}
