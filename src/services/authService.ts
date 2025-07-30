import { 
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  query, 
  where, 
  getDocs,
  deleteDoc,
  updateDoc 
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { User } from 'firebase/auth';

// User types for Firestore
export interface UserData {
  uid: string;
  email: string;
  role: 'user' | 'admin' | 'driver';
  name: string;
  phone: string;
  createdAt: Date;
  emailVerified?: boolean;
  // User specific fields
  studentName?: string;
  // Driver specific fields
  licenseNumber?: string;
  vehicleNumber?: string;
  experience?: string;
  // Admin specific fields
  adminCode?: string;
}

// Create user document in Firestore
export const createUserDocument = async (user: User, userData: Omit<UserData, 'uid' | 'email' | 'createdAt'>) => {
  try {
    // Create unique document ID: uid_role (allows same email for different roles)
    const docId = `${user.uid}_${userData.role}`;
    const userRef = doc(db, 'users', docId);
    const userDoc = {
      uid: user.uid,
      email: user.email!,
      ...userData,
      createdAt: new Date()
    };
    
    await setDoc(userRef, userDoc);
    return userDoc;
  } catch (error) {
    console.error('Error creating user document:', error);
    throw error;
  }
};

// Get user document from Firestore
export const getUserDocument = async (uid: string): Promise<UserData | null> => {
  try {
    const userRef = doc(db, 'users', uid);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      return userSnap.data() as UserData;
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error getting user document:', error);
    throw error;
  }
};

// Check if email exists for a specific role (only verified accounts)
export const checkEmailExistsForRole = async (email: string, role: string): Promise<boolean> => {
  try {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('email', '==', email), where('role', '==', role));
    const querySnapshot = await getDocs(q);
    
    // If any document exists for this email/role, consider it valid
    // The verification status will be checked during login, not during registration check
    return !querySnapshot.empty;
  } catch (error) {
    console.error('Error checking email existence for role:', error);
    throw error;
  }
};

// Check if user is verified for a specific role
export const isUserVerifiedForRole = async (email: string, role: string): Promise<boolean> => {
  try {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('email', '==', email), where('role', '==', role));
    const querySnapshot = await getDocs(q);
    
    let isVerified = false;
    querySnapshot.forEach((doc) => {
      const userData = doc.data() as UserData;
      // Consider verified if emailVerified is true or not explicitly false
      if (userData.emailVerified !== false) {
        isVerified = true;
      }
    });
    
    return isVerified;
  } catch (error) {
    console.error('Error checking user verification for role:', error);
    return false;
  }
};

// Get unverified user documents for cleanup
export const getUnverifiedUsersByEmail = async (email: string): Promise<UserData[]> => {
  try {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('email', '==', email));
    const querySnapshot = await getDocs(q);
    
    const unverifiedUsers: UserData[] = [];
    querySnapshot.forEach((doc) => {
      const userData = doc.data() as UserData;
      if (userData.emailVerified === false) {
        unverifiedUsers.push(userData);
      }
    });
    
    return unverifiedUsers;
  } catch (error) {
    console.error('Error getting unverified users by email:', error);
    throw error;
  }
};

// Clean up unverified user accounts (both Firestore and Firebase Auth)
export const cleanupUnverifiedUsers = async (email: string): Promise<void> => {
  try {
    const unverifiedUsers = await getUnverifiedUsersByEmail(email);
    
    for (const userData of unverifiedUsers) {
      // Delete Firestore document
      const docId = `${userData.uid}_${userData.role}`;
      const userRef = doc(db, 'users', docId);
      await deleteDoc(userRef);
      
      console.log(`Cleaned up unverified user: ${docId}`);
    }
    
    // Note: Firebase Auth account cleanup would require admin SDK
    // For now, we only clean up Firestore documents
    // The Firebase Auth account will remain but won't affect new registrations
    // since we check Firestore for role-based registration
  } catch (error) {
    console.error('Error cleaning up unverified users:', error);
    throw error;
  }
};

// Mark user as verified in Firestore
export const markUserAsVerified = async (uid: string, role: string): Promise<void> => {
  try {
    const docId = `${uid}_${role}`;
    const userRef = doc(db, 'users', docId);
    await updateDoc(userRef, {
      emailVerified: true
    });
  } catch (error) {
    console.error('Error marking user as verified:', error);
    throw error;
  }
};

// Get all user documents for an email (for role switching)
export const getUserDocumentsByEmail = async (email: string): Promise<UserData[]> => {
  try {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('email', '==', email));
    const querySnapshot = await getDocs(q);
    
    const users: UserData[] = [];
    querySnapshot.forEach((doc) => {
      users.push(doc.data() as UserData);
    });
    
    return users;
  } catch (error) {
    console.error('Error getting user documents by email:', error);
    throw error;
  }
};

// Check if admin code is valid
export const validateAdminCode = async (adminCode: string): Promise<boolean> => {
  try {
    const adminsRef = collection(db, 'admins');
    const q = query(adminsRef, where('code', '==', adminCode));
    const querySnapshot = await getDocs(q);
    
    return !querySnapshot.empty;
  } catch (error) {
    console.error('Error validating admin code:', error);
    throw error;
  }
}; 