# E-commerce Website with Flask

A Flask-based eCommerce website with product listings, user authentication, cart functionality, and auction features.

## Project Structure

- `app.py` - Main Flask application with routes and business logic
- `main.py` - Entry point for running the application
- `templates/` - HTML templates using Jinja2
- `static/` - Static assets (CSS, JavaScript, images)

## Features

- Product listings and categories
- User registration and authentication
- Shopping cart functionality
- Auction system with bidding
- Responsive design

## How to Run in VS Code

1. **Set Up Your Environment:**
   
   ```bash
   # Create a virtual environment
   python -m venv venv
   
   # Activate it
   # On Windows:
   venv\Scripts\activate
   # On macOS/Linux:
   source venv/bin
   
   # Install dependencies
   pip install -r dependencies.txt
   ```

2. **Run in VS Code:**
   
   - Open the project in VS Code
   - Use the Run and Debug view (Ctrl+Shift+D or Cmd+Shift+D)
   - Choose "Python: Main Script" or "Python: Flask" configuration
   - Click the green play button or press F5

3. **Important Fix for "Could not import 'app'" Error:**
   
   When running with the Flask debugger in VS Code, make sure your `.vscode/launch.json` uses the correct app import:
   
   ```json
   "env": {
       "FLASK_APP": "main:app",
       ...
   },
   ```

   The colon notation specifies that the `app` object should be imported from the `main` module.

4. **Access the Website:**
   
   Open your browser to [http://127.0.0.1:5000](http://127.0.0.1:5000)

## Dependencies

- Flask - Web framework
- Flask-Login - User authentication
- Flask-SQLAlchemy - Database ORM
- Flask-WTF - Form handling
- Werkzeug - Utilities including password hashing
- Email-validator - Email validation
- Gunicorn - WSGI HTTP Server

## Notes

- For development, the app uses in-memory storage
- For production, configure proper database settings
- Set a proper SESSION_SECRET environment variable in production