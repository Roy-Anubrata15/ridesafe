import React, { useState, useEffect } from 'react'
import { User, Shield, Car, ChevronDown } from 'lucide-react'
import { getUserDocumentsByEmail } from '../services/authService'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'

interface UserData {
  uid: string;
  email: string;
  role: 'user' | 'admin' | 'driver';
  name: string;
  phone: string;
  createdAt: Date;
  studentName?: string;
  licenseNumber?: string;
  vehicleNumber?: string;
  experience?: string;
  adminCode?: string;
}

interface RoleSelectorProps {
  onRoleChange: (role: UserData) => void;
  currentRole?: UserData;
}

const RoleSelector: React.FC<RoleSelectorProps> = ({ onRoleChange, currentRole }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [userRoles, setUserRoles] = useState<UserData[]>([])
  const [loading, setLoading] = useState(true)
  const { currentUser } = useAuth()

  useEffect(() => {
    const loadUserRoles = async () => {
      if (currentUser?.email) {
        try {
          const roles = await getUserDocumentsByEmail(currentUser.email)
          setUserRoles(roles)
          setLoading(false)
        } catch (error) {
          console.error('Error loading user roles:', error)
          toast.error('Failed to load user roles')
          setLoading(false)
        }
      }
    }

    loadUserRoles()
  }, [currentUser])

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'user':
        return <User className="w-4 h-4" />
      case 'admin':
        return <Shield className="w-4 h-4" />
      case 'driver':
        return <Car className="w-4 h-4" />
      default:
        return <User className="w-4 h-4" />
    }
  }

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'user':
        return 'User'
      case 'admin':
        return 'Admin'
      case 'driver':
        return 'Driver'
      default:
        return role
    }
  }

  const getRoleDetails = (userData: UserData) => {
    switch (userData.role) {
      case 'user':
        return userData.studentName ? `Student: ${userData.studentName}` : 'User'
      case 'admin':
        return 'Administrator'
      case 'driver':
        return userData.vehicleNumber ? `Vehicle: ${userData.vehicleNumber}` : 'Driver'
      default:
        return userData.role
    }
  }

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-10 bg-gray-200 rounded-lg"></div>
      </div>
    )
  }

  // Only show role selector if user has roles
  if (userRoles.length === 0) {
    return null
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500"
      >
        <div className="flex items-center space-x-2">
          {currentRole && getRoleIcon(currentRole.role)}
          <span>{currentRole ? getRoleDisplayName(currentRole.role) : 'Select Role'}</span>
        </div>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1 w-64 bg-white border border-gray-300 rounded-lg shadow-lg z-10">
          <div className="py-1">
            {userRoles.map((role, index) => (
              <button
                key={`${role.uid}_${role.role}`}
                onClick={() => {
                  onRoleChange(role)
                  setIsOpen(false)
                }}
                className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center space-x-2 ${
                  currentRole?.role === role.role ? 'bg-primary-50 text-primary-700' : 'text-gray-700'
                }`}
              >
                {getRoleIcon(role.role)}
                <div className="flex flex-col">
                  <span className="font-medium">{getRoleDisplayName(role.role)}</span>
                  <span className="text-xs text-gray-500">{getRoleDetails(role)}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default RoleSelector 