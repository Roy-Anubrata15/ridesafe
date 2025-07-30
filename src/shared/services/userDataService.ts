import { 
  collection, 
  query, 
  where, 
  getDocs, 
  doc, 
  updateDoc, 
  onSnapshot,
  DocumentData,
  limit
} from 'firebase/firestore'
import { db } from './firebase/config'

export interface UserData {
  uid: string
  email: string
  role: string
  emailVerified: boolean
  admissionStatus: 'none' | 'pending' | 'approved' | 'rejected'
  studentName?: string
  studentClass?: string
  schoolName?: string
  pickupLocation?: string
  dropLocation?: string
  monthlyAmount?: number
  guardianName?: string
  guardianPhone?: string
  alternatePhone?: string
  guardianEmail?: string
  emergencyContact?: string
  medicalConditions?: string
  specialRequirements?: string
  createdAt?: Date
  updatedAt?: Date
}

export const getUserDataByEmail = async (email: string): Promise<UserData | null> => {
  try {
    const usersRef = collection(db, 'users')
    const q = query(usersRef, where('email', '==', email))
    const querySnapshot = await getDocs(q)
    
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0]
      const data = doc.data()
      return {
        uid: data.uid || doc.id, // Use data.uid if available, otherwise doc.id
        ...data,
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate()
      } as UserData
    }
    
    return null
  } catch (error) {
    console.error('Error fetching user data:', error)
    throw error
  }
}

export const updateUserData = async (uid: string, updates: Partial<UserData>): Promise<void> => {
  try {
    const userRef = doc(db, 'users', uid)
    await updateDoc(userRef, {
      ...updates,
      updatedAt: new Date()
    })
  } catch (error) {
    console.error('Error updating user data:', error)
    throw error
  }
}

export const subscribeToUserData = (email: string, callback: (userData: UserData | null) => void) => {
  const usersRef = collection(db, 'users')
  const q = query(usersRef, where('email', '==', email), limit(1))
  
  return onSnapshot(q, (snapshot) => {
    if (!snapshot.empty) {
      const doc = snapshot.docs[0]
      const data = doc.data()
      const userData: UserData = {
        uid: data.uid || doc.id, // Use data.uid if available, otherwise doc.id
        ...data,
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate()
      }
      callback(userData)
    } else {
      callback(null)
    }
  })
}

export const getAdmissionFormByEmail = async (email: string): Promise<any | null> => {
  try {
    const admissionFormsRef = collection(db, 'admissionForms')
    const q = query(admissionFormsRef, where('userEmail', '==', email))
    const querySnapshot = await getDocs(q)
    
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0]
      const data = doc.data()
      return {
        id: doc.id,
        ...data,
        submittedAt: data.submittedAt?.toDate(),
        reviewedAt: data.reviewedAt?.toDate()
      }
    }
    
    return null
  } catch (error) {
    console.error('Error fetching admission form:', error)
    throw error
  }
} 