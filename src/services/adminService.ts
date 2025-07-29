import { 
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  query, 
  where, 
  getDocs,
  deleteDoc 
} from 'firebase/firestore';
import { db } from '../firebase/config';

export interface AdminCode {
  code: string;
  isActive: boolean;
  createdBy: string;
  createdAt: Date;
  usedBy?: string;
  usedAt?: Date;
}

// Initialize default admin codes (you can change these)
export const initializeAdminCodes = async () => {
  try {
    const defaultCodes = [
      { code: 'Smita181504@.', isActive: true, createdBy: 'system', createdAt: new Date() },
      { code: 'ADMIN123', isActive: true, createdBy: 'system', createdAt: new Date() }
    ];

    for (const adminCode of defaultCodes) {
      const codeRef = doc(db, 'adminCodes', adminCode.code);
      await setDoc(codeRef, adminCode);
    }

    console.log('Admin codes initialized successfully');
  } catch (error) {
    console.error('Error initializing admin codes:', error);
  }
};

// Validate admin code
export const validateAdminCode = async (code: string): Promise<boolean> => {
  try {
    console.log('Validating admin code:', code);
    
    // For development/testing, allow these codes without Firebase check
    const hardcodedCodes = ['Smita181504@.', 'ADMIN123', 'admin123', 'ADMIN'];
    if (hardcodedCodes.includes(code)) {
      console.log('Admin code validated (hardcoded):', code);
      return true;
    }
    
    const codeRef = doc(db, 'adminCodes', code);
    const codeSnap = await getDoc(codeRef);
    
    if (!codeSnap.exists()) {
      console.log('Admin code not found in Firebase:', code);
      return false;
    }
    
    const adminCode = codeSnap.data() as AdminCode;
    const isValid = adminCode.isActive && !adminCode.usedBy;
    console.log('Admin code validation result:', isValid, adminCode);
    return isValid;
  } catch (error) {
    console.error('Error validating admin code:', error);
    return false;
  }
};

// Mark admin code as used
export const markAdminCodeAsUsed = async (code: string, usedBy: string) => {
  try {
    console.log('Marking admin code as used:', code, 'by:', usedBy);
    
    // For hardcoded codes, just log the usage (don't save to Firebase)
    const hardcodedCodes = ['Smita181504@.', 'ADMIN123', 'admin123', 'ADMIN'];
    if (hardcodedCodes.includes(code)) {
      console.log('Hardcoded admin code used:', code, 'by:', usedBy);
      return;
    }
    
    const codeRef = doc(db, 'adminCodes', code);
    await setDoc(codeRef, {
      usedBy,
      usedAt: new Date()
    }, { merge: true });
  } catch (error) {
    console.error('Error marking admin code as used:', error);
  }
};

// Get all admin codes (for admin management)
export const getAllAdminCodes = async (): Promise<AdminCode[]> => {
  try {
    const codesRef = collection(db, 'adminCodes');
    const querySnapshot = await getDocs(codesRef);
    
    const codes: AdminCode[] = [];
    querySnapshot.forEach((doc) => {
      codes.push({ code: doc.id, ...doc.data() } as AdminCode);
    });
    
    return codes;
  } catch (error) {
    console.error('Error getting admin codes:', error);
    return [];
  }
};

// Add new admin code
export const addAdminCode = async (code: string, createdBy: string): Promise<boolean> => {
  try {
    const codeRef = doc(db, 'adminCodes', code);
    await setDoc(codeRef, {
      code,
      isActive: true,
      createdBy,
      createdAt: new Date()
    });
    return true;
  } catch (error) {
    console.error('Error adding admin code:', error);
    return false;
  }
};

// Deactivate admin code
export const deactivateAdminCode = async (code: string): Promise<boolean> => {
  try {
    const codeRef = doc(db, 'adminCodes', code);
    await setDoc(codeRef, {
      isActive: false
    }, { merge: true });
    return true;
  } catch (error) {
    console.error('Error deactivating admin code:', error);
    return false;
  }
};

// Delete admin code
export const deleteAdminCode = async (code: string): Promise<boolean> => {
  try {
    const codeRef = doc(db, 'adminCodes', code);
    await deleteDoc(codeRef);
    return true;
  } catch (error) {
    console.error('Error deleting admin code:', error);
    return false;
  }
}; 