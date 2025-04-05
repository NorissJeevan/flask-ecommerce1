import { auth } from './firebase.js';
import { createUserWithEmailAndPassword } from "firebase/auth";

document.getElementById('registerForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const name = document.getElementById('name').value;
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Save additional user data to Firestore
    await setDoc(doc(db, "users", user.uid), {
      name: name,
      email: email,
      createdAt: new Date(),
      role: "customer"
    });
    
    alert('Registration successful!');
    window.location.href = 'index.html';
  } catch (error) {
    console.error("Registration error:", error);
    alert(error.message);
  }
});