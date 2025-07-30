// Simple Firebase connection test
// Add this to your browser console to test Firebase connection

// Test Firebase Auth
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

const auth = getAuth();
const db = getFirestore();

console.log('Firebase Auth:', auth);
console.log('Firebase Firestore:', db);

// Test creating a user
createUserWithEmailAndPassword(auth, 'test@test.com', 'password123')
  .then((userCredential) => {
    console.log('User created successfully:', userCredential.user);
    
    // Test writing to Firestore
    const userRef = doc(db, 'users', userCredential.user.uid);
    return setDoc(userRef, {
      email: userCredential.user.email,
      role: 'user',
      createdAt: new Date()
    });
  })
  .then(() => {
    console.log('User document created successfully');
  })
  .catch((error) => {
    console.error('Error:', error);
  }); 