import React, { useState } from 'react'
import { Bus, User, Shield, Car, Mail, Lock, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { auth } from '../firebase/config'
import { checkEmailExistsForRole, isUserVerifiedForRole, cleanupUnverifiedUsers } from '../services/authService'

type LoginType = 'user' | 'admin' | 'driver'

const LoginPage = () => {
  const [activeTab, setActiveTab] = useState<LoginType>('user')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })

  const { login } = useAuth()
  const navigate = useNavigate()

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Check if the user is registered for the selected role
      const isRegisteredForRole = await checkEmailExistsForRole(formData.email, activeTab)
      
      // Also check if user is registered as admin (for admin privileges)
      const isRegisteredAsAdmin = await checkEmailExistsForRole(formData.email, 'admin')
      
      // Admin users can access any panel, regular users can only access their registered role
      if (!isRegisteredForRole && !isRegisteredAsAdmin) {
        let errorMessage = ''
        if (activeTab === 'admin') {
          errorMessage = 'This email is not registered as an admin. Please register with an admin code first.'
        } else if (activeTab === 'driver') {
          errorMessage = 'This email is not registered as a driver. Please register as a driver first.'
        } else {
          errorMessage = 'This email is not registered as a user. Please register as a user first.'
        }
        toast.error(errorMessage)
        setLoading(false)
        return
      }

      // Email/Password authentication for all user types
      await login(formData.email, formData.password)
      
      // Check if email is verified in Firebase Auth
      if (!auth.currentUser?.emailVerified) {
        toast.error('Please verify your email before logging in.')
        navigate('/verify-email')
        return
      }
      
      // Additional check: Verify the user is marked as verified in Firestore
      const isVerifiedInFirestore = await isUserVerifiedForRole(formData.email, activeTab)
      if (!isVerifiedInFirestore && !isRegisteredAsAdmin) {
        // If not verified in Firestore but verified in Firebase Auth, update Firestore
        console.log('User verified in Firebase Auth but not in Firestore, updating...')
        // This will be handled by the verification page when they verify
        toast.error('Please verify your email before logging in.')
        navigate('/verify-email')
        return
      }
      
      // Show appropriate success message
      if (isRegisteredAsAdmin && activeTab !== 'admin') {
        toast.success(`Login successful! Welcome to ${activeTab} panel. (Admin access)`)
      } else {
        toast.success(`Login successful! Welcome to ${activeTab} panel.`)
      }
      
      navigate('/dashboard')
    } catch (error: any) {
      console.error('Login error:', error)
      
      // Handle specific Firebase auth errors
      let errorMessage = 'Login failed. Please try again.'
      
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email address.'
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = 'Incorrect password. Please try again.'
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Please enter a valid email address.'
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many failed attempts. Please try again later.'
      } else if (error.code === 'auth/user-disabled') {
        errorMessage = 'This account has been disabled. Please contact support.'
      }
      
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const tabs = [
    { id: 'user' as LoginType, label: 'User', icon: User },
    { id: 'admin' as LoginType, label: 'Admin', icon: Shield },
    { id: 'driver' as LoginType, label: 'Driver', icon: Car }
  ]

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Bus className="w-12 h-12 text-primary-600" />
            <h1 className="text-3xl font-bold text-gray-900 ml-3">RideSafe</h1>
          </div>
          <p className="text-gray-600">School Transportation Management System</p>
        </div>

        {/* Login Card */}
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
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              )
            })}
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Role Indicator */}
            <div className="text-center mb-4">
              <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-800">
                {activeTab === 'user' && <User className="w-4 h-4 mr-2" />}
                {activeTab === 'admin' && <Shield className="w-4 h-4 mr-2" />}
                {activeTab === 'driver' && <Car className="w-4 h-4 mr-2" />}
                Logging in as {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
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
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    placeholder="Enter your password"
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
              <button 
                type="submit" 
                className="btn-primary w-full"
                disabled={loading}
              >
                {loading ? 'Signing In...' : 'Sign In'}
              </button>
            </div>

            {/* Additional Links */}
            <div className="text-center space-y-2">
              <a href="#" className="text-sm text-primary-600 hover:text-primary-700">
                Forgot your password?
              </a>
              <div className="text-sm text-gray-600">
                Don't have an account?{' '}
                <a href="/register" className="text-primary-600 hover:text-primary-700 font-medium">
                  Register here
                </a>
              </div>
            </div>
            
            {/* Role-Specific Note */}
            <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">💡 Important:</p>
                <p>Access rules for different user types:</p>
                <ul className="mt-2 text-xs space-y-1">
                  <li>• <strong>User:</strong> Can only access User panel</li>
                  <li>• <strong>Driver:</strong> Can only access Driver panel</li>
                  <li>• <strong>Admin:</strong> Can access ALL panels (User, Admin, Driver)</li>
                  <li>• <strong>Role switching:</strong> Only available for admins registered in all three roles</li>
                </ul>
              </div>
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

export default LoginPage 