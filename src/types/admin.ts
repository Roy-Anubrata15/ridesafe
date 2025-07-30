export interface AdmissionForm {
  id: string
  userEmail: string
  studentName: string
  studentClass: string
  schoolName: string
  pickupLocation: string
  dropLocation: string
  guardianName: string
  guardianPhone: string
  guardianEmail: string
  alternatePhone: string
  emergencyContact: string
  medicalConditions: string
  specialRequirements: string
  status: 'pending' | 'approved' | 'rejected'
  submittedAt: Date
  reviewedAt?: Date
  reviewedBy?: string
  adminResponse?: string
  monthlyAmount?: number
  rejectionReason?: string
}

export interface ChangeRequest {
  id: string
  userEmail: string
  field: string
  oldValue: string
  newValue: string
  status: 'pending' | 'approved' | 'rejected'
  requestDate: Date
  reviewedAt?: Date
  reviewedBy?: string
  adminResponse?: string
  rejectionReason?: string
}

export interface AdminStats {
  totalUsers: number
  pendingAdmissions: number
  approvedAdmissions: number
  rejectedAdmissions: number
  pendingChangeRequests: number
  totalRevenue: number
} 