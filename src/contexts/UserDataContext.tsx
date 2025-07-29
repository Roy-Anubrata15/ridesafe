import React, { createContext, useContext, useState, ReactNode } from 'react'

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
}

interface UserDataContextType {
  student: Student
  updateStudent: (updates: Partial<Student>) => void
  updateEditableData: (updates: Partial<Pick<Student, 'guardianName' | 'guardianPhone' | 'alternatePhone' | 'guardianEmail'>>) => void
  updateAdmissionData: (updates: Partial<Pick<Student, 'name' | 'class' | 'school' | 'pickupLocation' | 'dropLocation' | 'monthlyAmount'>>) => void
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
  // Initial mock data - replace with real data from Firebase
  const [student, setStudent] = useState<Student>({
    id: '1',
    name: 'John Doe',
    class: 'Class 5A',
    school: 'St. Mary\'s School',
    pickupLocation: '123 Main Street, City',
    dropLocation: '456 School Road, City',
    monthlyAmount: 2500,
    guardianName: 'Jane Doe',
    guardianPhone: '+91 98765 43210',
    alternatePhone: '+91 98765 43211',
    guardianEmail: 'jane.doe@email.com',
    admissionDate: new Date('2024-01-15'),
    status: 'active',
    admissionStatus: 'none'
  })

  const updateStudent = (updates: Partial<Student>) => {
    setStudent(prev => ({ ...prev, ...updates }))
  }

  const updateEditableData = (updates: Partial<Pick<Student, 'guardianName' | 'guardianPhone' | 'alternatePhone' | 'guardianEmail'>>) => {
    setStudent(prev => ({ ...prev, ...updates }))
  }

  const updateAdmissionData = (updates: Partial<Pick<Student, 'name' | 'class' | 'school' | 'pickupLocation' | 'dropLocation' | 'monthlyAmount'>>) => {
    setStudent(prev => ({ ...prev, ...updates }))
  }

  const value: UserDataContextType = {
    student,
    updateStudent,
    updateEditableData,
    updateAdmissionData
  }

  return (
    <UserDataContext.Provider value={value}>
      {children}
    </UserDataContext.Provider>
  )
} 