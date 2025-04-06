// auth.js
// Register form (preserve your existing register.html structure)
document.getElementById('registerForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    auth.createUserWithEmailAndPassword(email, password)
      .then(() => {
        // Redirect keeping your original flow
        window.location.href = "index.html"; 
      })
      .catch(error => {
        alert(error.message);
      });
  });