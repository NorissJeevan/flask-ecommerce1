/**
 * Firebase configuration (mock)
 * 
 * This is a placeholder file to maintain compatibility with
 * the original codebase. In this Flask implementation, we're
 * not actually using Firebase, but we keep this file to prevent
 * any JavaScript errors from the original code that might reference it.
 */

// Create a mock Firebase object
const firebase = {
    app: null,
    auth: null,
    firestore: null,
    
    // Initialize Firebase app
    initializeApp: function(config) {
        console.log('Firebase mock initialized');
        this.app = {
            name: config.projectId,
            options: config
        };
        return this.app;
    }
};

// Mock Firebase configuration
const firebaseConfig = {
    apiKey: "mock-api-key",
    authDomain: "tradello-app.firebaseapp.com",
    projectId: "tradello-app",
    storageBucket: "tradello-app.appspot.com",
    messagingSenderId: "123456789012",
    appId: "1:123456789012:web:abcdef1234567890"
};

// Initialize Firebase (mock)
const app = firebase.initializeApp(firebaseConfig);
const auth = {
    currentUser: null,
    
    // Check if user is signed in
    onAuthStateChanged: function(callback) {
        // We'll use the Flask session instead
        callback(this.currentUser);
    },
    
    // Sign out function
    signOut: function() {
        console.log('Firebase mock: User signed out');
        window.location.href = '/logout';
        return Promise.resolve();
    }
};

// Mock Firestore database
const db = {
    collection: function(name) {
        console.log(`Firebase mock: Accessing collection ${name}`);
        return {
            doc: function(id) {
                console.log(`Firebase mock: Accessing document ${id}`);
                return {
                    get: function() {
                        return Promise.resolve({
                            exists: false,
                            data: function() { return null; }
                        });
                    },
                    set: function(data) {
                        console.log('Firebase mock: Setting data', data);
                        return Promise.resolve();
                    },
                    update: function(data) {
                        console.log('Firebase mock: Updating data', data);
                        return Promise.resolve();
                    }
                };
            }
        };
    }
};

// Make these objects available globally to maintain compatibility
window.firebase = firebase;
window.auth = auth;
window.db = db;
