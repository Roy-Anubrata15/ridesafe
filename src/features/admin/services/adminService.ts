import { collection, query, where, getDocs, doc, updateDoc, addDoc, serverTimestamp, orderBy } from 'firebase/firestore'
import { db } from '../../../shared/services/firebase/config'

export interface AdminCode {
  code: string
  isActive: boolean
  usedBy?: string
  createdAt: Date
  createdBy: string
}

// Hardcoded admin codes for development
const hardcodedCodes = [
  'ADMIN001',
  'ADMIN002', 
  'ADMIN003',
  'SUPERADMIN',
  'RIDESAFE2024'
]

export const getAllAdminCodes = async (): Promise<AdminCode[]> => {
  try {
    const adminCodesRef = collection(db, 'adminCodes')
    const q = query(adminCodesRef, orderBy('createdAt', 'desc'))
    const querySnapshot = await getDocs(q)
    
    if (querySnapshot.empty) {
      // If no codes exist, return hardcoded ones
      return hardcodedCodes.map((code, index) => ({
        code,
        isActive: true,
        createdAt: new Date(Date.now() - index * 86400000), // Spread out creation dates
        createdBy: 'system'
      }))
    }
    
    return querySnapshot.docs.map(doc => ({
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date()
    })) as AdminCode[]
  } catch (error) {
    console.error('Error fetching admin codes:', error)
    throw error
  }
}

export const addAdminCode = async (code: string, createdBy: string): Promise<boolean> => {
  try {
    const adminCodesRef = collection(db, 'adminCodes')
    await addDoc(adminCodesRef, {
      code,
      isActive: true,
      createdAt: serverTimestamp(),
      createdBy
    })
    return true
  } catch (error) {
    console.error('Error adding admin code:', error)
    return false
  }
}

export const deactivateAdminCode = async (code: string): Promise<boolean> => {
  try {
    const adminCodesRef = collection(db, 'adminCodes')
    const q = query(adminCodesRef, where('code', '==', code))
    const querySnapshot = await getDocs(q)
    
    if (!querySnapshot.empty) {
      const docRef = doc(db, 'adminCodes', querySnapshot.docs[0].id)
      await updateDoc(docRef, {
        isActive: false
      })
      return true
    }
    return false
  } catch (error) {
    console.error('Error deactivating admin code:', error)
    return false
  }
}

export const deleteAdminCode = async (code: string): Promise<boolean> => {
  try {
    const adminCodesRef = collection(db, 'adminCodes')
    const q = query(adminCodesRef, where('code', '==', code))
    const querySnapshot = await getDocs(q)
    
    if (!querySnapshot.empty) {
      const docRef = doc(db, 'adminCodes', querySnapshot.docs[0].id)
      await updateDoc(docRef, {
        isActive: false
      })
      return true
    }
    return false
  } catch (error) {
    console.error('Error deleting admin code:', error)
    return false
  }
}

export const initializeAdminCodes = async (): Promise<void> => {
  try {
    const adminCodesRef = collection(db, 'adminCodes')
    const querySnapshot = await getDocs(adminCodesRef)
    
    if (querySnapshot.empty) {
      // Add hardcoded codes if none exist
      for (const code of hardcodedCodes) {
        await addDoc(adminCodesRef, {
          code,
          isActive: true,
          createdAt: serverTimestamp(),
          createdBy: 'system'
        })
      }
    }
  } catch (error) {
    console.error('Error initializing admin codes:', error)
    throw error
  }
}

export const markAdminCodeAsUsed = async (code: string, usedBy: string): Promise<boolean> => {
  try {
    // For hardcoded codes, just log the usage (don't save to Firebase)
    const hardcodedCodes = ['Smita181504@.', 'ADMIN123', 'admin123', 'ADMIN', 'RIDESAFE2024', 'ADMIN001', 'ADMIN002', 'ADMIN003', 'SUPERADMIN'];
    if (hardcodedCodes.includes(code)) {
      console.log('Hardcoded admin code used:', code, 'by:', usedBy);
      return true;
    }
    
    const adminCodesRef = collection(db, 'adminCodes')
    const q = query(adminCodesRef, where('code', '==', code))
    const querySnapshot = await getDocs(q)
    
    if (!querySnapshot.empty) {
      const docRef = doc(db, 'adminCodes', querySnapshot.docs[0].id)
      await updateDoc(docRef, {
        usedBy,
        isActive: false
      })
      return true
    }
    return false
  } catch (error) {
    console.error('Error marking admin code as used:', error)
    return false
  }
}

export const validateAdminCode = async (adminCode: string): Promise<boolean> => {
  try {
    // For development/testing, allow these codes without Firebase check
    const hardcodedCodes = ['Smita181504@.', 'ADMIN123', 'admin123', 'ADMIN', 'RIDESAFE2024', 'ADMIN001', 'ADMIN002', 'ADMIN003', 'SUPERADMIN'];
    if (hardcodedCodes.includes(adminCode)) {
      console.log('Admin code validated (hardcoded):', adminCode);
      return true;
    }
    
    const adminCodesRef = collection(db, 'adminCodes')
    const q = query(adminCodesRef, where('code', '==', adminCode), where('isActive', '==', true))
    const querySnapshot = await getDocs(q)
    
    return !querySnapshot.empty
  } catch (error) {
    console.error('Error validating admin code:', error)
    return false
  }
} 