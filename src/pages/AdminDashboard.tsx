import React, { useState, useEffect } from 'react'
import { Shield, Users, Car, DollarSign, Settings, Plus, Trash2, Eye } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import { getAllAdminCodes, addAdminCode, deactivateAdminCode, deleteAdminCode, initializeAdminCodes } from '../services/adminService'
import { AdminCode } from '../services/adminService'
import toast from 'react-hot-toast'

const AdminDashboard = () => {
  const { currentUser, logout } = useAuth()
  const navigate = useNavigate()
  const [adminCodes, setAdminCodes] = useState<AdminCode[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddCode, setShowAddCode] = useState(false)
  const [newCode, setNewCode] = useState('')

  useEffect(() => {
    loadAdminCodes()
  }, [])

  const loadAdminCodes = async () => {
    try {
      const codes = await getAllAdminCodes()
      setAdminCodes(codes)
    } catch (error) {
      console.error('Error loading admin codes:', error)
      toast.error('Failed to load admin codes')
    } finally {
      setLoading(false)
    }
  }

  const handleAddCode = async () => {
    if (!newCode.trim()) {
      toast.error('Please enter a code')
      return
    }

    try {
      const success = await addAdminCode(newCode, currentUser?.uid || 'admin')
      if (success) {
        toast.success('Admin code added successfully')
        setNewCode('')
        setShowAddCode(false)
        loadAdminCodes()
      } else {
        toast.error('Failed to add admin code')
      }
    } catch (error) {
      toast.error('Failed to add admin code')
    }
  }

  const handleDeactivateCode = async (code: string) => {
    try {
      const success = await deactivateAdminCode(code)
      if (success) {
        toast.success('Admin code deactivated')
        loadAdminCodes()
      } else {
        toast.error('Failed to deactivate admin code')
      }
    } catch (error) {
      toast.error('Failed to deactivate admin code')
    }
  }

  const handleDeleteCode = async (code: string) => {
    if (window.confirm('Are you sure you want to delete this admin code?')) {
      try {
        const success = await deleteAdminCode(code)
        if (success) {
          toast.success('Admin code deleted')
          loadAdminCodes()
        } else {
          toast.error('Failed to delete admin code')
        }
      } catch (error) {
        toast.error('Failed to delete admin code')
      }
    }
  }

  const handleInitializeCodes = async () => {
    try {
      await initializeAdminCodes()
      toast.success('Admin codes initialized successfully!')
      loadAdminCodes()
    } catch (error) {
      toast.error('Failed to initialize admin codes')
    }
  }

  const handleLogout = async () => {
    try {
      await logout()
      toast.success('Logged out successfully!')
      navigate('/login')
    } catch (error) {
      toast.error('Failed to log out')
    }
  }

  if (!currentUser) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <Shield className="w-8 h-8 text-primary-600" />
              <h1 className="text-xl font-semibold text-gray-900">Admin Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Welcome, {currentUser.email}</span>
              <button
                onClick={() => navigate('/dashboard')}
                className="text-sm text-primary-600 hover:text-primary-700"
              >
                Switch Role
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <Users className="w-8 h-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Users</p>
                  <p className="text-2xl font-semibold text-gray-900">0</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <Car className="w-8 h-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active Drivers</p>
                  <p className="text-2xl font-semibold text-gray-900">0</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <DollarSign className="w-8 h-8 text-yellow-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Monthly Revenue</p>
                  <p className="text-2xl font-semibold text-gray-900">$0</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <Settings className="w-8 h-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Admin Codes</p>
                  <p className="text-2xl font-semibold text-gray-900">{adminCodes.length}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Admin Codes Management */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-medium text-gray-900">Admin Codes Management</h2>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={handleInitializeCodes}
                    className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <span>Initialize Codes</span>
                  </button>
                  <button
                    onClick={() => setShowAddCode(!showAddCode)}
                    className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Code</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Add New Code Form */}
            {showAddCode && (
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center space-x-4">
                  <input
                    type="text"
                    value={newCode}
                    onChange={(e) => setNewCode(e.target.value)}
                    placeholder="Enter new admin code"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                  <button
                    onClick={handleAddCode}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Add
                  </button>
                  <button
                    onClick={() => {
                      setShowAddCode(false)
                      setNewCode('')
                    }}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Admin Codes List */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Code
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Used By
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-4 text-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600 mx-auto"></div>
                      </td>
                    </tr>
                  ) : adminCodes.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                        No admin codes found
                      </td>
                    </tr>
                  ) : (
                    adminCodes.map((code) => (
                      <tr key={code.code}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {code.code}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            code.isActive 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {code.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {code.usedBy ? 'Used' : 'Available'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {code.createdAt instanceof Date 
                            ? code.createdAt.toLocaleDateString()
                            : new Date(code.createdAt).toLocaleDateString()
                          }
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            {code.isActive && !code.usedBy && (
                              <button
                                onClick={() => handleDeactivateCode(code.code)}
                                className="text-yellow-600 hover:text-yellow-900"
                              >
                                Deactivate
                              </button>
                            )}
                            <button
                              onClick={() => handleDeleteCode(code.code)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default AdminDashboard 