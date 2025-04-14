
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(200), nullable=False)
    
    def __repr__(self):
        return f'<User {self.email}>'

class Product(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    price = db.Column(db.Float, nullable=False)
    rating = db.Column(db.Float)
    image = db.Column(db.String(200))
    category = db.Column(db.String(50))
    description = db.Column(db.Text)

class Auction(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    starting_bid = db.Column(db.Float, nullable=False)
    current_bid = db.Column(db.Float)
    buy_now_price = db.Column(db.Float)
    seller = db.Column(db.String(100))
    end_time = db.Column(db.DateTime)
    status = db.Column(db.String(20), default='active')
    highest_bidder = db.Column(db.String(100))
    bid_count = db.Column(db.Integer, default=0)
    images = db.Column(db.Text)  # Store as JSON string
