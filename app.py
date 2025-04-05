import os
import json
import logging
from datetime import datetime
from flask import Flask, render_template, request, redirect, url_for, session, flash
from werkzeug.security import generate_password_hash, check_password_hash

# Configure logging
logging.basicConfig(level=logging.DEBUG)

# Initialize Flask app
app = Flask(__name__)
app.secret_key = os.environ.get("SESSION_SECRET", "dev-key-for-testing")

# In-memory data storage
users = {}
products = [
    {
        "id": 1,
        "name": "Tablet PC",
        "price": 1000.99,
        "rating": 4,
        "image": "power-tab.jpeg",
        "category": "electronics"
    },
    {
        "id": 2,
        "name": "X-box Console",
        "price": 2000.00,
        "rating": 3,
        "image": "ps4-gaming.jpg",
        "category": "gaming"
    },
    {
        "id": 3,
        "name": "IPhone X",
        "price": 4999.99,
        "rating": 5,
        "image": "iphonex-phone.jpg",
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
        "image": "Alienware-laptop.png",
        "category": "laptops"
    },
    {
        "id": 6,
        "name": "Canon 12X Pro Shoot",
        "price": 990.00,
        "rating": 3.5,
        "image": "canon-cam.jpg",
        "category": "cameras"
    },
    {
        "id": 7,
        "name": "IPhone SE",
        "price": 4999.99,
        "rating": 3,
        "image": "iphone9-phone.jpg",
        "category": "phones"
    },
    {
        "id": 8,
        "name": "Samsung Tablet PC",
        "price": 3999.99,
        "rating": 4.5,
        "image": "logitech-tab.png",
        "category": "tablets"
    },
    {
        "id": 9,
        "name": "Apple Imac",
        "price": 7999.99,
        "rating": 4,
        "image": "imac.jpg",
        "category": "desktops"
    },
    {
        "id": 10,
        "name": "USB Type-C Thunderbolt",
        "price": 200.00,
        "rating": 4,
        "image": "thunderbolt.jpeg",
        "category": "accessories"
    },
    {
        "id": 11,
        "name": "Alienware Laptop",
        "price": 7000.99,
        "rating": 4,
        "image": "laptop-gaming.jpg",
        "category": "laptops"
    },
    {
        "id": 12,
        "name": "Call of Duty MW",
        "price": 1000.99,
        "rating": 4,
        "image": "cod-ps4.jpg",
        "category": "games"
    },
    {
        "id": 13,
        "name": "Phantom Drone",
        "price": 5999.99,
        "rating": 4,
        "image": "phantom-drone.png",
        "category": "drones"
    },
    {
        "id": 14,
        "name": "Giant Unicorn Plush",
        "price": 99.99,
        "rating": 5,
        "image": "product1.png",
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
        "images": ["product1.avif", "product2.jpg", "product3.jpg"]
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
    return render_template('index2.html', products=products)


@app.route('/auctions')
def auctions_page():
    return render_template('index-1.html', auctions=auctions)


@app.route('/auction/<int:auction_id>')
def auction_detail(auction_id):
    auction = next((a for a in auctions if a['id'] == auction_id), None)
    if not auction:
        flash('Auction not found', 'error')
        return redirect(url_for('auctions_page'))
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
        return json.dumps({'success': False, 'message': 'Please login first'}), 401
    
    # Get the auction
    auction = next((a for a in auctions if a['id'] == auction_id), None)
    
    if not auction:
        return json.dumps({'success': False, 'message': 'Auction not found'}), 404
    
    # Check if bid is higher than current bid
    if bid_amount <= auction['current_bid']:
        return json.dumps({'success': False, 'message': 'Bid must be higher than current bid'}), 400
    
    # Update auction
    auction['current_bid'] = bid_amount
    auction['highest_bidder'] = session['user_name']
    auction['bid_count'] += 1
    auction['bids'].insert(0, {
        'bidder': session['user_name'],
        'amount': bid_amount,
        'time': datetime.now().isoformat()
    })
    
    return json.dumps({
        'success': True,
        'current_bid': bid_amount,
        'highest_bidder': session['user_name'],
        'message': 'Bid placed successfully'
    })


@app.route('/buy_now', methods=['POST'])
def buy_now():
    auction_id = int(request.form.get('auction_id'))
    
    # Check if user is logged in
    if 'user_id' not in session:
        return json.dumps({'success': False, 'message': 'Please login first'}), 401
    
    # Get the auction
    auction = next((a for a in auctions if a['id'] == auction_id), None)
    
    if not auction:
        return json.dumps({'success': False, 'message': 'Auction not found'}), 404
    
    # Process buy now
    # In a real app, you would process payment and update inventory
    
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
    
    return json.dumps({
        'success': True,
        'message': 'Item purchased successfully'
    })
