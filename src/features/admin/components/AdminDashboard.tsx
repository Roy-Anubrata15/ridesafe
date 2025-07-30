import { useState, useEffect } from 'react'
import { 
  Shield, 
  Users, 
  FileText, 
  DollarSign, 
  Settings, 
  Plus, 
  Trash2, 
  Eye, 
  MessageSquare,
  LogOut
} from 'lucide-react'
import { useAuth } from '../../../shared/contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import { getUserDataByEmail } from '../../../shared/services/userDataService'
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
} from '../services/admissionService'
import { 
  subscribeToAdminRealTimeUpdates, 
  unsubscribeFromAdminRealTimeUpdates,
  RealTimeSyncCallbacks 
} from '../../../shared/services/realTimeSyncService'
import { AdmissionForm, ChangeRequest, AdminStats } from '../types/admin'
import { Button, Card, CardHeader, CardTitle, CardContent, Modal, Input } from '../../../shared/components/ui'
import toast from 'react-hot-toast'

const AdminDashboard = () => {
  const { currentUser, logout } = useAuth()
  const navigate = useNavigate()
  const [isAdmin, setIsAdmin] = useState(false)
  const [checkingAdmin, setCheckingAdmin] = useState(true)
  
  // State
  const [adminCodes, setAdminCodes] = useState<AdminCode[]>([])
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
  
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [selectedForm, setSelectedForm] = useState<AdmissionForm | null>(null)
  const [selectedRequest, setSelectedRequest] = useState<ChangeRequest | null>(null)
  const [showFormModal, setShowFormModal] = useState(false)
  const [showRequestModal, setShowRequestModal] = useState(false)
  const [showAddCode, setShowAddCode] = useState(false)
  const [newCode, setNewCode] = useState('')
  const [monthlyAmount, setMonthlyAmount] = useState('')
  const [adminResponse, setAdminResponse] = useState('')
  const [rejectionReason, setRejectionReason] = useState('')

  // Check if user is admin
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!currentUser?.email) {
        setCheckingAdmin(false)
        return
      }

      try {
        const userData = await getUserDataByEmail(currentUser.email)
        const hasAdminRole = userData?.role === 'admin'
        setIsAdmin(hasAdminRole)
        
        if (!hasAdminRole) {
          toast.error('Access denied. Admin privileges required.')
          navigate('/dashboard')
          return
        }
        
        // Only load admin data if user is admin
        loadAllData()
        
        // Set up real-time sync callbacks for admin
        const adminSyncCallbacks: RealTimeSyncCallbacks = {
          onAdminAction: (actionData) => {
            if (actionData.type === 'admission_form_update') {
              // Refresh admission forms when there's an update
              loadAllData()
            } else if (actionData.type === 'change_request_update') {
              // Refresh change requests when there's an update
              loadAllData()
            }
          }
        }
        
        // Subscribe to admin real-time updates
        const unsubscribeAdminSync = subscribeToAdminRealTimeUpdates(adminSyncCallbacks)
        
        // Also keep legacy listeners for immediate updates
        const unsubscribeForms = subscribeToAdmissionForms((forms) => {
          setAdmissionForms(forms)
          updateAdminStats(forms, changeRequests)
        })
        
        const unsubscribeRequests = subscribeToChangeRequests((requests) => {
          setChangeRequests(requests)
          updateAdminStats(admissionForms, requests)
        })
        
        return () => {
          unsubscribeAdminSync()
          unsubscribeForms()
          unsubscribeRequests()
        }
      } catch (error) {
        console.error('Error checking admin status:', error)
        toast.error('Failed to verify admin privileges')
        navigate('/dashboard')
      } finally {
        setCheckingAdmin(false)
      }
    }

    checkAdminStatus()
  }, [currentUser?.email])

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

  const handleInitializeCodes = async () => {
    try {
      await initializeAdminCodes()
      toast.success('Admin codes initialized successfully!')
      loadAdminCodes()
    } catch (error) {
      toast.error('Failed to initialize admin codes')
    }
  }

  const handleViewForm = (form: AdmissionForm) => {
    setSelectedForm(form)
    setShowFormModal(true)
  }

  const handleApproveForm = async () => {
    if (!selectedForm || !monthlyAmount.trim()) {
      toast.error('Please enter a monthly amount')
      return
    }

    const amount = parseFloat(monthlyAmount)
    if (isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid monthly amount')
      return
    }

    try {
      const success = await approveAdmissionForm(
        selectedForm.id,
        currentUser?.email || 'admin@ridesafe.com',
        amount,
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
      console.error('Error approving admission form:', error)
      toast.error(`Failed to approve admission form: ${error instanceof Error ? error.message : 'Unknown error'}`)
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
      console.error('Error rejecting admission form:', error)
      toast.error(`Failed to reject admission form: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

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
      console.error('Error approving change request:', error)
      toast.error(`Failed to approve change request: ${error instanceof Error ? error.message : 'Unknown error'}`)
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
      console.error('Error rejecting change request:', error)
      toast.error(`Failed to reject change request: ${error instanceof Error ? error.message : 'Unknown error'}`)
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

  if (!currentUser) return null

  if (checkingAdmin || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">
            {checkingAdmin ? 'Verifying admin privileges...' : 'Loading admin data...'}
          </p>
        </div>
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-4">Admin privileges required to access this panel.</p>
          <Button onClick={() => navigate('/dashboard')}>
            Return to Dashboard
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile-Optimized Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <Shield className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
              <h1 className="text-lg sm:text-xl font-semibold text-gray-900">Admin Dashboard</h1>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <span className="hidden sm:block text-sm text-gray-600">Welcome, {currentUser.email}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/dashboard')}
                className="hidden sm:flex"
              >
                Switch Role
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                icon={<LogOut className="w-4 h-4" />}
              >
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-4 sm:py-6 px-4 sm:px-6 lg:px-8">
        {/* Stats Cards - Mobile Responsive Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card className="p-4">
            <div className="flex items-center">
              <Users className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
              <div className="ml-3">
                <p className="text-xs sm:text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-lg sm:text-2xl font-semibold text-gray-900">{adminStats.totalUsers}</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center">
              <FileText className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-600" />
              <div className="ml-3">
                <p className="text-xs sm:text-sm font-medium text-gray-600">Pending</p>
                <p className="text-lg sm:text-2xl font-semibold text-gray-900">{adminStats.pendingAdmissions}</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center">
              <DollarSign className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" />
              <div className="ml-3">
                <p className="text-xs sm:text-sm font-medium text-gray-600">Revenue</p>
                <p className="text-lg sm:text-2xl font-semibold text-gray-900">₹{adminStats.totalRevenue.toLocaleString()}</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center">
              <MessageSquare className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600" />
              <div className="ml-3">
                <p className="text-xs sm:text-sm font-medium text-gray-600">Requests</p>
                <p className="text-lg sm:text-2xl font-semibold text-gray-900">{adminStats.pendingChangeRequests}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Mobile-Optimized Navigation Tabs */}
        <div className="border-b border-gray-200 mb-6 overflow-x-auto">
          <nav className="flex space-x-6 min-w-max">
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'admissions', label: `Admissions (${adminStats.pendingAdmissions})` },
              { id: 'change-requests', label: `Requests (${adminStats.pendingChangeRequests})` },
              { id: 'admin-codes', label: 'Admin Codes' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="p-4">
                <CardHeader>
                  <CardTitle className="text-base">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button
                    variant="outline"
                    fullWidth
                    onClick={() => setActiveTab('admissions')}
                    icon={<FileText className="w-4 h-4" />}
                  >
                    Review Admissions
                  </Button>
                  <Button
                    variant="outline"
                    fullWidth
                    onClick={() => setActiveTab('change-requests')}
                    icon={<MessageSquare className="w-4 h-4" />}
                  >
                    Change Requests
                  </Button>
                  <Button
                    variant="outline"
                    fullWidth
                    onClick={() => setActiveTab('admin-codes')}
                    icon={<Settings className="w-4 h-4" />}
                  >
                    Admin Codes
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'admissions' && (
            <Card>
              <CardHeader>
                <CardTitle>Admission Forms</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {loading ? (
                    <div className="flex justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                  ) : admissionForms.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      No admission forms found
                    </div>
                  ) : (
                    admissionForms.map((form) => (
                      <Card key={form.id} variant="outlined" className="p-4">
                        <div className="flex justify-between items-start">
                          <div className="space-y-2">
                            <h3 className="font-medium">{form.studentName}</h3>
                            <p className="text-sm text-gray-600">{form.schoolName}</p>
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              form.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              form.status === 'approved' ? 'bg-green-100 text-green-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {form.status.charAt(0).toUpperCase() + form.status.slice(1)}
                            </span>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewForm(form)}
                            icon={<Eye className="w-4 h-4" />}
                          />
                        </div>
                      </Card>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'change-requests' && (
            <Card>
              <CardHeader>
                <CardTitle>Change Requests</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {loading ? (
                    <div className="flex justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                  ) : changeRequests.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      No change requests found
                    </div>
                  ) : (
                    changeRequests.map((request) => (
                      <Card key={request.id} variant="outlined" className="p-4">
                        <div className="flex justify-between items-start">
                          <div className="space-y-2">
                            <h3 className="font-medium">{request.userEmail}</h3>
                            <p className="text-sm text-gray-600">{request.field}</p>
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              request.status === 'approved' ? 'bg-green-100 text-green-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                            </span>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewRequest(request)}
                            icon={<Eye className="w-4 h-4" />}
                          />
                        </div>
                      </Card>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'admin-codes' && (
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                  <CardTitle>Admin Codes Management</CardTitle>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleInitializeCodes}
                      icon={<Settings className="w-4 h-4" />}
                    >
                      Initialize
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => setShowAddCode(!showAddCode)}
                      icon={<Plus className="w-4 h-4" />}
                    >
                      Add Code
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {showAddCode && (
                  <Card variant="outlined" className="p-4 mb-4">
                    <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                      <Input
                        value={newCode}
                        onChange={(e) => setNewCode(e.target.value)}
                        placeholder="Enter new admin code"
                        className="flex-1"
                      />
                      <Button onClick={handleAddCode} size="sm">
                        Add
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setShowAddCode(false)
                          setNewCode('')
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </Card>
                )}
                
                <div className="space-y-4">
                  {adminCodes.map((code) => (
                    <Card key={code.code} variant="outlined" className="p-4">
                      <div className="flex justify-between items-center">
                        <div className="space-y-1">
                          <p className="font-medium">{code.code}</p>
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            code.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {code.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                        <div className="flex space-x-2">
                          {code.isActive && !code.usedBy && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deactivateAdminCode(code.code)}
                            >
                              Deactivate
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteAdminCode(code.code)}
                            icon={<Trash2 className="w-4 h-4" />}
                          />
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      {/* Admission Form Modal */}
      <Modal
        isOpen={showFormModal}
        onClose={() => setShowFormModal(false)}
        title="Admission Form Details"
        size="lg"
      >
        {selectedForm && (
          <div className="space-y-6">
            {/* Student Information */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">Student Information</h3>
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
                  <label className="text-sm font-medium text-gray-600">Emergency Contact</label>
                  <p className="text-sm text-gray-900">{selectedForm.emergencyContact || 'Not provided'}</p>
                </div>
              </div>
            </div>

            {/* Guardian Information */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">Guardian Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Guardian Name</label>
                  <p className="text-sm text-gray-900">{selectedForm.guardianName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Guardian Email</label>
                  <p className="text-sm text-gray-900">{selectedForm.guardianEmail}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Guardian Phone</label>
                  <p className="text-sm text-gray-900">{selectedForm.guardianPhone}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Alternate Phone</label>
                  <p className="text-sm text-gray-900">{selectedForm.alternatePhone || 'Not provided'}</p>
                </div>
              </div>
            </div>

            {/* Location Information */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">Location Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

            {/* Additional Information */}
            {(selectedForm.medicalConditions || selectedForm.specialRequirements) && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Additional Information</h3>
                <div className="space-y-3">
                  {selectedForm.medicalConditions && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">Medical Conditions</label>
                      <p className="text-sm text-gray-900 bg-yellow-50 p-2 rounded">{selectedForm.medicalConditions}</p>
                    </div>
                  )}
                  {selectedForm.specialRequirements && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">Special Requirements</label>
                      <p className="text-sm text-gray-900 bg-blue-50 p-2 rounded">{selectedForm.specialRequirements}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Form Status */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">Form Status</h3>
              <div className="flex items-center space-x-2">
                <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
                  selectedForm.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  selectedForm.status === 'approved' ? 'bg-green-100 text-green-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {selectedForm.status.charAt(0).toUpperCase() + selectedForm.status.slice(1)}
                </span>
                <span className="text-sm text-gray-500">
                  Submitted on {selectedForm.submittedAt.toLocaleDateString()}
                </span>
              </div>
            </div>

            {/* Admin Actions for Pending Forms */}
            {selectedForm.status === 'pending' && (
              <div className="space-y-4 border-t pt-4">
                <h3 className="text-lg font-medium text-gray-900">Admin Actions</h3>
                <Input
                  label="Monthly Amount (₹)"
                  type="number"
                  value={monthlyAmount}
                  onChange={(e) => setMonthlyAmount(e.target.value)}
                  placeholder="Enter monthly amount"
                />
                <Input
                  label="Admin Response (Optional)"
                  value={adminResponse}
                  onChange={(e) => setAdminResponse(e.target.value)}
                  placeholder="Add any comments or instructions"
                />
                <Input
                  label="Rejection Reason (if rejecting)"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Provide reason for rejection"
                />
                
                <div className="flex space-x-2">
                  <Button
                    variant="danger"
                    onClick={handleRejectForm}
                    fullWidth
                  >
                    Reject Application
                  </Button>
                  <Button
                    onClick={handleApproveForm}
                    fullWidth
                  >
                    Approve Application
                  </Button>
                </div>
              </div>
            )}

            {/* Show approval/rejection details for processed forms */}
            {selectedForm.status !== 'pending' && (
              <div className="border-t pt-4">
                <h3 className="text-lg font-medium text-gray-900 mb-3">Review Details</h3>
                <div className="space-y-2">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Reviewed By</label>
                    <p className="text-sm text-gray-900">{selectedForm.reviewedBy}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Reviewed On</label>
                    <p className="text-sm text-gray-900">{selectedForm.reviewedAt?.toLocaleDateString()}</p>
                  </div>
                  {selectedForm.status === 'approved' && selectedForm.monthlyAmount && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">Monthly Amount</label>
                      <p className="text-sm text-gray-900 font-semibold">₹{selectedForm.monthlyAmount}</p>
                    </div>
                  )}
                  {selectedForm.adminResponse && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">Admin Response</label>
                      <p className="text-sm text-gray-900">{selectedForm.adminResponse}</p>
                    </div>
                  )}
                  {selectedForm.status === 'rejected' && selectedForm.rejectionReason && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">Rejection Reason</label>
                      <p className="text-sm text-red-600">{selectedForm.rejectionReason}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Change Request Modal */}
      <Modal
        isOpen={showRequestModal}
        onClose={() => setShowRequestModal(false)}
        title="Change Request Details"
        size="md"
      >
        {selectedRequest && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
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
            </div>

            {selectedRequest.status === 'pending' && (
              <div className="space-y-4">
                <Input
                  label="Admin Response (Optional)"
                  value={adminResponse}
                  onChange={(e) => setAdminResponse(e.target.value)}
                  placeholder="Add any comments"
                />
                <Input
                  label="Rejection Reason (if rejecting)"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Provide reason for rejection"
                />
                
                <div className="flex space-x-2">
                  <Button
                    variant="danger"
                    onClick={handleRejectRequest}
                    fullWidth
                  >
                    Reject
                  </Button>
                  <Button
                    onClick={handleApproveRequest}
                    fullWidth
                  >
                    Approve
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}

export default AdminDashboard 