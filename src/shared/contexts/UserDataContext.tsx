import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useAuth } from './AuthContext'
import { subscribeToUserData, updateUserData, getUserDataByEmail, UserData } from '../services/userDataService'
import { 
  subscribeToUserRealTimeUpdates, 
  updateUserDataWithSync, 
  unsubscribeFromUserRealTimeUpdates,
  RealTimeSyncCallbacks 
} from '../services/realTimeSyncService'

interface Student {
  id: string
  name: string
  class: string
  school: string
  pickupLocation: string
  dropLocation: string
  monthlyAmount: number
  guardianName: string
  guardianPhone: string
  alternatePhone: string
  guardianEmail: string
  admissionDate: Date
  status: 'active' | 'inactive' | 'pending'
  admissionStatus: 'none' | 'pending' | 'approved' | 'rejected'
  emergencyContact?: string
  medicalConditions?: string
  specialRequirements?: string
}

interface UserDataContextType {
  student: Student
  loading: boolean
  updateStudent: (updates: Partial<Student>) => void
  updateEditableData: (updates: Partial<Pick<Student, 'guardianName' | 'guardianPhone' | 'alternatePhone' | 'guardianEmail'>>) => void
  updateAdmissionData: (updates: Partial<Pick<Student, 'name' | 'class' | 'school' | 'pickupLocation' | 'dropLocation' | 'monthlyAmount'>>) => void
  refreshUserData: () => void
}

const UserDataContext = createContext<UserDataContextType | undefined>(undefined)

export const useUserData = () => {
  const context = useContext(UserDataContext)
  if (context === undefined) {
    throw new Error('useUserData must be used within a UserDataProvider')
  }
  return context
}

interface UserDataProviderProps {
  children: ReactNode
}

export const UserDataProvider: React.FC<UserDataProviderProps> = ({ children }) => {
  const { currentUser } = useAuth()
  const [student, setStudent] = useState<Student>({
    id: '',
    name: '',
    class: '',
    school: '',
    pickupLocation: '',
    dropLocation: '',
    monthlyAmount: 0,
    guardianName: '',
    guardianPhone: '',
    alternatePhone: '',
    guardianEmail: '',
    admissionDate: new Date(),
    status: 'pending',
    admissionStatus: 'none'
  })
  const [loading, setLoading] = useState(true)

  // Convert Firebase UserData to Student interface
  const convertUserDataToStudent = (userData: UserData): Student => {
    return {
      id: userData.uid,
      name: userData.studentName || '',
      class: userData.studentClass || '',
      school: userData.schoolName || '',
      pickupLocation: userData.pickupLocation || '',
      dropLocation: userData.dropLocation || '',
      monthlyAmount: userData.monthlyAmount || 0,
      guardianName: userData.guardianName || '',
      guardianPhone: userData.guardianPhone || '',
      alternatePhone: userData.alternatePhone || '',
      guardianEmail: userData.guardianEmail || '',
      admissionDate: userData.createdAt || new Date(),
      status: userData.admissionStatus === 'approved' ? 'active' : 'pending',
      admissionStatus: userData.admissionStatus || 'none',
      emergencyContact: userData.emergencyContact,
      medicalConditions: userData.medicalConditions,
      specialRequirements: userData.specialRequirements
    }
  }

  // Subscribe to user data changes with real-time sync
  useEffect(() => {
    if (!currentUser?.email) {
      setLoading(false)
      return
    }

    setLoading(true)
    
    // Set up real-time sync callbacks
    const syncCallbacks: RealTimeSyncCallbacks = {
      onUserDataUpdate: (userData) => {
        setStudent(convertUserDataToStudent(userData))
        setLoading(false)
      },
      onAdmissionStatusChange: (email, status) => {
        setStudent(prev => ({ ...prev, admissionStatus: status as any }))
      },
      onChangeRequestUpdate: (email, requestData) => {
        // Handle change request updates if needed
        console.log('Change request update:', requestData)
      }
    }

    // Subscribe to real-time updates
    const unsubscribe = subscribeToUserRealTimeUpdates(currentUser.email, syncCallbacks)

    // Also subscribe to legacy user data for initial load
    const legacyUnsubscribe = subscribeToUserData(currentUser.email, (userData) => {
      if (userData) {
        setStudent(convertUserDataToStudent(userData))
      } else {
        // Set default values if no user data found
        setStudent({
          id: '',
          name: '',
          class: '',
          school: '',
          pickupLocation: '',
          dropLocation: '',
          monthlyAmount: 0,
          guardianName: '',
          guardianPhone: '',
          alternatePhone: '',
          guardianEmail: currentUser.email || '',
          admissionDate: new Date(),
          status: 'pending',
          admissionStatus: 'none'
        })
      }
      setLoading(false)
    })

    return () => {
      unsubscribe()
      legacyUnsubscribe()
    }
  }, [currentUser?.email])

  const updateStudent = async (updates: Partial<Student>) => {
    if (!currentUser?.email) return

    try {
      // Update local state immediately for UI responsiveness
      setStudent(prev => ({ ...prev, ...updates }))
      
      // Update Firebase with real-time sync
      const userData = await getUserDataByEmail(currentUser.email)
      if (userData) {
        const firebaseUpdates: Partial<UserData> = {}
        
        // Map Student fields to UserData fields
        if (updates.name !== undefined) firebaseUpdates.studentName = updates.name
        if (updates.class !== undefined) firebaseUpdates.studentClass = updates.class
        if (updates.school !== undefined) firebaseUpdates.schoolName = updates.school
        if (updates.pickupLocation !== undefined) firebaseUpdates.pickupLocation = updates.pickupLocation
        if (updates.dropLocation !== undefined) firebaseUpdates.dropLocation = updates.dropLocation
        if (updates.monthlyAmount !== undefined) firebaseUpdates.monthlyAmount = updates.monthlyAmount
        if (updates.guardianName !== undefined) firebaseUpdates.guardianName = updates.guardianName
        if (updates.guardianPhone !== undefined) firebaseUpdates.guardianPhone = updates.guardianPhone
        if (updates.alternatePhone !== undefined) firebaseUpdates.alternatePhone = updates.alternatePhone
        if (updates.guardianEmail !== undefined) firebaseUpdates.guardianEmail = updates.guardianEmail
        if (updates.admissionStatus !== undefined) firebaseUpdates.admissionStatus = updates.admissionStatus
        if (updates.emergencyContact !== undefined) firebaseUpdates.emergencyContact = updates.emergencyContact
        if (updates.medicalConditions !== undefined) firebaseUpdates.medicalConditions = updates.medicalConditions
        if (updates.specialRequirements !== undefined) firebaseUpdates.specialRequirements = updates.specialRequirements

        // Use the new sync service for real-time updates
        await updateUserDataWithSync(userData.uid, firebaseUpdates)
      }
    } catch (error) {
      console.error('Error updating student data:', error)
      // Revert local state on error
      setStudent(prev => ({ ...prev }))
    }
  }

  const updateEditableData = (updates: Partial<Pick<Student, 'guardianName' | 'guardianPhone' | 'alternatePhone' | 'guardianEmail'>>) => {
    updateStudent(updates)
  }

  const updateAdmissionData = (updates: Partial<Pick<Student, 'name' | 'class' | 'school' | 'pickupLocation' | 'dropLocation' | 'monthlyAmount'>>) => {
    updateStudent(updates)
  }

  const refreshUserData = () => {
    // This will trigger the useEffect to reload data
    setLoading(true)
  }

  const value: UserDataContextType = {
    student,
    loading,
    updateStudent,
    updateEditableData,
    updateAdmissionData,
    refreshUserData
  }

  return (
    <UserDataContext.Provider value={value}>
      {children}
    </UserDataContext.Provider>
  )
} 