// cart.js
// Will use your existing cart icon with class "cart-img"
document.querySelectorAll('.add-to-cart').forEach(btn => {
    btn.addEventListener('click', (e) => {
      if (!auth.currentUser) {
        alert("Please login first");
        window.location.href = "register.html";
        return;
      }
      const productId = e.target.closest('button').dataset.id;
      db.collection("users").doc(auth.currentUser.uid).update({
        cart: firebase.firestore.FieldValue.arrayUnion(productId)
      });
      // Update your existing badge
      document.getElementById('cartItems').textContent = 
        parseInt(document.getElementById('cartItems').textContent) + 1;
    });
  });