import { useState, useEffect } from 'react'
import { 
  User, 
  Save, 
  X,
  ArrowLeft,
  Edit3,
  Shield,
  CheckCircle,
  AlertCircle,
  Send,
  Clock,
  FileText
} from 'lucide-react'
import { useAuth } from '../shared/contexts/AuthContext'
import { useUserData } from '../shared/contexts/UserDataContext'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

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

interface ChangeRequest {
  id: string
  field: string
  oldValue: string
  newValue: string
  status: 'pending' | 'approved' | 'rejected'
  requestDate: Date
  adminResponse?: string
  responseDate?: Date
}

const AccountSettings = () => {
  const { currentUser } = useAuth()
  const { student, updateEditableData } = useUserData()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [isRequestingChanges, setIsRequestingChanges] = useState(false)

  const [editableData, setEditableData] = useState({
    guardianName: student.guardianName,
    guardianPhone: student.guardianPhone,
    alternatePhone: student.alternatePhone || '',
    guardianEmail: student.guardianEmail
  })

  // Sync editableData when student data changes
  useEffect(() => {
    setEditableData({
      guardianName: student.guardianName,
      guardianPhone: student.guardianPhone,
      alternatePhone: student.alternatePhone || '',
      guardianEmail: student.guardianEmail
    })
  }, [student.guardianName, student.guardianPhone, student.alternatePhone, student.guardianEmail])

  const [admissionData, setAdmissionData] = useState({
    name: student.name,
    class: student.class,
    school: student.school,
    pickupLocation: student.pickupLocation,
    dropLocation: student.dropLocation,
    monthlyAmount: student.monthlyAmount
  })

  // Sync admissionData when student data changes
  useEffect(() => {
    setAdmissionData({
      name: student.name,
      class: student.class,
      school: student.school,
      pickupLocation: student.pickupLocation,
      dropLocation: student.dropLocation,
      monthlyAmount: student.monthlyAmount
    })
  }, [student.name, student.class, student.school, student.pickupLocation, student.dropLocation, student.monthlyAmount])

  const [changeRequests, setChangeRequests] = useState<ChangeRequest[]>([
    {
      id: '1',
      field: 'Student Name',
      oldValue: 'John Doe',
      newValue: 'John Smith',
      status: 'pending',
      requestDate: new Date('2024-01-20')
    },
    {
      id: '2',
      field: 'Pickup Location',
      oldValue: '123 Main Street, City',
      newValue: '789 New Avenue, City',
      status: 'approved',
      requestDate: new Date('2024-01-18'),
      adminResponse: 'Location change approved. Driver will be notified.',
      responseDate: new Date('2024-01-19')
    }
  ])

  useEffect(() => {
    setEditableData({
      guardianName: student.guardianName,
      guardianPhone: student.guardianPhone,
      alternatePhone: student.alternatePhone,
      guardianEmail: student.guardianEmail
    })
    setAdmissionData({
      name: student.name,
      class: student.class,
      school: student.school,
      pickupLocation: student.pickupLocation,
      dropLocation: student.dropLocation,
      monthlyAmount: student.monthlyAmount
    })
  }, [student])

  const handleSave = async () => {
    setLoading(true)
    try {
      // TODO: Update data in Firebase
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API call
      
      // Update the shared context with new editable data
      updateEditableData(editableData)
      
      setIsEditing(false)
      toast.success('Account settings updated successfully!')
    } catch (error) {
      toast.error('Failed to update account settings')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    setEditableData({
      guardianName: student.guardianName,
      guardianPhone: student.guardianPhone,
      alternatePhone: student.alternatePhone || '',
      guardianEmail: student.guardianEmail
    })
    setIsEditing(false)
  }

  const handleRequestChanges = async () => {
    setLoading(true)
    try {
      // Create change requests for modified admission fields
      const requests: ChangeRequest[] = []
      
      Object.entries(admissionData).forEach(([key, newValue]) => {
        const oldValue = student[key as keyof Student] as string
        if (newValue !== oldValue) {
          requests.push({
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            field: key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1'),
            oldValue,
            newValue: String(newValue),
            status: 'pending',
            requestDate: new Date()
          })
        }
      })

      if (requests.length === 0) {
        toast.error('No changes detected')
        setIsRequestingChanges(false)
        return
      }

      // TODO: Send requests to Firebase
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API call
      
      setChangeRequests(prev => [...requests, ...prev])
      setAdmissionData({
        name: student.name,
        class: student.class,
        school: student.school,
        pickupLocation: student.pickupLocation,
        dropLocation: student.dropLocation,
        monthlyAmount: student.monthlyAmount
      })
      
      setIsRequestingChanges(false)
      toast.success(`${requests.length} change request(s) submitted successfully!`)
    } catch (error) {
      toast.error('Failed to submit change requests')
    } finally {
      setLoading(false)
    }
  }

  const handleCancelChanges = () => {
    setAdmissionData({
      name: student.name,
      class: student.class,
      school: student.school,
      pickupLocation: student.pickupLocation,
      dropLocation: student.dropLocation,
      monthlyAmount: student.monthlyAmount
    })
    setIsRequestingChanges(false)
  }

  const getAdmissionStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'text-green-600 bg-green-100'
      case 'pending': return 'text-yellow-600 bg-yellow-100'
      case 'rejected': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getAdmissionStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="w-4 h-4" />
      case 'pending': return <Clock className="w-4 h-4" />
      case 'rejected': return <X className="w-4 h-4" />
      default: return <AlertCircle className="w-4 h-4" />
    }
  }

  const getRequestStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'text-green-600 bg-green-100'
      case 'pending': return 'text-yellow-600 bg-yellow-100'
      case 'rejected': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => navigate(-1)}
                className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-gray-900">Account Settings</h1>
                <p className="text-sm text-gray-600">Manage your account information</p>
              </div>
            </div>
            
            {isEditing ? (
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleCancel}
                  className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <X className="w-4 h-4" />
                  <span className="hidden sm:inline">Cancel</span>
                </button>
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span className="hidden sm:inline">{loading ? 'Saving...' : 'Save'}</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Edit3 className="w-4 h-4" />
                <span className="hidden sm:inline">Edit</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="space-y-6">
          {/* Editable Information */}
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900 flex items-center space-x-2">
                <User className="w-5 h-5 text-blue-600" />
                <span>Editable Information</span>
              </h2>
              <p className="text-sm text-gray-600 mt-1">You can modify these details anytime</p>
            </div>
            <div className="p-4 sm:p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                {/* Guardian Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Guardian Name
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editableData.guardianName}
                      onChange={(e) => setEditableData(prev => ({ ...prev, guardianName: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  ) : (
                    <p className="text-sm text-gray-900">{student.guardianName}</p>
                  )}
                </div>

                {/* Guardian Phone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Guardian Phone
                  </label>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={editableData.guardianPhone}
                      onChange={(e) => setEditableData(prev => ({ ...prev, guardianPhone: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  ) : (
                    <p className="text-sm text-gray-900">{student.guardianPhone}</p>
                  )}
                </div>

                {/* Alternate Phone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Alternate Phone
                  </label>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={editableData.alternatePhone}
                      onChange={(e) => setEditableData(prev => ({ ...prev, alternatePhone: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  ) : (
                    <p className="text-sm text-gray-900">{student.alternatePhone}</p>
                  )}
                </div>

                {/* Guardian Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Guardian Email
                  </label>
                  {isEditing ? (
                    <input
                      type="email"
                      value={editableData.guardianEmail}
                      onChange={(e) => setEditableData(prev => ({ ...prev, guardianEmail: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  ) : (
                    <p className="text-sm text-gray-900">{student.guardianEmail}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Non-Editable Information */}
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900 flex items-center space-x-2">
                <Shield className="w-5 h-5 text-gray-600" />
                <span>Admission Information</span>
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                These details are from your admission form. Click the edit icon to request changes.
              </p>
            </div>
            <div className="p-4 sm:p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                {/* Student Name */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Student Name
                    </label>
                    <button
                      onClick={() => {
                        setIsRequestingChanges(true)
                        setAdmissionData(prev => ({ ...prev, name: student.name }))
                      }}
                      className="p-1 text-gray-400 hover:text-orange-600 transition-colors"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                  </div>
                  {isRequestingChanges ? (
                    <input
                      type="text"
                      value={admissionData.name}
                      onChange={(e) => setAdmissionData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                  ) : (
                    <p className="text-sm text-gray-900">{student.name}</p>
                  )}
                </div>

                {/* Class */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Class
                    </label>
                    <button
                      onClick={() => {
                        setIsRequestingChanges(true)
                        setAdmissionData(prev => ({ ...prev, class: student.class }))
                      }}
                      className="p-1 text-gray-400 hover:text-orange-600 transition-colors"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                  </div>
                  {isRequestingChanges ? (
                    <input
                      type="text"
                      value={admissionData.class}
                      onChange={(e) => setAdmissionData(prev => ({ ...prev, class: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                  ) : (
                    <p className="text-sm text-gray-900">{student.class}</p>
                  )}
                </div>

                {/* School */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      School
                    </label>
                    <button
                      onClick={() => {
                        setIsRequestingChanges(true)
                        setAdmissionData(prev => ({ ...prev, school: student.school }))
                      }}
                      className="p-1 text-gray-400 hover:text-orange-600 transition-colors"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                  </div>
                  {isRequestingChanges ? (
                    <input
                      type="text"
                      value={admissionData.school}
                      onChange={(e) => setAdmissionData(prev => ({ ...prev, school: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                  ) : (
                    <p className="text-sm text-gray-900">{student.school}</p>
                  )}
                </div>

                {/* Pickup Location */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Pickup Location
                    </label>
                    <button
                      onClick={() => {
                        setIsRequestingChanges(true)
                        setAdmissionData(prev => ({ ...prev, pickupLocation: student.pickupLocation }))
                      }}
                      className="p-1 text-gray-400 hover:text-orange-600 transition-colors"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                  </div>
                  {isRequestingChanges ? (
                    <input
                      type="text"
                      value={admissionData.pickupLocation}
                      onChange={(e) => setAdmissionData(prev => ({ ...prev, pickupLocation: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                  ) : (
                    <p className="text-sm text-gray-900">{student.pickupLocation}</p>
                  )}
                </div>

                {/* Drop Location */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Drop Location
                    </label>
                    <button
                      onClick={() => {
                        setIsRequestingChanges(true)
                        setAdmissionData(prev => ({ ...prev, dropLocation: student.dropLocation }))
                      }}
                      className="p-1 text-gray-400 hover:text-orange-600 transition-colors"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                  </div>
                  {isRequestingChanges ? (
                    <input
                      type="text"
                      value={admissionData.dropLocation}
                      onChange={(e) => setAdmissionData(prev => ({ ...prev, dropLocation: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                  ) : (
                    <p className="text-sm text-gray-900">{student.dropLocation}</p>
                  )}
                </div>

                {/* Monthly Amount */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Monthly Amount
                  </label>
                  <p className="text-sm text-gray-900">₹{student.monthlyAmount.toLocaleString()}</p>
                  <p className="text-xs text-gray-500 mt-1">Set by admin during admission</p>
                </div>

                {/* Admission Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Admission Status
                  </label>
                  <div className="flex items-center space-x-2">
                    {getAdmissionStatusIcon(student.admissionStatus)}
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getAdmissionStatusColor(student.admissionStatus)}`}>
                      {student.admissionStatus.charAt(0).toUpperCase() + student.admissionStatus.slice(1)}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Submit/Cancel buttons for change requests */}
              {isRequestingChanges && (
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-end space-x-3">
                    <button
                      onClick={handleCancelChanges}
                      className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
                    >
                      <X className="w-4 h-4" />
                      <span>Cancel</span>
                    </button>
                    <button
                      onClick={handleRequestChanges}
                      disabled={loading}
                      className="flex items-center space-x-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50"
                    >
                      <Send className="w-4 h-4" />
                      <span>{loading ? 'Submitting...' : 'Submit Request'}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Change Requests */}
          {changeRequests.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900 flex items-center space-x-2">
                  <FileText className="w-5 h-5 text-orange-600" />
                  <span>Change Requests</span>
                </h2>
                <p className="text-sm text-gray-600 mt-1">Track your pending and processed change requests</p>
              </div>
              <div className="p-4 sm:p-6">
                <div className="space-y-4">
                  {changeRequests.map((request) => (
                    <div key={request.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium text-gray-900">{request.field}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRequestStatusColor(request.status)}`}>
                          {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">From:</span>
                          <p className="text-gray-900">{request.oldValue}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">To:</span>
                          <p className="text-gray-900">{request.newValue}</p>
                        </div>
                      </div>
                      <div className="mt-3 text-xs text-gray-500">
                        Requested on: {request.requestDate.toLocaleDateString()}
                      </div>
                      {request.adminResponse && (
                        <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm font-medium text-gray-900 mb-1">Admin Response:</p>
                          <p className="text-sm text-gray-700">{request.adminResponse}</p>
                          <p className="text-xs text-gray-500 mt-2">
                            Responded on: {request.responseDate?.toLocaleDateString()}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Account Information */}
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Account Information</h2>
            </div>
            <div className="p-4 sm:p-6">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Account Email</span>
                  <span className="text-sm font-medium text-gray-900">{currentUser?.email}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Account Status</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getAdmissionStatusColor(student.status)}`}>
                    {student.status.charAt(0).toUpperCase() + student.status.slice(1)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Member Since</span>
                  <span className="text-sm font-medium text-gray-900">
                    {student.admissionDate.toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AccountSettings 