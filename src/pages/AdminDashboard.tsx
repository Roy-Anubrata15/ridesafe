import { useState, useEffect } from 'react'
import { 
  Shield, 
  Users, 
  DollarSign, 
  Settings, 
  Plus, 
  Trash2, 
  Eye, 
  FileText, 
  XCircle, 
  MessageSquare
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import { getAllAdminCodes, addAdminCode, deactivateAdminCode, deleteAdminCode, initializeAdminCodes } from '../services/adminService'
import { AdminCode } from '../services/adminService'
import { 
  approveAdmissionForm, 
  rejectAdmissionForm,
  approveChangeRequest,
  rejectChangeRequest,
  getAdminStats,
  subscribeToAdmissionForms,
  subscribeToChangeRequests
} from '../services/adminAdmissionService'
import { AdmissionForm, ChangeRequest, AdminStats } from '../types/admin'
import toast from 'react-hot-toast'

const AdminDashboard = () => {
  const { currentUser, logout } = useAuth()
  const navigate = useNavigate()
  
  // Admin Codes State
  const [adminCodes, setAdminCodes] = useState<AdminCode[]>([])
  const [showAddCode, setShowAddCode] = useState(false)
  const [newCode, setNewCode] = useState('')
  
  // Admission Forms State
  const [admissionForms, setAdmissionForms] = useState<AdmissionForm[]>([])
  const [changeRequests, setChangeRequests] = useState<ChangeRequest[]>([])
  const [adminStats, setAdminStats] = useState<AdminStats>({
    totalUsers: 0,
    pendingAdmissions: 0,
    approvedAdmissions: 0,
    rejectedAdmissions: 0,
    pendingChangeRequests: 0,
    totalRevenue: 0
  })
  
  // UI State
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [selectedForm, setSelectedForm] = useState<AdmissionForm | null>(null)
  const [selectedRequest, setSelectedRequest] = useState<ChangeRequest | null>(null)
  const [showFormModal, setShowFormModal] = useState(false)
  const [showRequestModal, setShowRequestModal] = useState(false)
  
  // Form Action State
  const [monthlyAmount, setMonthlyAmount] = useState('')
  const [adminResponse, setAdminResponse] = useState('')
  const [rejectionReason, setRejectionReason] = useState('')

  useEffect(() => {
    loadAllData()
    
    // Set up real-time listeners
    const unsubscribeForms = subscribeToAdmissionForms((forms) => {
      setAdmissionForms(forms)
      updateAdminStats(forms, changeRequests)
    })
    
    const unsubscribeRequests = subscribeToChangeRequests((requests) => {
      setChangeRequests(requests)
      updateAdminStats(admissionForms, requests)
    })
    
    // Cleanup listeners on unmount
    return () => {
      unsubscribeForms()
      unsubscribeRequests()
    }
  }, [admissionForms, changeRequests])

  const loadAllData = async () => {
    setLoading(true)
    try {
      await Promise.all([
        loadAdminCodes(),
        loadAdminStats()
      ])
    } catch (error) {
      console.error('Error loading admin data:', error)
      toast.error('Failed to load admin data')
    } finally {
      setLoading(false)
    }
  }

  const updateAdminStats = (forms: AdmissionForm[], requests: ChangeRequest[]) => {
    setAdminStats({
      totalUsers: forms.length,
      pendingAdmissions: forms.filter(f => f.status === 'pending').length,
      approvedAdmissions: forms.filter(f => f.status === 'approved').length,
      rejectedAdmissions: forms.filter(f => f.status === 'rejected').length,
      pendingChangeRequests: requests.filter(r => r.status === 'pending').length,
      totalRevenue: forms
        .filter(f => f.status === 'approved' && f.monthlyAmount)
        .reduce((sum, form) => sum + (form.monthlyAmount || 0), 0)
    })
  }

  const loadAdminCodes = async () => {
    try {
      const codes = await getAllAdminCodes()
      setAdminCodes(codes)
    } catch (error) {
      console.error('Error loading admin codes:', error)
      toast.error('Failed to load admin codes')
    }
  }



  const loadAdminStats = async () => {
    try {
      const stats = await getAdminStats()
      setAdminStats(stats)
    } catch (error) {
      console.error('Error loading admin stats:', error)
      toast.error('Failed to load admin stats')
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

  // Admission Form Actions
  const handleViewForm = (form: AdmissionForm) => {
    setSelectedForm(form)
    setShowFormModal(true)
  }

  const handleApproveForm = async () => {
    if (!selectedForm || !monthlyAmount.trim()) {
      toast.error('Please enter a monthly amount')
      return
    }

    try {
      const success = await approveAdmissionForm(
        selectedForm.id,
        currentUser?.email || 'admin@ridesafe.com',
        parseInt(monthlyAmount),
        adminResponse
      )
      
      if (success) {
        toast.success('Admission form approved successfully!')
        setShowFormModal(false)
        setSelectedForm(null)
        setMonthlyAmount('')
        setAdminResponse('')
        loadAllData()
      } else {
        toast.error('Failed to approve admission form')
      }
    } catch (error) {
      toast.error('Failed to approve admission form')
    }
  }

  const handleRejectForm = async () => {
    if (!selectedForm || !rejectionReason.trim()) {
      toast.error('Please provide a rejection reason')
      return
    }

    try {
      const success = await rejectAdmissionForm(
        selectedForm.id,
        currentUser?.email || 'admin@ridesafe.com',
        rejectionReason
      )
      
      if (success) {
        toast.success('Admission form rejected')
        setShowFormModal(false)
        setSelectedForm(null)
        setRejectionReason('')
        loadAllData()
      } else {
        toast.error('Failed to reject admission form')
      }
    } catch (error) {
      toast.error('Failed to reject admission form')
    }
  }

  // Change Request Actions
  const handleViewRequest = (request: ChangeRequest) => {
    setSelectedRequest(request)
    setShowRequestModal(true)
  }

  const handleApproveRequest = async () => {
    if (!selectedRequest) return

    try {
      const success = await approveChangeRequest(
        selectedRequest.id,
        currentUser?.email || 'admin@ridesafe.com',
        adminResponse
      )
      
      if (success) {
        toast.success('Change request approved successfully!')
        setShowRequestModal(false)
        setSelectedRequest(null)
        setAdminResponse('')
        loadAllData()
      } else {
        toast.error('Failed to approve change request')
      }
    } catch (error) {
      toast.error('Failed to approve change request')
    }
  }

  const handleRejectRequest = async () => {
    if (!selectedRequest || !rejectionReason.trim()) {
      toast.error('Please provide a rejection reason')
      return
    }

    try {
      const success = await rejectChangeRequest(
        selectedRequest.id,
        currentUser?.email || 'admin@ridesafe.com',
        rejectionReason
      )
      
      if (success) {
        toast.success('Change request rejected')
        setShowRequestModal(false)
        setSelectedRequest(null)
        setRejectionReason('')
        loadAllData()
      } else {
        toast.error('Failed to reject change request')
      }
    } catch (error) {
      toast.error('Failed to reject change request')
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
    <>
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
                  <p className="text-2xl font-semibold text-gray-900">{adminStats.totalUsers}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <FileText className="w-8 h-8 text-yellow-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Pending Admissions</p>
                  <p className="text-2xl font-semibold text-gray-900">{adminStats.pendingAdmissions}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <DollarSign className="w-8 h-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Monthly Revenue</p>
                  <p className="text-2xl font-semibold text-gray-900">₹{adminStats.totalRevenue.toLocaleString()}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <MessageSquare className="w-8 h-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Change Requests</p>
                  <p className="text-2xl font-semibold text-gray-900">{adminStats.pendingChangeRequests}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="border-b border-gray-200 mb-6">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('overview')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'overview'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('admissions')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'admissions'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Admission Forms ({adminStats.pendingAdmissions})
              </button>
              <button
                onClick={() => setActiveTab('change-requests')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'change-requests'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Change Requests ({adminStats.pendingChangeRequests})
              </button>
              <button
                onClick={() => setActiveTab('admin-codes')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'admin-codes'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Admin Codes
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <button
                    onClick={() => setActiveTab('admissions')}
                    className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <FileText className="w-6 h-6 text-yellow-600 mr-3" />
                    <div className="text-left">
                      <p className="font-medium text-gray-900">Review Admissions</p>
                      <p className="text-sm text-gray-600">{adminStats.pendingAdmissions} pending</p>
                    </div>
                  </button>
                  <button
                    onClick={() => setActiveTab('change-requests')}
                    className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <MessageSquare className="w-6 h-6 text-purple-600 mr-3" />
                    <div className="text-left">
                      <p className="font-medium text-gray-900">Change Requests</p>
                      <p className="text-sm text-gray-600">{adminStats.pendingChangeRequests} pending</p>
                    </div>
                  </button>
                  <button
                    onClick={() => setActiveTab('admin-codes')}
                    className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Settings className="w-6 h-6 text-blue-600 mr-3" />
                    <div className="text-left">
                      <p className="font-medium text-gray-900">Admin Codes</p>
                      <p className="text-sm text-gray-600">{adminCodes.length} codes</p>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'admissions' && (
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Admission Forms</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Student
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        School
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Guardian
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Submitted
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {loading ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-4 text-center">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                        </td>
                      </tr>
                    ) : admissionForms.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                          No admission forms found
                        </td>
                      </tr>
                    ) : (
                      admissionForms.map((form) => (
                        <tr key={form.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{form.studentName}</div>
                              <div className="text-sm text-gray-500">{form.studentClass}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {form.schoolName}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{form.guardianName}</div>
                              <div className="text-sm text-gray-500">{form.guardianEmail}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              form.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              form.status === 'approved' ? 'bg-green-100 text-green-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {form.status.charAt(0).toUpperCase() + form.status.slice(1)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {form.submittedAt.toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button
                              onClick={() => handleViewForm(form)}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'change-requests' && (
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Change Requests</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Field
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Change
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Requested
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {loading ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-4 text-center">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                        </td>
                      </tr>
                    ) : changeRequests.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                          No change requests found
                        </td>
                      </tr>
                    ) : (
                      changeRequests.map((request) => (
                        <tr key={request.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {request.userEmail}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {request.field}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm">
                              <div className="text-red-600 line-through">{request.oldValue}</div>
                              <div className="text-green-600 font-medium">{request.newValue}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              request.status === 'approved' ? 'bg-green-100 text-green-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {request.requestDate.toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button
                              onClick={() => handleViewRequest(request)}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'admin-codes' && (
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
                      className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
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
        )}
        </div>
      </main>
      </div>

      {/* Admission Form Modal */}
      {showFormModal && selectedForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Admission Form Details</h3>
                <button
                  onClick={() => {
                    setShowFormModal(false)
                    setSelectedForm(null)
                    setMonthlyAmount('')
                    setAdminResponse('')
                    setRejectionReason('')
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
              
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {/* Student Information */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-3">Student Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Student Name</label>
                      <p className="text-sm text-gray-900">{selectedForm.studentName}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Class</label>
                      <p className="text-sm text-gray-900">{selectedForm.studentClass}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">School</label>
                      <p className="text-sm text-gray-900">{selectedForm.schoolName}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Pickup Location</label>
                      <p className="text-sm text-gray-900">{selectedForm.pickupLocation}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Drop Location</label>
                      <p className="text-sm text-gray-900">{selectedForm.dropLocation}</p>
                    </div>
                  </div>
                </div>

                {/* Guardian Information */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-3">Guardian Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Guardian Name</label>
                      <p className="text-sm text-gray-900">{selectedForm.guardianName}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Phone</label>
                      <p className="text-sm text-gray-900">{selectedForm.guardianPhone}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Email</label>
                      <p className="text-sm text-gray-900">{selectedForm.guardianEmail}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Alternate Phone</label>
                      <p className="text-sm text-gray-900">{selectedForm.alternatePhone || 'Not provided'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Emergency Contact</label>
                      <p className="text-sm text-gray-900">{selectedForm.emergencyContact}</p>
                    </div>
                  </div>
                </div>

                {/* Additional Information */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-3">Additional Information</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Medical Conditions</label>
                      <p className="text-sm text-gray-900">{selectedForm.medicalConditions || 'None'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Special Requirements</label>
                      <p className="text-sm text-gray-900">{selectedForm.specialRequirements || 'None'}</p>
                    </div>
                  </div>
                </div>

                {/* Admin Actions */}
                {selectedForm.status === 'pending' && (
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-3">Admin Actions</h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Monthly Amount (₹)
                        </label>
                        <input
                          type="number"
                          value={monthlyAmount}
                          onChange={(e) => setMonthlyAmount(e.target.value)}
                          placeholder="Enter monthly amount"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Admin Response (Optional)
                        </label>
                        <textarea
                          value={adminResponse}
                          onChange={(e) => setAdminResponse(e.target.value)}
                          placeholder="Add any comments or notes"
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Rejection Reason (if rejecting)
                        </label>
                        <textarea
                          value={rejectionReason}
                          onChange={(e) => setRejectionReason(e.target.value)}
                          placeholder="Provide reason for rejection"
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end space-x-3 mt-6">
                <button
                  onClick={() => {
                    setShowFormModal(false)
                    setSelectedForm(null)
                    setMonthlyAmount('')
                    setAdminResponse('')
                    setRejectionReason('')
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Close
                </button>
                {selectedForm.status === 'pending' && (
                  <>
                    <button
                      onClick={handleRejectForm}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      Reject
                    </button>
                    <button
                      onClick={handleApproveForm}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Approve
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Change Request Modal */}
      {showRequestModal && selectedRequest && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Change Request Details</h3>
                <button
                  onClick={() => {
                    setShowRequestModal(false)
                    setSelectedRequest(null)
                    setAdminResponse('')
                    setRejectionReason('')
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">User Email</label>
                      <p className="text-sm text-gray-900">{selectedRequest.userEmail}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Field</label>
                      <p className="text-sm text-gray-900">{selectedRequest.field}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Current Value</label>
                      <p className="text-sm text-red-600 line-through">{selectedRequest.oldValue}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Requested Value</label>
                      <p className="text-sm text-green-600 font-medium">{selectedRequest.newValue}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Request Date</label>
                      <p className="text-sm text-gray-900">{selectedRequest.requestDate.toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>

                {/* Admin Actions */}
                {selectedRequest.status === 'pending' && (
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-3">Admin Actions</h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Admin Response (Optional)
                        </label>
                        <textarea
                          value={adminResponse}
                          onChange={(e) => setAdminResponse(e.target.value)}
                          placeholder="Add any comments or notes"
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Rejection Reason (if rejecting)
                        </label>
                        <textarea
                          value={rejectionReason}
                          onChange={(e) => setRejectionReason(e.target.value)}
                          placeholder="Provide reason for rejection"
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end space-x-3 mt-6">
                <button
                  onClick={() => {
                    setShowRequestModal(false)
                    setSelectedRequest(null)
                    setAdminResponse('')
                    setRejectionReason('')
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Close
                </button>
                {selectedRequest.status === 'pending' && (
                  <>
                    <button
                      onClick={handleRejectRequest}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      Reject
                    </button>
                    <button
                      onClick={handleApproveRequest}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Approve
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default AdminDashboard 