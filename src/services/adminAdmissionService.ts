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
  writeBatch
} from 'firebase/firestore'
import { db } from '../firebase/config'
import { AdmissionForm, ChangeRequest, AdminStats } from '../types/admin'

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
    const batch = writeBatch(db)
    
    // Update admission form
    const formRef = doc(db, 'admissionForms', formId)
    batch.update(formRef, {
      status: 'approved',
      reviewedAt: serverTimestamp(),
      reviewedBy: adminEmail,
      monthlyAmount,
      adminResponse: adminResponse || 'Approved'
    })
    
    // Get the form data to update user profile
    const formDoc = await getDocs(query(collection(db, 'admissionForms'), where('__name__', '==', formId)))
    if (!formDoc.empty) {
      const formData = formDoc.docs[0].data()
      
      // Update user's admission status and data
      const userQuery = query(collection(db, 'users'), where('email', '==', formData.userEmail))
      const userDocs = await getDocs(userQuery)
      
      if (!userDocs.empty) {
        const userRef = userDocs.docs[0].ref
        batch.update(userRef, {
          admissionStatus: 'approved',
          monthlyAmount,
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
        })
      }
    }
    
    await batch.commit()
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
    const batch = writeBatch(db)
    
    // Update admission form
    const formRef = doc(db, 'admissionForms', formId)
    batch.update(formRef, {
      status: 'rejected',
      reviewedAt: serverTimestamp(),
      reviewedBy: adminEmail,
      rejectionReason
    })
    
    // Get the form data to update user profile
    const formDoc = await getDocs(query(collection(db, 'admissionForms'), where('__name__', '==', formId)))
    if (!formDoc.empty) {
      const formData = formDoc.docs[0].data()
      
      // Update user's admission status
      const userQuery = query(collection(db, 'users'), where('email', '==', formData.userEmail))
      const userDocs = await getDocs(userQuery)
      
      if (!userDocs.empty) {
        const userRef = userDocs.docs[0].ref
        batch.update(userRef, {
          admissionStatus: 'rejected'
        })
      }
    }
    
    await batch.commit()
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
    const batch = writeBatch(db)
    
    // Update change request
    const requestRef = doc(db, 'changeRequests', requestId)
    batch.update(requestRef, {
      status: 'approved',
      reviewedAt: serverTimestamp(),
      reviewedBy: adminEmail,
      adminResponse: adminResponse || 'Approved'
    })
    
    // Get the request data to update user profile
    const requestDoc = await getDocs(query(collection(db, 'changeRequests'), where('__name__', '==', requestId)))
    if (!requestDoc.empty) {
      const requestData = requestDoc.docs[0].data()
      
      // Update user's data
      const userQuery = query(collection(db, 'users'), where('email', '==', requestData.userEmail))
      const userDocs = await getDocs(userQuery)
      
      if (!userDocs.empty) {
        const userRef = userDocs.docs[0].ref
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
        
        const fieldToUpdate = fieldMap[requestData.field]
        if (fieldToUpdate) {
          batch.update(userRef, {
            [fieldToUpdate]: requestData.newValue
          })
        }
      }
    }
    
    await batch.commit()
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
    const requestRef = doc(db, 'changeRequests', requestId)
    await updateDoc(requestRef, {
      status: 'rejected',
      reviewedAt: serverTimestamp(),
      reviewedBy: adminEmail,
      rejectionReason
    })
    return true
  } catch (error) {
    console.error('Error rejecting change request:', error)
    throw error
  }
}

// Real-time listeners
export const subscribeToAdmissionForms = (callback: (forms: AdmissionForm[]) => void) => {
  const admissionFormsRef = collection(db, 'admissionForms')
  const q = query(admissionFormsRef, orderBy('submittedAt', 'desc'))
  
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
  const q = query(changeRequestsRef, orderBy('requestDate', 'desc'))
  
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