import os
import json
import logging
from datetime import datetime, timedelta
from flask import Flask, render_template, request, redirect, url_for, session, flash, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from flask_socketio import SocketIO, emit

# Configure logging
logging.basicConfig(level=logging.DEBUG)

# Initialize Flask app
app = Flask(__name__)
app.secret_key = os.environ.get("SESSION_SECRET", "dev-key-for-testing")

# Initialize Socket.IO
socketio = SocketIO(app, cors_allowed_origins="*")

# In-memory data storage
users = {}
products = [
    {
        "id": 1,
        "name": "Tablet PC",
        "price": 1000.99,
        "rating": 4,
        "image": "laptop.png",
        "category": "electronics"
    },
    {
        "id": 2,
        "name": "X-box Console",
        "price": 2000.00,
        "rating": 3,
        "image": "gaming-console.jpg",
        "category": "gaming"
    },
    {
        "id": 3,
        "name": "IPhone X",
        "price": 4999.99,
        "rating": 5,
        "image": "iphone.jpg",
        "category": "phones"
    },
    {
        "id": 4,
        "name": "Logitech Super Slim",
        "price": 199.99,
        "rating": 4,
        "image": "keyboard.jpg",
        "category": "accessories"
    },
    {
        "id": 5,
        "name": "Gaming Laptop",
        "price": 7000.99,
        "rating": 4,
        "image": "gaming-laptop.jpg",
        "category": "laptops"
    },
    {
        "id": 6,
        "name": "Canon 12X Pro Shoot",
        "price": 990.00,
        "rating": 3.5,
        "image": "canon.jpg",
        "category": "cameras"
    },
    {
        "id": 7,
        "name": "IPhone SE",
        "price": 4999.99,
        "rating": 3,
        "image": "iphone.jpg",
        "category": "phones"
    },
    {
        "id": 8,
        "name": "Samsung Tablet PC",
        "price": 3999.99,
        "rating": 4.5,
        "image": "laptop.png",
        "category": "tablets"
    },
    {
        "id": 9,
        "name": "Apple Imac",
        "price": 7999.99,
        "rating": 4,
        "image": "watch.png",
        "category": "desktops"
    },
    {
        "id": 10,
        "name": "USB Type-C Thunderbolt",
        "price": 200.00,
        "rating": 4,
        "image": "keyboard.jpg",
        "category": "accessories"
    },
    {
        "id": 11,
        "name": "Alienware Laptop",
        "price": 7000.99,
        "rating": 4,
        "image": "gaming-laptop.jpg",
        "category": "laptops"
    },
    {
        "id": 12,
        "name": "Call of Duty MW",
        "price": 1000.99,
        "rating": 4,
        "image": "xbox-game.jpg",
        "category": "games"
    },
    {
        "id": 13,
        "name": "Phantom Drone",
        "price": 5999.99,
        "rating": 4,
        "image": "projector.png",
        "category": "drones"
    },
    {
        "id": 14,
        "name": "Giant Unicorn Plush",
        "price": 99.99,
        "rating": 5,
        "image": "headset.jpg",
        "category": "toys",
        "description": "This graceful unicorn will prance right into any child's collection -- and heart! With its pretty pink mane and tail, both scattered through with shimmering silver strands that catch the light, this enchanting friend is sure to become a new favorite. Additional irresistible details include super-silky plush fur, satin star decorations, beautiful blue eyes, and a soft, shiny horn."
    }
]

auctions = [
    {
        "id": 1,
        "title": "iPhone 12 Pro - Used (Excellent Condition)",
        "description": "Unlocked, 256GB storage, Pacific Blue color, includes original accessories.",
        "starting_bid": 450.00,
        "current_bid": 587.50,
        "buy_now_price": 799.99,
        "highest_bidder": "john_doe",
        "end_time": "2023-12-31T23:59:59",
        "seller": "ElectroHub Premium",
        "seller_rating": 4.5,
        "status": "active",
        "bid_count": 16,
        "bids": [
            {"bidder": "john_doe", "amount": 587.50, "time": "2023-12-15T14:35:22"},
            {"bidder": "tech_buyer", "amount": 575.00, "time": "2023-12-15T12:28:15"},
            {"bidder": "phone_collector", "amount": 550.00, "time": "2023-12-14T18:42:30"}
        ],
        "details": "This iPhone 12 Pro is in excellent condition with minimal signs of use. The phone has been factory reset and is ready for a new owner. It comes with all original accessories including charger, cable, and earphones (never used). The screen has always had a tempered glass protector and the phone has been kept in a case.",
        "specs": {
            "Model": "iPhone 12 Pro",
            "Storage": "256GB",
            "Color": "Pacific Blue",
            "Battery Health": "92%",
            "Carrier": "Unlocked for all carriers"
        },
        "shipping": {
            "method": "Standard Shipping",
            "cost": 12.99,
            "estimated_delivery": "3-5 business days"
        },
        "images": ["iphone.jpg", "camera.jpg", "webcam.jpg"]
    }
]


# Helper function to get user by email
def get_user_by_email(email):
    for user_id, user_data in users.items():
        if user_data['email'] == email:
            return user_data
    return None


# Routes
@app.route('/')
def home():
    featured_products = products[:4]
    latest_products = products[4:13]
    return render_template('index.html', featured_products=featured_products, latest_products=latest_products)


@app.route('/products')
def product_page():
    page = request.args.get('page', 1, type=int)
    sort_by = request.args.get('sort_by', 'newest')
    category = request.args.get('category', 'all')
    price_range = request.args.get('price_range', 'all')
    
    # Filter products
    filtered_products = products.copy()
    
    # Apply category filter
    if category.lower() != 'all':
        filtered_products = [p for p in filtered_products if p['category'].lower() == category.lower()]
    
    # Apply price range filter
    if price_range != 'all':
        price_ranges = {
            'under_50': (0, 50),
            '50_100': (50, 100),
            '100_500': (100, 500),
            'over_500': (500, float('inf'))
        }
        if price_range in price_ranges:
            min_price, max_price = price_ranges[price_range]
            filtered_products = [p for p in filtered_products if min_price <= p['price'] <= max_price]
    
    # Apply sorting
    if sort_by == 'price_low_high':
        filtered_products.sort(key=lambda x: x['price'])
    elif sort_by == 'price_high_low':
        filtered_products.sort(key=lambda x: x['price'], reverse=True)
    elif sort_by == 'popularity':
        filtered_products.sort(key=lambda x: x['rating'], reverse=True)
    
    # Pagination
    per_page = 8
    total_pages = (len(filtered_products) + per_page - 1) // per_page
    start = (page - 1) * per_page
    end = start + per_page
    
    paginated_products = filtered_products[start:end]
    
    return render_template('index2.html', 
                         products=paginated_products,
                         current_page=page,
                         total_pages=total_pages,
                         sort_by=sort_by,
                         category=category,
                         price_range=price_range)


@app.route('/auctions')
def auctions_page():
    # Update auction end times to be in the future for demo purposes
    current_time = datetime.now()
    for auction in auctions:
        if auction['status'] == 'active':
            # Set end time to 1 hour from now for testing
            end_time = current_time + timedelta(hours=1)
            auction['end_time'] = end_time.isoformat()
    
    return render_template('index-1.html', auctions=auctions)


@app.route('/auction/<int:auction_id>')
def auction_detail(auction_id):
    auction = next((a for a in auctions if a['id'] == auction_id), None)
    if not auction:
        flash('Auction not found', 'error')
        return redirect(url_for('auctions_page'))
    
    # Update end time to be in the future for demo purposes
    if auction['status'] == 'active':
        # Set end time to 1 hour from now for testing
        current_time = datetime.now()
        end_time = current_time + timedelta(hours=1)
        auction['end_time'] = end_time.isoformat()
    
    return render_template('index-1.html', auction=auction)


@app.route('/about')
def about():
    return render_template('about.html')


@app.route('/contact', methods=['GET', 'POST'])
def contact():
    if request.method == 'POST':
        name = request.form.get('entry.2005620554')
        email = request.form.get('entry.1045781291')
        message = request.form.get('entry.839337160')
        
        # Here you would typically send an email or store the contact message
        # For now, we'll just flash a success message
        flash('Thank you for your message! We will get back to you soon.', 'success')
        return render_template('contact.html', submitted=True)
    
    return render_template('contact.html', submitted=False)


@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        full_name = request.form.get('fullName')
        email = request.form.get('emailAddress')
        password = request.form.get('loginPassword')
        
        # Check if user already exists
        if get_user_by_email(email):
            flash('Email already registered', 'error')
            return render_template('register.html')
        
        # Create new user
        user_id = len(users) + 1
        users[user_id] = {
            'id': user_id,
            'name': full_name,
            'email': email,
            'password_hash': generate_password_hash(password),
            'cart': []
        }
        
        # Set session
        session['user_id'] = user_id
        session['user_email'] = email
        session['user_name'] = full_name
        session['cart'] = []
        
        flash('Registration successful!', 'success')
        return redirect(url_for('home'))
    
    return render_template('register.html')


@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        email = request.form.get('emailAddress')
        password = request.form.get('loginPassword')
        
        user = get_user_by_email(email)
        
        if user and check_password_hash(user['password_hash'], password):
            session['user_id'] = user['id']
            session['user_email'] = user['email']
            session['user_name'] = user['name']
            session['cart'] = user.get('cart', [])
            
            flash('Login successful!', 'success')
            return redirect(url_for('home'))
        else:
            flash('Invalid email or password', 'error')
    
    return render_template('register.html')


@app.route('/logout')
def logout():
    # Clear session
    session.clear()
    flash('You have been logged out', 'info')
    return redirect(url_for('home'))

@app.route('/update_profile', methods=['POST'])
def update_profile():
    if 'user_id' not in session:
        flash('Please login first', 'error')
        return redirect(url_for('login'))
    
    user_id = session['user_id']
    if user_id in users:
        users[user_id]['name'] = request.form.get('name')
        users[user_id]['email'] = request.form.get('email')
        session['user_name'] = request.form.get('name')
        session['user_email'] = request.form.get('email')
        flash('Profile updated successfully', 'success')
    else:
        flash('User not found', 'error')
    
    return redirect(url_for('dashboard'))

@app.route('/dashboard')
def dashboard():
    if 'user_id' not in session:
        flash('Please login first', 'error')
        return redirect(url_for('login'))
    
    user_id = session['user_id']
    user = users.get(user_id)
    
    if not user:
        flash('User not found', 'error')
        return redirect(url_for('home'))
    
    # Get user's orders from the in-memory storage
    orders = user.get('orders', [])
    addresses = user.get('addresses', [])
    wishlist = user.get('wishlist', [])
    
    return render_template('dashboard.html', 
                         user=user,
                         orders=orders,
                         addresses=addresses,
                         wishlist=wishlist)

@app.route('/add_address', methods=['POST'])
def add_address():
    if 'user_id' not in session:
        return jsonify({'success': False, 'message': 'Please login first'}), 401
    
    address = {
        'street': request.form.get('street'),
        'city': request.form.get('city'),
        'state': request.form.get('state'),
        'zip': request.form.get('zip')
    }
    
    user_id = session['user_id']
    if user_id in users:
        if 'addresses' not in users[user_id]:
            users[user_id]['addresses'] = []
        users[user_id]['addresses'].append(address)
        
    return jsonify({'success': True, 'message': 'Address added successfully'})

@app.route('/add_to_wishlist/<int:product_id>')
def add_to_wishlist(product_id):
    if 'user_id' not in session:
        return jsonify({'success': False, 'message': 'Please login first'}), 401
    
    product = next((p for p in products if p['id'] == product_id), None)
    if not product:
        return jsonify({'success': False, 'message': 'Product not found'}), 404
    
    user_id = session['user_id']
    if user_id in users:
        if 'wishlist' not in users[user_id]:
            users[user_id]['wishlist'] = []
        if product not in users[user_id]['wishlist']:
            users[user_id]['wishlist'].append(product)
    
    return jsonify({'success': True, 'message': 'Added to wishlist'})


@app.route('/add_to_cart', methods=['POST'])
def add_to_cart():
    product_id = int(request.form.get('product_id'))
    quantity = int(request.form.get('quantity', 1))
    
    # Get the product
    product = next((p for p in products if p['id'] == product_id), None)
    
    if not product:
        return json.dumps({'success': False, 'message': 'Product not found'}), 404
    
    # Check if user is logged in
    if 'user_id' not in session:
        return json.dumps({'success': False, 'message': 'Please login first'}), 401
    
    # Initialize cart in session if it doesn't exist
    if 'cart' not in session:
        session['cart'] = []
    
    # Check if product is already in cart
    cart = session['cart']
    cart_item = next((item for item in cart if item['product_id'] == product_id), None)
    
    if cart_item:
        cart_item['quantity'] += quantity
    else:
        cart.append({
            'product_id': product_id,
            'quantity': quantity,
            'name': product['name'],
            'price': product['price'],
            'image': product['image']
        })
    
    # Update session
    session['cart'] = cart
    
    # Update user cart if authenticated
    if 'user_id' in session:
        user_id = session['user_id']
        if user_id in users:
            users[user_id]['cart'] = cart
    
    return json.dumps({
        'success': True, 
        'cart_count': sum(item['quantity'] for item in cart),
        'message': f"{product['name']} added to cart"
    })


@app.route('/cart')
def view_cart():
    cart = session.get('cart', [])
    total = sum(item['price'] * item['quantity'] for item in cart)
    return render_template('cart.html', cart=cart, total=total)


@app.route('/place_bid', methods=['POST'])
def place_bid():
    auction_id = int(request.form.get('auction_id'))
    bid_amount = float(request.form.get('bid_amount'))
    
    # Check if user is logged in
    if 'user_id' not in session:
        return jsonify({'success': False, 'message': 'Please login first'}), 401
    
    # Get the auction
    auction = next((a for a in auctions if a['id'] == auction_id), None)
    
    if not auction:
        return jsonify({'success': False, 'message': 'Auction not found'}), 404
    
    # Check if auction is still active
    if auction['status'] != 'active':
        return jsonify({'success': False, 'message': 'This auction has ended'}), 400
    
    # Check if bid is higher than current bid
    if bid_amount <= auction['current_bid']:
        return jsonify({'success': False, 'message': 'Bid must be higher than current bid'}), 400
    
    # Format the current time
    current_time = datetime.now()
    formatted_time = current_time.strftime("%Y-%m-%d %H:%M:%S")
    
    # Update auction
    auction['current_bid'] = bid_amount
    auction['highest_bidder'] = session['user_name']
    auction['bid_count'] += 1
    
    # Create a new bid entry
    new_bid = {
        'bidder': session['user_name'],
        'amount': bid_amount,
        'time': current_time.isoformat(),
        'formatted_time': formatted_time
    }
    
    # Add the bid to the auction's bid history
    auction['bids'].insert(0, new_bid)
    
    # Emit a Socket.IO event to notify all clients about the new bid
    socketio.emit('bid_update', {
        'auction_id': auction_id,
        'current_bid': bid_amount,
        'highest_bidder': session['user_name'],
        'bid_count': auction['bid_count'],
        'new_bid': {
            'bidder': session['user_name'],
            'amount': bid_amount,
            'formatted_time': formatted_time
        }
    })
    
    return jsonify({
        'success': True,
        'current_bid': bid_amount,
        'highest_bidder': session['user_name'],
        'message': 'Bid placed successfully',
        'formatted_time': formatted_time
    })


@app.route('/buy_now', methods=['POST'])
def buy_now():
    auction_id = int(request.form.get('auction_id'))
    
    # Check if user is logged in
    if 'user_id' not in session:
        return jsonify({'success': False, 'message': 'Please login first'}), 401
    
    # Get the auction
    auction = next((a for a in auctions if a['id'] == auction_id), None)
    
    if not auction:
        return jsonify({'success': False, 'message': 'Auction not found'}), 404
    
    # Check if auction is still active
    if auction['status'] != 'active':
        return jsonify({'success': False, 'message': 'This auction has ended'}), 400
    
    # Process buy now
    # Add to cart
    if 'cart' not in session:
        session['cart'] = []
    
    session['cart'].append({
        'product_id': auction_id,
        'quantity': 1,
        'name': auction['title'],
        'price': auction['buy_now_price'],
        'image': auction['images'][0]
    })
    
    # Update auction status
    auction['status'] = 'sold'
    
    # Emit a Socket.IO event to notify all clients that the auction has ended
    socketio.emit('auction_ended', {
        'auction_id': auction_id,
        'status': 'sold',
        'message': f'This item has been purchased by {session["user_name"]}'
    })
    
    return jsonify({
        'success': True,
        'message': 'Item purchased successfully',
        'redirect_url': url_for('view_cart')
    })


# Socket.IO event handlers
@socketio.on('connect')
def handle_connect():
    logging.debug(f"Client connected: {request.sid}")


@socketio.on('join')
def handle_join(data):
    auction_id = data.get('auction_id')
    if auction_id:
        logging.debug(f"Client {request.sid} joined auction {auction_id}")
        # You could implement rooms here for scaling
        # For simplicity, we're using global events


@socketio.on('disconnect')
def handle_disconnect():
    logging.debug(f"Client disconnected: {request.sid}")


# Run the application with Socket.IO
if __name__ == "__main__":
    socketio.run(app, host="0.0.0.0", port=5000, debug=True, use_reloader=True, log_output=True)
