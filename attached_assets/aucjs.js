// Auction System Main Controller
class AuctionSystem {
    constructor() {
        this.socket = null;
        this.productId = this.getProductIdFromUrl();
        this.currentUser = this.getCurrentUser();
        this.auctionEndTime = new Date(Date.now() + (2 * 24 * 60 * 60 * 1000) + (14 * 60 * 60 * 1000) + (36 * 60 * 1000)); // Default: 2d 14h 36m from now
        this.bidHistory = [];
        this.currentBid = 587.50;
        this.startingBid = 450.00;
        this.minimumBidIncrement = 0.50;
        this.buyNowPrice = 799.99;
        this.isAuctionActive = true;
    }

    // Initialize all components
    init() {
        document.addEventListener('DOMContentLoaded', () => {
            this.setupWebSocket();
            this.initializeCountdownTimer();
            this.loadBidHistory();
            this.setupEventListeners();
            this.updateUI();
            this.checkForExistingBids();
        });
    }

    // Get product ID from URL
    getProductIdFromUrl() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('id') || 'default_product_id';
    }

    // Get current user (simplified for demo)
    getCurrentUser() {
        return {
            id: 'user_' + Math.floor(Math.random() * 10000),
            username: 'user_' + Math.floor(Math.random() * 1000),
            isAuthenticated: true
        };
    }

    // WebSocket setup
    setupWebSocket() {
        // In production, use wss:// and proper authentication
        this.socket = new WebSocket(`ws://${window.location.host}/ws/auction/${this.productId}/`);

        this.socket.addEventListener('open', (event) => {
            console.log('WebSocket connection established');
            this.sendWebSocketMessage({
                type: 'subscribe',
                product_id: this.productId,
                user_id: this.currentUser.id
            });
        });

        this.socket.addEventListener('message', (event) => {
            try {
                const data = JSON.parse(event.data);
                console.log('WebSocket message:', data);
                this.handleWebSocketMessage(data);
            } catch (error) {
                console.error('Error parsing WebSocket message:', error);
            }
        });

        this.socket.addEventListener('close', (event) => {
            console.log('WebSocket connection closed');
            // Attempt to reconnect after a delay
            setTimeout(() => this.setupWebSocket(), 5000);
        });

        this.socket.addEventListener('error', (error) => {
            console.error('WebSocket error:', error);
        });
    }

    // Handle incoming WebSocket messages
    handleWebSocketMessage(data) {
        switch(data.type) {
            case 'new_bid':
                this.handleNewBid(data);
                break;
            case 'auction_ended':
                this.handleAuctionEnded(data);
                break;
            case 'outbid_notification':
                this.showOutbidNotification(data);
                break;
            case 'bid_error':
                this.showBidError(data);
                break;
            case 'auction_extended':
                this.handleAuctionExtended(data);
                break;
            case 'bid_history':
                this.updateBidHistory(data.history);
                break;
            default:
                console.log('Unhandled message type:', data.type);
        }
    }

    // Send message via WebSocket
    sendWebSocketMessage(message) {
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            this.socket.send(JSON.stringify(message));
        } else {
            console.error('WebSocket not ready, message not sent:', message);
            // Store message for later when connection is re-established
        }
    }

    // Initialize countdown timer
    initializeCountdownTimer() {
        this.updateTimerDisplay();
        this.timerInterval = setInterval(() => this.updateTimerDisplay(), 1000);
    }

    // Update the timer display
    updateTimerDisplay() {
        if (!this.isAuctionActive) {
            document.getElementById('auctionTimer').innerHTML = 'Auction Ended';
            document.getElementById('bidStatus').textContent = 'Ended';
            document.getElementById('bidStatus').className = 'badge badge-secondary';
            clearInterval(this.timerInterval);
            return;
        }

        const now = new Date();
        const diff = this.auctionEndTime - now;

        if (diff <= 0) {
            this.handleAuctionEnded({});
            return;
        }

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        document.getElementById('days').textContent = days;
        document.getElementById('hours').textContent = hours;
        document.getElementById('minutes').textContent = minutes;
        document.getElementById('seconds').textContent = seconds;
    }

    // Load bid history (simulated)
    loadBidHistory() {
        // In a real app, this would come from the server
        const mockHistory = [
            { bidder: 'john_doe', amount: 587.50, timestamp: new Date(Date.now() - 100000) },
            { bidder: 'tech_lover', amount: 580.00, timestamp: new Date(Date.now() - 200000) },
            { bidder: 'phone_fan', amount: 575.00, timestamp: new Date(Date.now() - 300000) },
            { bidder: 'bargain_hunter', amount: 570.00, timestamp: new Date(Date.now() - 400000) },
            { bidder: 'john_doe', amount: 565.00, timestamp: new Date(Date.now() - 500000) },
            { bidder: 'mobile_user', amount: 560.00, timestamp: new Date(Date.now() - 600000) },
            { bidder: 'auction_pro', amount: 555.00, timestamp: new Date(Date.now() - 700000) },
            { bidder: 'john_doe', amount: 550.00, timestamp: new Date(Date.now() - 800000) },
            { bidder: 'gadget_guru', amount: 545.00, timestamp: new Date(Date.now() - 900000) },
            { bidder: 'early_bidder', amount: 540.00, timestamp: new Date(Date.now() - 1000000) },
            { bidder: 'first_bidder', amount: 450.00, timestamp: new Date(Date.now() - 1100000) }
        ];

        this.updateBidHistory(mockHistory);
    }

    // Update bid history display
    updateBidHistory(history) {
        this.bidHistory = history.sort((a, b) => b.timestamp - a.timestamp);
        const historyList = document.getElementById('bidHistoryList');
        historyList.innerHTML = '';

        this.bidHistory.forEach(bid => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${bid.bidder}</td>
                <td>$${bid.amount.toFixed(2)}</td>
                <td>${bid.timestamp.toLocaleString()}</td>
            `;
            historyList.appendChild(row);
        });

        document.getElementById('bidCount').textContent = `${this.bidHistory.length} bids`;
    }

    // Setup all event listeners
    setupEventListeners() {
        // Place Bid button
        document.getElementById('placeBidBtn').addEventListener('click', () => this.handlePlaceBid());

        // Buy Now button
        document.getElementById('buyNowBtn').addEventListener('click', () => this.handleBuyNow());

        // Auto-bid toggle
        document.getElementById('enableAutoBid').addEventListener('change', (e) => {
            document.getElementById('autoBidOptions').style.display = e.target.checked ? 'block' : 'none';
        });

        // Bid amount validation
        document.getElementById('bidAmount').addEventListener('input', (e) => {
            const minBid = this.currentBid + this.minimumBidIncrement;
            if (parseFloat(e.target.value) < minBid) {
                e.target.setCustomValidity(`Bid must be at least $${minBid.toFixed(2)}`);
            } else {
                e.target.setCustomValidity('');
            }
        });

        // Max auto bid validation
        document.getElementById('maxAutoBid').addEventListener('input', (e) => {
            const minBid = this.currentBid + this.minimumBidIncrement;
            if (parseFloat(e.target.value) < minBid) {
                e.target.setCustomValidity(`Maximum bid must be at least $${minBid.toFixed(2)}`);
            } else {
                e.target.setCustomValidity('');
            }
        });
    }

    // Handle placing a bid
    handlePlaceBid() {
        if (!this.currentUser.isAuthenticated) {
            this.showLoginRequired();
            return;
        }

        if (!this.isAuctionActive) {
            this.showAuctionEndedError();
            return;
        }

        const bidAmountInput = document.getElementById('bidAmount');
        const bidAmount = parseFloat(bidAmountInput.value);
        const minBid = this.currentBid + this.minimumBidIncrement;

        if (isNaN(bidAmount) || bidAmount < minBid) {
            this.showBidError({ message: `Bid must be at least $${minBid.toFixed(2)}` });
            return;
        }

        const isAutoBid = document.getElementById('enableAutoBid').checked;
        const maxAutoBid = isAutoBid ? parseFloat(document.getElementById('maxAutoBid').value) : null;

        if (isAutoBid && (isNaN(maxAutoBid) || maxAutoBid < bidAmount)) {
            this.showBidError({ message: 'Maximum auto-bid must be higher than your initial bid' });
            return;
        }

        // Simulate sending bid to server
        this.sendWebSocketMessage({
            type: 'place_bid',
            product_id: this.productId,
            user_id: this.currentUser.id,
            amount: bidAmount,
            is_auto_bid: isAutoBid,
            max_auto_bid: maxAutoBid
        });

        // For demo purposes, we'll simulate a successful bid
        this.simulateNewBid({
            bidder: this.currentUser.username,
            amount: bidAmount,
            timestamp: new Date()
        });
    }

    // Handle Buy Now action
    handleBuyNow() {
        if (!this.currentUser.isAuthenticated) {
            this.showLoginRequired();
            return;
        }

        if (!this.isAuctionActive) {
            this.showAuctionEndedError();
            return;
        }

        if (confirm(`Are you sure you want to buy this item now for $${this.buyNowPrice}? This will end the auction immediately.`)) {
            // Simulate sending buy now to server
            this.sendWebSocketMessage({
                type: 'buy_now',
                product_id: this.productId,
                user_id: this.currentUser.id
            });

            // For demo purposes, we'll simulate a successful purchase
            this.simulateBuyNow();
        }
    }

    // Handle new bid from server
    handleNewBid(data) {
        this.currentBid = data.amount;
        this.updateUI();

        // Add to bid history
        this.bidHistory.unshift({
            bidder: data.bidder,
            amount: data.amount,
            timestamp: new Date(data.timestamp)
        });
        this.updateBidHistory(this.bidHistory);

        // Show notification if it's not our bid
        if (data.bidder !== this.currentUser.username) {
            this.showNewBidNotification(data);
        }
    }

    // Handle auction ended
    handleAuctionEnded(data) {
        this.isAuctionActive = false;
        this.updateUI();
        clearInterval(this.timerInterval);

        // Show auction ended notification
        this.showAuctionEndedNotification(data);
    }

    // Handle auction extended
    handleAuctionExtended(data) {
        this.auctionEndTime = new Date(data.new_end_time);
        this.updateUI();
        
        // Show extension notification
        const notificationContent = `
            <p>Auction has been extended!</p>
            <p>New end time: ${new Date(data.new_end_time).toLocaleString()}</p>
        `;
        this.showNotification('Auction Extended', notificationContent);
    }

    // Show outbid notification
    showOutbidNotification(data) {
        const notificationContent = `
            <p>You've been outbid on ${data.product_name}!</p>
            <p>Current bid: $${data.current_bid.toFixed(2)}</p>
            <button class="btn btn-primary" onclick="auctionSystem.handlePlaceBid()">Place Higher Bid</button>
        `;
        this.showNotification('You\'ve Been Outbid', notificationContent);
    }

    // Show bid error
    showBidError(data) {
        this.showNotification('Bid Error', data.message || 'There was an error placing your bid', 'danger');
    }

    // Show auction ended error
    showAuctionEndedError() {
        this.showNotification('Auction Ended', 'This auction has already ended', 'danger');
    }

    // Show login required
    showLoginRequired() {
        this.showNotification('Login Required', 'You must be logged in to place a bid or buy now', 'warning');
    }

    // Show new bid notification
    showNewBidNotification(data) {
        const notificationContent = `
            <p>New bid placed on this item!</p>
            <p>Current bid: $${data.amount.toFixed(2)} by ${data.bidder}</p>
        `;
        this.showNotification('New Bid Placed', notificationContent);
    }

    // Show auction ended notification
    showAuctionEndedNotification(data) {
        const winnerText = data.winner ? `Winner: ${data.winner} with $${data.winning_bid.toFixed(2)}` : 'No winning bidder';
        const notificationContent = `
            <p>The auction has ended!</p>
            <p>${winnerText}</p>
        `;
        this.showNotification('Auction Ended', notificationContent);
    }

    // Generic notification display
    showNotification(title, content, type = 'info') {
        const modal = $('#bidNotificationModal');
        modal.find('.modal-title').text(title);
        modal.find('.modal-body').html(content);
        
        // Change header color based on type
        const header = modal.find('.modal-header');
        header.removeClass('bg-info bg-success bg-warning bg-danger');
        
        switch(type) {
            case 'success':
                header.addClass('bg-success text-white');
                break;
            case 'warning':
                header.addClass('bg-warning text-dark');
                break;
            case 'danger':
                header.addClass('bg-danger text-white');
                break;
            default:
                header.addClass('bg-info text-white');
        }
        
        modal.modal('show');
    }

    // Update UI elements
    updateUI() {
        document.getElementById('currentBid').textContent = `$${this.currentBid.toFixed(2)}`;
        document.getElementById('bidAmount').min = (this.currentBid + this.minimumBidIncrement).toFixed(2);
        document.getElementById('bidAmount').value = (this.currentBid + this.minimumBidIncrement).toFixed(2);
        document.getElementById('maxAutoBid').min = (this.currentBid + this.minimumBidIncrement).toFixed(2);
        
        if (!this.isAuctionActive) {
            document.getElementById('placeBidBtn').disabled = true;
            document.getElementById('buyNowBtn').disabled = true;
            document.getElementById('enableAutoBid').disabled = true;
        }
    }

    // Check for existing bids from current user
    checkForExistingBids() {
        const userBids = this.bidHistory.filter(bid => bid.bidder === this.currentUser.username);
        if (userBids.length > 0) {
            const highestUserBid = Math.max(...userBids.map(bid => bid.amount));
            if (highestUserBid < this.currentBid) {
                this.showOutbidNotification({
                    product_name: document.getElementById('productTitle').textContent,
                    current_bid: this.currentBid
                });
            }
        }
    }

    // Simulate new bid for demo purposes
    simulateNewBid(data) {
        this.currentBid = data.amount;
        document.getElementById('highestBidder').textContent = data.bidder;
        this.updateUI();
        
        this.bidHistory.unshift(data);
        this.updateBidHistory(this.bidHistory);
        
        this.showNotification('Bid Placed', `Your bid of $${data.amount.toFixed(2)} has been placed successfully!`, 'success');
    }

    // Simulate buy now for demo purposes
    simulateBuyNow() {
        this.isAuctionActive = false;
        this.currentBid = this.buyNowPrice;
        document.getElementById('highestBidder').textContent = this.currentUser.username;
        this.updateUI();
        
        this.bidHistory.unshift({
            bidder: this.currentUser.username,
            amount: this.buyNowPrice,
            timestamp: new Date(),
            is_buy_now: true
        });
        this.updateBidHistory(this.bidHistory);
        
        this.showNotification('Purchase Complete', `You've purchased this item for $${this.buyNowPrice.toFixed(2)}! The auction is now closed.`, 'success');
    }
}

// Initialize the auction system
const auctionSystem = new AuctionSystem();
auctionSystem.init();