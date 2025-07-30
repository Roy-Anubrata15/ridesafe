import { 
  collection, 
  query, 
  where, 
  getDocs, 
  doc, 
  updateDoc, 
  onSnapshot,
  writeBatch,
  serverTimestamp,
  DocumentData,
  limit,
  orderBy
} from 'firebase/firestore'
import { db } from './firebase/config'
import { UserData } from './userDataService'

// Event types for real-time synchronization
export type SyncEventType = 
  | 'user_data_updated'
  | 'admission_status_changed'
  | 'change_request_submitted'
  | 'change_request_approved'
  | 'change_request_rejected'
  | 'payment_status_updated'
  | 'admin_action_performed'

export interface SyncEvent {
  type: SyncEventType
  userId: string
  userEmail: string
  timestamp: Date
  data: any
  adminEmail?: string
}

export interface RealTimeSyncCallbacks {
  onUserDataUpdate?: (userData: UserData) => void
  onAdmissionStatusChange?: (email: string, status: string) => void
  onChangeRequestUpdate?: (email: string, requestData: any) => void
  onPaymentUpdate?: (email: string, paymentData: any) => void
  onAdminAction?: (actionData: any) => void
}

// Global listeners to prevent multiple subscriptions
const activeListeners = new Map<string, () => void>()
const syncCallbacks = new Map<string, RealTimeSyncCallbacks>()

/**
 * Subscribe to real-time updates for a specific user
 */
export const subscribeToUserRealTimeUpdates = (
  userEmail: string, 
  callbacks: RealTimeSyncCallbacks
): (() => void) => {
  const listenerKey = `user_${userEmail}`
  
  // If already listening, update callbacks
  if (activeListeners.has(listenerKey)) {
    syncCallbacks.set(listenerKey, callbacks)
    return () => unsubscribeFromUserRealTimeUpdates(userEmail)
  }

  // Subscribe to user data changes
  const usersRef = collection(db, 'users')
  const userQuery = query(usersRef, where('email', '==', userEmail), limit(1))
  
  const userUnsubscribe = onSnapshot(userQuery, (snapshot) => {
    if (!snapshot.empty) {
      const doc = snapshot.docs[0]
      const data = doc.data()
      const userData: UserData = {
        uid: data.uid || doc.id,
        ...data,
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate()
      }
      
      const userCallbacks = syncCallbacks.get(listenerKey)
      if (userCallbacks?.onUserDataUpdate) {
        userCallbacks.onUserDataUpdate(userData)
      }
    }
  })

  // Subscribe to admission forms for this user
  const admissionFormsRef = collection(db, 'admissionForms')
  const admissionQuery = query(
    admissionFormsRef, 
    where('userEmail', '==', userEmail),
    orderBy('submittedAt', 'desc'),
    limit(1)
  )
  
  const admissionUnsubscribe = onSnapshot(admissionQuery, (snapshot) => {
    if (!snapshot.empty) {
      const doc = snapshot.docs[0]
      const data = doc.data()
      
      const userCallbacks = syncCallbacks.get(listenerKey)
      if (userCallbacks?.onAdmissionStatusChange) {
        userCallbacks.onAdmissionStatusChange(userEmail, data.status)
      }
    }
  })

  // Subscribe to change requests for this user
  const changeRequestsRef = collection(db, 'changeRequests')
  const changeRequestQuery = query(
    changeRequestsRef,
    where('userEmail', '==', userEmail),
    orderBy('requestDate', 'desc')
  )
  
  const changeRequestUnsubscribe = onSnapshot(changeRequestQuery, (snapshot) => {
    snapshot.docChanges().forEach((change) => {
      const data = change.doc.data()
      const userCallbacks = syncCallbacks.get(listenerKey)
      
      if (change.type === 'added' || change.type === 'modified') {
        if (userCallbacks?.onChangeRequestUpdate) {
          userCallbacks.onChangeRequestUpdate(userEmail, {
            id: change.doc.id,
            ...data,
            requestDate: data.requestDate?.toDate(),
            reviewedAt: data.reviewedAt?.toDate()
          })
        }
      }
    })
  })

  // Store the unsubscribe function
  const unsubscribe = () => {
    userUnsubscribe()
    admissionUnsubscribe()
    changeRequestUnsubscribe()
    activeListeners.delete(listenerKey)
    syncCallbacks.delete(listenerKey)
  }

  activeListeners.set(listenerKey, unsubscribe)
  syncCallbacks.set(listenerKey, callbacks)

  return unsubscribe
}

/**
 * Subscribe to admin real-time updates (for admin panel)
 */
export const subscribeToAdminRealTimeUpdates = (
  callbacks: RealTimeSyncCallbacks
): (() => void) => {
  const listenerKey = 'admin_global'
  
  // If already listening, update callbacks
  if (activeListeners.has(listenerKey)) {
    syncCallbacks.set(listenerKey, callbacks)
    return () => unsubscribeFromAdminRealTimeUpdates()
  }

  // Subscribe to all admission forms
  const admissionFormsRef = collection(db, 'admissionForms')
  const admissionQuery = query(admissionFormsRef, orderBy('submittedAt', 'desc'))
  
  const admissionUnsubscribe = onSnapshot(admissionQuery, (snapshot) => {
    snapshot.docChanges().forEach((change) => {
      const data = change.doc.data()
      const adminCallbacks = syncCallbacks.get(listenerKey)
      
      if (adminCallbacks?.onAdminAction) {
        adminCallbacks.onAdminAction({
          type: 'admission_form_update',
          formId: change.doc.id,
          changeType: change.type,
          data: {
            ...data,
            submittedAt: data.submittedAt?.toDate(),
            reviewedAt: data.reviewedAt?.toDate()
          }
        })
      }
    })
  })

  // Subscribe to all change requests
  const changeRequestsRef = collection(db, 'changeRequests')
  const changeRequestQuery = query(changeRequestsRef, orderBy('requestDate', 'desc'))
  
  const changeRequestUnsubscribe = onSnapshot(changeRequestQuery, (snapshot) => {
    snapshot.docChanges().forEach((change) => {
      const data = change.doc.data()
      const adminCallbacks = syncCallbacks.get(listenerKey)
      
      if (adminCallbacks?.onAdminAction) {
        adminCallbacks.onAdminAction({
          type: 'change_request_update',
          requestId: change.doc.id,
          changeType: change.type,
          data: {
            ...data,
            requestDate: data.requestDate?.toDate(),
            reviewedAt: data.reviewedAt?.toDate()
          }
        })
      }
    })
  })

  // Store the unsubscribe function
  const unsubscribe = () => {
    admissionUnsubscribe()
    changeRequestUnsubscribe()
    activeListeners.delete(listenerKey)
    syncCallbacks.delete(listenerKey)
  }

  activeListeners.set(listenerKey, unsubscribe)
  syncCallbacks.set(listenerKey, callbacks)

  return unsubscribe
}

/**
 * Update user data with real-time synchronization
 */
export const updateUserDataWithSync = async (
  uid: string, 
  updates: Partial<UserData>,
  adminEmail?: string
): Promise<void> => {
  try {
    const batch = writeBatch(db)
    
    // Update user document
    const userRef = doc(db, 'users', uid)
    batch.update(userRef, {
      ...updates,
      updatedAt: serverTimestamp()
    })

    // Create sync event for tracking
    const syncEventRef = doc(collection(db, 'syncEvents'))
    batch.set(syncEventRef, {
      type: 'user_data_updated',
      userId: uid,
      userEmail: updates.email || '',
      timestamp: serverTimestamp(),
      data: updates,
      adminEmail: adminEmail || null
    })

    await batch.commit()
  } catch (error) {
    console.error('Error updating user data with sync:', error)
    throw error
  }
}

/**
 * Update admission status with real-time synchronization
 */
export const updateAdmissionStatusWithSync = async (
  formId: string,
  status: 'pending' | 'approved' | 'rejected',
  adminEmail: string,
  userEmail: string,
  additionalData?: any
): Promise<void> => {
  try {
    const batch = writeBatch(db)
    
    // Update admission form
    const formRef = doc(db, 'admissionForms', formId)
    batch.update(formRef, {
      status,
      reviewedAt: serverTimestamp(),
      reviewedBy: adminEmail,
      ...additionalData
    })

    // Update user's admission status
    const usersRef = collection(db, 'users')
    const userQuery = query(usersRef, where('email', '==', userEmail))
    const userDocs = await getDocs(userQuery)
    
    if (!userDocs.empty) {
      const userRef = userDocs.docs[0].ref
      batch.update(userRef, {
        admissionStatus: status,
        updatedAt: serverTimestamp(),
        ...additionalData
      })
    }

    // Create sync event
    const syncEventRef = doc(collection(db, 'syncEvents'))
    batch.set(syncEventRef, {
      type: 'admission_status_changed',
      userId: userDocs.docs[0]?.id || '',
      userEmail,
      timestamp: serverTimestamp(),
      data: { status, formId, ...additionalData },
      adminEmail
    })

    await batch.commit()
  } catch (error) {
    console.error('Error updating admission status with sync:', error)
    throw error
  }
}

/**
 * Update change request with real-time synchronization
 */
export const updateChangeRequestWithSync = async (
  requestId: string,
  status: 'pending' | 'approved' | 'rejected',
  adminEmail: string,
  userEmail: string,
  additionalData?: any
): Promise<void> => {
  try {
    console.log('Updating change request with sync:', { requestId, status, adminEmail, userEmail, additionalData })
    const batch = writeBatch(db)
    let userId = ''
    
    // Update change request
    const requestRef = doc(db, 'changeRequests', requestId)
    batch.update(requestRef, {
      status,
      reviewedAt: serverTimestamp(),
      reviewedBy: adminEmail,
      ...additionalData
    })

    // If approved, update user data
    if (status === 'approved' && additionalData?.field && additionalData?.newValue) {
      const usersRef = collection(db, 'users')
      const userQuery = query(usersRef, where('email', '==', userEmail))
      const userDocs = await getDocs(userQuery)
      
      if (!userDocs.empty) {
        const userRef = userDocs.docs[0].ref
        userId = userDocs.docs[0].id
        
        const fieldMap: { [key: string]: string } = {
          'Student Name': 'studentName',
          'Class': 'studentClass',
          'School': 'schoolName',
          'Pickup Location': 'pickupLocation',
          'Drop Location': 'dropLocation',
          'Guardian Name': 'guardianName',
          'Guardian Phone': 'guardianPhone',
          'Guardian Email': 'guardianEmail',
          'Alternate Phone': 'alternatePhone',
          'Emergency Contact': 'emergencyContact'
        }
        
        const fieldToUpdate = fieldMap[additionalData.field]
        if (fieldToUpdate) {
          batch.update(userRef, {
            [fieldToUpdate]: additionalData.newValue,
            updatedAt: serverTimestamp()
          })
        }
      }
    } else {
      // Get user ID for sync event even if not updating user data
      const usersRef = collection(db, 'users')
      const userQuery = query(usersRef, where('email', '==', userEmail))
      const userDocs = await getDocs(userQuery)
      if (!userDocs.empty) {
        userId = userDocs.docs[0].id
      }
    }

    // Create sync event
    const syncEventRef = doc(collection(db, 'syncEvents'))
    batch.set(syncEventRef, {
      type: status === 'approved' ? 'change_request_approved' : 
            status === 'rejected' ? 'change_request_rejected' : 'change_request_submitted',
      userId: userId,
      userEmail,
      timestamp: serverTimestamp(),
      data: { status, requestId, ...additionalData },
      adminEmail
    })

    await batch.commit()
    console.log('Change request updated successfully:', { requestId, status, userId })
  } catch (error) {
    console.error('Error updating change request with sync:', error)
    throw error
  }
}

/**
 * Unsubscribe from user real-time updates
 */
export const unsubscribeFromUserRealTimeUpdates = (userEmail: string): void => {
  const listenerKey = `user_${userEmail}`
  const unsubscribe = activeListeners.get(listenerKey)
  if (unsubscribe) {
    unsubscribe()
  }
}

/**
 * Unsubscribe from admin real-time updates
 */
export const unsubscribeFromAdminRealTimeUpdates = (): void => {
  const listenerKey = 'admin_global'
  const unsubscribe = activeListeners.get(listenerKey)
  if (unsubscribe) {
    unsubscribe()
  }
}

/**
 * Clean up all active listeners
 */
export const cleanupAllListeners = (): void => {
  activeListeners.forEach((unsubscribe) => {
    unsubscribe()
  })
  activeListeners.clear()
  syncCallbacks.clear()
} 