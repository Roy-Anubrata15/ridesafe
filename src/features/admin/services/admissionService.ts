import { 
  collection, 
  query, 
  where, 
  getDocs, 
  doc, 
  updateDoc, 
  addDoc, 
  serverTimestamp, 
  orderBy,
  onSnapshot,
  writeBatch,
  limit
} from 'firebase/firestore'
import { db } from '../../../shared/services/firebase/config'
import { AdmissionForm, ChangeRequest, AdminStats } from '../types/admin'
import { 
  updateAdmissionStatusWithSync, 
  updateChangeRequestWithSync 
} from '../../../shared/services/realTimeSyncService'

// Real Firebase operations for admission forms
export const getAdmissionForms = async (): Promise<AdmissionForm[]> => {
  try {
    const admissionFormsRef = collection(db, 'admissionForms')
    const q = query(admissionFormsRef, orderBy('submittedAt', 'desc'))
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data(),
      submittedAt: doc.data().submittedAt?.toDate() || new Date(),
      reviewedAt: doc.data().reviewedAt?.toDate()
    })) as AdmissionForm[]
  } catch (error) {
    console.error('Error fetching admission forms:', error)
    throw error
  }
}

export const getAdmissionFormsByStatus = async (status: 'pending' | 'approved' | 'rejected'): Promise<AdmissionForm[]> => {
  try {
    const admissionFormsRef = collection(db, 'admissionForms')
    const q = query(admissionFormsRef, where('status', '==', status), orderBy('submittedAt', 'desc'))
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data(),
      submittedAt: doc.data().submittedAt?.toDate() || new Date(),
      reviewedAt: doc.data().reviewedAt?.toDate()
    })) as AdmissionForm[]
  } catch (error) {
    console.error('Error fetching admission forms by status:', error)
    throw error
  }
}

export const submitAdmissionForm = async (formData: Omit<AdmissionForm, 'id' | 'submittedAt' | 'status'>): Promise<string> => {
  try {
    const admissionFormsRef = collection(db, 'admissionForms')
    const docRef = await addDoc(admissionFormsRef, {
      ...formData,
      status: 'pending',
      submittedAt: serverTimestamp()
    })
    return docRef.id
  } catch (error) {
    console.error('Error submitting admission form:', error)
    throw error
  }
}

export const approveAdmissionForm = async (
  formId: string, 
  adminEmail: string, 
  monthlyAmount: number, 
  adminResponse?: string
): Promise<boolean> => {
  try {
    // Get the form data first
    const formDoc = await getDocs(query(collection(db, 'admissionForms'), where('__name__', '==', formId)))
    if (formDoc.empty) {
      throw new Error('Admission form not found')
    }
    
    const formData = formDoc.docs[0].data()
    
    // Use the new sync service for real-time updates
    await updateAdmissionStatusWithSync(
      formId,
      'approved',
      adminEmail,
      formData.userEmail,
      {
        monthlyAmount,
        adminResponse: adminResponse || 'Approved',
        studentName: formData.studentName,
        studentClass: formData.studentClass,
        schoolName: formData.schoolName,
        pickupLocation: formData.pickupLocation,
        dropLocation: formData.dropLocation,
        guardianName: formData.guardianName,
        guardianPhone: formData.guardianPhone,
        guardianEmail: formData.guardianEmail,
        alternatePhone: formData.alternatePhone,
        emergencyContact: formData.emergencyContact,
        medicalConditions: formData.medicalConditions,
        specialRequirements: formData.specialRequirements
      }
    )
    
    return true
  } catch (error) {
    console.error('Error approving admission form:', error)
    throw error
  }
}

export const rejectAdmissionForm = async (
  formId: string, 
  adminEmail: string, 
  rejectionReason: string
): Promise<boolean> => {
  try {
    // Get the form data first
    const formDoc = await getDocs(query(collection(db, 'admissionForms'), where('__name__', '==', formId)))
    if (formDoc.empty) {
      throw new Error('Admission form not found')
    }
    
    const formData = formDoc.docs[0].data()
    
    // Use the new sync service for real-time updates
    await updateAdmissionStatusWithSync(
      formId,
      'rejected',
      adminEmail,
      formData.userEmail,
      {
        adminResponse: rejectionReason
      }
    )
    
    return true
  } catch (error) {
    console.error('Error rejecting admission form:', error)
    throw error
  }
}

// Real Firebase operations for change requests
export const getChangeRequests = async (): Promise<ChangeRequest[]> => {
  try {
    const changeRequestsRef = collection(db, 'changeRequests')
    const q = query(changeRequestsRef, orderBy('requestDate', 'desc'))
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data(),
      requestDate: doc.data().requestDate?.toDate() || new Date(),
      reviewedAt: doc.data().reviewedAt?.toDate()
    })) as ChangeRequest[]
  } catch (error) {
    console.error('Error fetching change requests:', error)
    throw error
  }
}

export const submitChangeRequest = async (requestData: Omit<ChangeRequest, 'id' | 'requestDate' | 'status'>): Promise<string> => {
  try {
    const changeRequestsRef = collection(db, 'changeRequests')
    const docRef = await addDoc(changeRequestsRef, {
      ...requestData,
      status: 'pending',
      requestDate: serverTimestamp()
    })
    return docRef.id
  } catch (error) {
    console.error('Error submitting change request:', error)
    throw error
  }
}

export const approveChangeRequest = async (
  requestId: string, 
  adminEmail: string, 
  adminResponse?: string
): Promise<boolean> => {
  try {
    console.log('Approving change request:', { requestId, adminEmail, adminResponse })
    // Get the request data first
    const requestDoc = await getDocs(query(collection(db, 'changeRequests'), where('__name__', '==', requestId)))
    if (requestDoc.empty) {
      throw new Error('Change request not found')
    }
    
    const requestData = requestDoc.docs[0].data()
    console.log('Request data found:', requestData)
    
    // Use the new sync service for real-time updates
    await updateChangeRequestWithSync(
      requestId,
      'approved',
      adminEmail,
      requestData.userEmail,
      {
        adminResponse: adminResponse || 'Approved',
        field: requestData.field,
        newValue: requestData.newValue
      }
    )
    
    console.log('Change request approved successfully')
    return true
  } catch (error) {
    console.error('Error approving change request:', error)
    throw error
  }
}

export const rejectChangeRequest = async (
  requestId: string, 
  adminEmail: string, 
  rejectionReason: string
): Promise<boolean> => {
  try {
    console.log('Rejecting change request:', { requestId, adminEmail, rejectionReason })
    // Get the request data first
    const requestDoc = await getDocs(query(collection(db, 'changeRequests'), where('__name__', '==', requestId)))
    if (requestDoc.empty) {
      throw new Error('Change request not found')
    }
    
    const requestData = requestDoc.docs[0].data()
    console.log('Request data found:', requestData)
    
    // Use the new sync service for real-time updates
    await updateChangeRequestWithSync(
      requestId,
      'rejected',
      adminEmail,
      requestData.userEmail,
      {
        adminResponse: rejectionReason
      }
    )
    
    console.log('Change request rejected successfully')
    return true
  } catch (error) {
    console.error('Error rejecting change request:', error)
    throw error
  }
}

// Real-time listeners with limit to reduce quota usage
export const subscribeToAdmissionForms = (callback: (forms: AdmissionForm[]) => void) => {
  const admissionFormsRef = collection(db, 'admissionForms')
  const q = query(admissionFormsRef, orderBy('submittedAt', 'desc'), limit(50))
  
  return onSnapshot(q, (snapshot) => {
    const forms = snapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data(),
      submittedAt: doc.data().submittedAt?.toDate() || new Date(),
      reviewedAt: doc.data().reviewedAt?.toDate()
    })) as AdmissionForm[]
    callback(forms)
  })
}

export const subscribeToChangeRequests = (callback: (requests: ChangeRequest[]) => void) => {
  const changeRequestsRef = collection(db, 'changeRequests')
  const q = query(changeRequestsRef, orderBy('requestDate', 'desc'), limit(50))
  
  return onSnapshot(q, (snapshot) => {
    const requests = snapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data(),
      requestDate: doc.data().requestDate?.toDate() || new Date(),
      reviewedAt: doc.data().reviewedAt?.toDate()
    })) as ChangeRequest[]
    callback(requests)
  })
}

// Admin stats calculation
export const getAdminStats = async (): Promise<AdminStats> => {
  try {
    const [forms, changeRequests] = await Promise.all([
      getAdmissionForms(),
      getChangeRequests()
    ])
    
    return {
      totalUsers: forms.length,
      pendingAdmissions: forms.filter(f => f.status === 'pending').length,
      approvedAdmissions: forms.filter(f => f.status === 'approved').length,
      rejectedAdmissions: forms.filter(f => f.status === 'rejected').length,
      pendingChangeRequests: changeRequests.filter(r => r.status === 'pending').length,
      totalRevenue: forms
        .filter(f => f.status === 'approved' && f.monthlyAmount)
        .reduce((sum, form) => sum + (form.monthlyAmount || 0), 0)
    }
  } catch (error) {
    console.error('Error fetching admin stats:', error)
    throw error
  }
} 