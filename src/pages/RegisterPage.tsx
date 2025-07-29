import React, { useState } from 'react'
import { Bus, User, Shield, Phone, Mail, Lock, Eye, EyeOff, MapPin, Calendar, BookOpen, Car } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { createUserDocument, checkEmailExistsForRole, cleanupUnverifiedUsers } from '../services/authService'
import { validateAdminCode, markAdminCodeAsUsed } from '../services/adminService'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { sendEmailVerification } from 'firebase/auth'

type RegisterType = 'user' | 'admin' | 'driver'

interface FormData {
  // Common fields
  email: string;
  password: string;
  confirmPassword: string;
  phone: string;
  name: string;
  
  // User specific (simplified)
  studentName: string;
  
  // Driver specific
  licenseNumber: string;
  vehicleNumber: string;
  experience: string;
  
  // Admin specific
  adminCode: string;
}

const RegisterPage = () => {
  const [activeTab, setActiveTab] = useState<RegisterType>('user')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    name: '',
    studentName: '',
    licenseNumber: '',
    vehicleNumber: '',
    experience: '',
    adminCode: ''
  })

  const { register, sendVerificationEmail } = useAuth()
  const navigate = useNavigate()

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const validateForm = (): string | null => {
    // Check if passwords match
    if (formData.password !== formData.confirmPassword) {
      return 'Passwords do not match'
    }

    // Check password strength
    if (formData.password.length < 6) {
      return 'Password must be at least 6 characters long'
    }

    // Check required fields based on user type
    if (!formData.name || !formData.email || !formData.phone) {
      return 'Please fill in all required fields'
    }

    if (activeTab === 'user' && !formData.studentName) {
      return 'Please enter student name'
    }

    if (activeTab === 'admin' && !formData.adminCode) {
      return 'Please enter admin code'
    }

    if (activeTab === 'driver' && (!formData.licenseNumber || !formData.vehicleNumber || !formData.experience)) {
      return 'Please fill in all driver details'
    }

    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Validate form
      const validationError = validateForm()
      if (validationError) {
        toast.error(validationError)
        return
      }

      // Check if email already exists for this specific role
      const emailExistsForRole = await checkEmailExistsForRole(formData.email, activeTab)
      if (emailExistsForRole) {
        toast.error(`An account with this email already exists for ${activeTab} role`)
        return
      }

      // Clean up any unverified accounts with this email before registration
      try {
        await cleanupUnverifiedUsers(formData.email)
        console.log('Cleaned up unverified accounts for:', formData.email)
      } catch (cleanupError) {
        console.warn('Failed to cleanup unverified accounts:', cleanupError)
        // Continue with registration even if cleanup fails
      }

      // Validate admin code if registering as admin
      if (activeTab === 'admin') {
        console.log('Validating admin code for registration:', formData.adminCode);
        const isValidAdminCode = await validateAdminCode(formData.adminCode)
        console.log('Admin code validation result:', isValidAdminCode);
        if (!isValidAdminCode) {
          toast.error('Invalid admin code. Please enter a valid admin code.')
          return
        }
      }

      // Create Firebase auth account
      const userCredential = await register(formData.email, formData.password)
      const user = userCredential.user

      // Prepare user data for Firestore
      const userData = {
        role: activeTab,
        name: formData.name,
        phone: formData.phone,
        emailVerified: false, // Mark as unverified initially
        ...(activeTab === 'user' && { studentName: formData.studentName }),
        ...(activeTab === 'admin' && { adminCode: formData.adminCode }),
        ...(activeTab === 'driver' && {
          licenseNumber: formData.licenseNumber,
          vehicleNumber: formData.vehicleNumber,
          experience: formData.experience
        })
      }

      // Save user data to Firestore
      await createUserDocument(user, userData)

      // Mark admin code as used if registering as admin
      if (activeTab === 'admin') {
        await markAdminCodeAsUsed(formData.adminCode, user.uid)
      }

      // Send verification email
      await sendEmailVerification(user)
      
      toast.success('Account created successfully! Please check your email to verify your account.')
      navigate('/verify-email')
    } catch (error: any) {
      console.error('Registration error:', error)
      
      // Handle specific Firebase auth errors
      let errorMessage = 'Registration failed. Please try again.'
      
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'An account with this email already exists.'
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Please enter a valid email address.'
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password should be at least 6 characters long.'
      } else if (error.code === 'auth/network-request-failed') {
        errorMessage = 'Network error. Please check your connection.'
      }
      
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const tabs = [
    { id: 'user' as RegisterType, label: 'User', icon: User },
    { id: 'admin' as RegisterType, label: 'Admin', icon: Shield },
    { id: 'driver' as RegisterType, label: 'Driver', icon: Car }
  ]

  const renderUserForm = () => (
    <div className="space-y-4">
      {/* Guardian Information */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Guardian Name *
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => handleInputChange('name', e.target.value)}
          placeholder="Enter guardian name"
          className="input-field"
          required
          disabled={loading}
        />
      </div>

      {/* Student Information */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Student Name *
        </label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            value={formData.studentName}
            onChange={(e) => handleInputChange('studentName', e.target.value)}
            placeholder="Enter student name"
            className="input-field pl-10"
            required
            disabled={loading}
          />
        </div>
      </div>

      {/* Phone Number */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Phone Number *
        </label>
        <div className="relative">
          <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => handleInputChange('phone', e.target.value)}
            placeholder="Enter phone number"
            className="input-field pl-10"
            required
            disabled={loading}
          />
        </div>
      </div>
    </div>
  )

  const renderAdminForm = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Admin Name *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            placeholder="Enter admin name"
            className="input-field"
            required
            disabled={loading}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Phone Number *
          </label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              placeholder="Enter phone number"
              className="input-field pl-10"
              required
              disabled={loading}
            />
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Admin Code *
        </label>
        <input
          type="text"
          value={formData.adminCode}
          onChange={(e) => handleInputChange('adminCode', e.target.value)}
          placeholder="Enter admin authorization code"
          className="input-field"
          required
          disabled={loading}
        />
        <p className="text-sm text-gray-500 mt-1">
          Contact system administrator for the authorization code
        </p>
      </div>
    </div>
  )

  const renderDriverForm = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Driver Name *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            placeholder="Enter driver name"
            className="input-field"
            required
            disabled={loading}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Phone Number *
          </label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              placeholder="Enter phone number"
              className="input-field pl-10"
              required
              disabled={loading}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            License Number *
          </label>
          <input
            type="text"
            value={formData.licenseNumber}
            onChange={(e) => handleInputChange('licenseNumber', e.target.value)}
            placeholder="Enter driving license number"
            className="input-field"
            required
            disabled={loading}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Vehicle Number *
          </label>
          <input
            type="text"
            value={formData.vehicleNumber}
            onChange={(e) => handleInputChange('vehicleNumber', e.target.value)}
            placeholder="Enter vehicle number"
            className="input-field"
            required
            disabled={loading}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Years of Experience *
        </label>
        <select
          value={formData.experience}
          onChange={(e) => handleInputChange('experience', e.target.value)}
          className="input-field"
          required
          disabled={loading}
        >
          <option value="">Select Experience</option>
          <option value="0-1">0-1 years</option>
          <option value="1-3">1-3 years</option>
          <option value="3-5">3-5 years</option>
          <option value="5-10">5-10 years</option>
          <option value="10+">10+ years</option>
        </select>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Bus className="w-12 h-12 text-primary-600" />
            <h1 className="text-3xl font-bold text-gray-900 ml-3">RideSafe</h1>
          </div>
          <p className="text-gray-600">Create your account</p>
        </div>

        {/* Registration Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Tabs */}
          <div className="flex space-x-1 mb-8 bg-gray-100 p-1 rounded-lg">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-md font-medium transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'bg-white text-primary-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                  disabled={loading}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              )
            })}
          </div>

          {/* Registration Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Common Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="Enter your email"
                    className="input-field pl-10"
                    required
                    disabled={loading}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password *
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    placeholder="Create a password"
                    className="input-field pl-10 pr-10"
                    required
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    disabled={loading}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password *
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  placeholder="Confirm your password"
                  className="input-field pl-10 pr-10"
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  disabled={loading}
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Type-specific fields */}
            {activeTab === 'user' && renderUserForm()}
            {activeTab === 'admin' && renderAdminForm()}
            {activeTab === 'driver' && renderDriverForm()}

            <button 
              type="submit" 
              className="btn-primary w-full"
              disabled={loading}
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>

            {/* Login Link */}
            <div className="text-center text-sm text-gray-600">
              Already have an account?{' '}
              <a href="/login" className="text-primary-600 hover:text-primary-700 font-medium">
                Sign in here
              </a>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-gray-500">
          <p>© 2024 RideSafe. All rights reserved.</p>
        </div>
      </div>
    </div>
  )
}

export default RegisterPage 