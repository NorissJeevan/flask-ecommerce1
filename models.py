class User:
    def __init__(self, id, name, email, password_hash):
        self.id = id
        self.name = name
        self.email = email
        self.password_hash = password_hash
        self.cart = []
        self.orders = []
        self.addresses = []
        self.wishlist = []

class Product:
    def __init__(self, id, name, price, rating, image, category, description=None):
        self.id = id
        self.name = name
        self.price = price
        self.rating = rating
        self.image = image
        self.category = category
        self.description = description

class Auction:
    def __init__(self, id, title, description, starting_bid, current_bid, buy_now_price, 
                 seller, end_time, images, status="active"):
        self.id = id
        self.title = title
        self.description = description
        self.starting_bid = starting_bid
        self.current_bid = current_bid
        self.buy_now_price = buy_now_price
        self.seller = seller
        self.end_time = end_time
        self.status = status
        self.highest_bidder = None
        self.bid_count = 0
        self.bids = []
        self.images = images
