import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDg5rY_D9FuJiyzPkMqmFso3aSEzqWenHU",
  authDomain: "ridesafe-8589d.firebaseapp.com",
  projectId: "ridesafe-8589d",
  storageBucket: "ridesafe-8589d.firebasestorage.app",
  messagingSenderId: "750584383960",
  appId: "1:750584383960:web:55db86865fa353b0748aad",
  measurementId: "G-YMT51B2PJP"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const analytics = getAnalytics(app);

export default app; 