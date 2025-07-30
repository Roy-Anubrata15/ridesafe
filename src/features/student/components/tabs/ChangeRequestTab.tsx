import React, { useState, useEffect } from 'react'
import { FileText, Plus, X, Clock, CheckCircle, XCircle } from 'lucide-react'
import { useUserData } from '../../../../shared/contexts/UserDataContext'
import { useAuth } from '../../../../shared/contexts/AuthContext'
import { submitChangeRequest, getChangeRequests } from '../../../../features/admin/services/admissionService'
import { Button, Card, CardHeader, CardTitle, CardContent, Input } from '../../../../shared/components/ui'
import toast from 'react-hot-toast'
import { subscribeToUserRealTimeUpdates, RealTimeSyncCallbacks } from '../../../../shared/services/realTimeSyncService'

interface ChangeRequest {
  id: string
  userEmail: string
  field: string
  currentValue: string
  newValue: string
  reason: string
  status: 'pending' | 'approved' | 'rejected'
  requestDate: Date
  reviewedAt?: Date
  adminResponse?: string
}

export const ChangeRequestTab: React.FC = () => {
  const { student } = useUserData()
  const { currentUser } = useAuth()
  const [showRequestForm, setShowRequestForm] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [changeRequests, setChangeRequests] = useState<ChangeRequest[]>([])
  const [selectedField, setSelectedField] = useState('')
  const [newValue, setNewValue] = useState('')
  const [reason, setReason] = useState('')
  const [loading, setLoading] = useState(true)

  const editableFields = [
    { key: 'Student Name', value: student.name, currentValue: student.name },
    { key: 'Class', value: student.class, currentValue: student.class },
    { key: 'School', value: student.school, currentValue: student.school },
    { key: 'Pickup Location', value: student.pickupLocation, currentValue: student.pickupLocation },
    { key: 'Drop Location', value: student.dropLocation, currentValue: student.dropLocation },
    { key: 'Guardian Name', value: student.guardianName, currentValue: student.guardianName },
    { key: 'Guardian Phone', value: student.guardianPhone, currentValue: student.guardianPhone },
    { key: 'Guardian Email', value: student.guardianEmail, currentValue: student.guardianEmail },
    { key: 'Alternate Phone', value: student.alternatePhone, currentValue: student.alternatePhone },
    { key: 'Emergency Contact', value: student.emergencyContact || '', currentValue: student.emergencyContact || '' }
  ]

  // Load change requests on component mount
  useEffect(() => {
    const loadChangeRequests = async () => {
      if (!currentUser?.email) return
      
      try {
        const requests = await getChangeRequests()
        const userRequests = requests.filter(req => req.userEmail === currentUser.email)
        setChangeRequests(userRequests)
      } catch (error) {
        console.error('Error loading change requests:', error)
        toast.error('Failed to load change requests')
      } finally {
        setLoading(false)
      }
    }

    loadChangeRequests()
  }, [currentUser?.email])

  // Set up real-time sync for change requests
  useEffect(() => {
    if (!currentUser?.email) return

    const syncCallbacks: RealTimeSyncCallbacks = {
      onChangeRequestUpdate: (email, requestData) => {
        if (email === currentUser.email) {
          setChangeRequests(prev => {
            const existingIndex = prev.findIndex(req => req.id === requestData.id)
            if (existingIndex >= 0) {
              // Update existing request
              const updated = [...prev]
              updated[existingIndex] = requestData as ChangeRequest
              return updated
            } else {
              // Add new request
              return [requestData as ChangeRequest, ...prev]
            }
          })
        }
      }
    }

    const unsubscribe = subscribeToUserRealTimeUpdates(currentUser.email, syncCallbacks)
    return unsubscribe
  }, [currentUser?.email])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedField || !newValue || !reason.trim()) {
      toast.error('Please fill in all required fields')
      return
    }

    setIsSubmitting(true)
    
    try {
      const requestData = {
        userEmail: currentUser?.email || '',
        field: selectedField,
        currentValue: editableFields.find(f => f.key === selectedField)?.currentValue || '',
        newValue,
        reason: reason.trim()
      }

      const requestId = await submitChangeRequest(requestData)
      
      // Add to local state with the real ID
      const newRequest: ChangeRequest = {
        id: requestId,
        ...requestData,
        status: 'pending',
        requestDate: new Date()
      }
      
      setChangeRequests(prev => [newRequest, ...prev])
      
      // Reset form
      setShowRequestForm(false)
      setSelectedField('')
      setNewValue('')
      setReason('')
      
      toast.success('Change request submitted successfully!')
    } catch (error) {
      console.error('Error submitting change request:', error)
      toast.error(`Failed to submit change request: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />
      case 'approved':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-500" />
      default:
        return <Clock className="w-4 h-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'approved':
        return 'bg-green-100 text-green-800'
      case 'rejected':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle>Change Requests</CardTitle>
          <p className="text-sm text-gray-600">
            Request changes to your information. All requests will be reviewed by our admin team.
          </p>
        </CardHeader>
      </Card>

      {/* Create New Request Button */}
      {!showRequestForm && (
        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="text-center">
              <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Submit Change Request</h3>
              <p className="text-gray-600 mb-6">
                Need to update your information? Submit a change request and our admin team will review it.
              </p>
              <Button 
                onClick={() => setShowRequestForm(true)}
                className="inline-flex items-center"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Change Request
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Change Request Form */}
      {showRequestForm && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Submit Change Request</CardTitle>
                <p className="text-sm text-gray-600 mt-1">Fill out the form below to request a change</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowRequestForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Field Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Field to Change *</label>
                <select
                  required
                  value={selectedField}
                  onChange={(e) => {
                    setSelectedField(e.target.value)
                    const field = editableFields.find(f => f.key === e.target.value)
                    setNewValue(field?.currentValue || '')
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select a field to change</option>
                  {editableFields.map((field) => (
                    <option key={field.key} value={field.key}>
                      {field.key} (Current: {field.currentValue || 'Not set'})
                    </option>
                  ))}
                </select>
              </div>

              {/* New Value */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">New Value *</label>
                <Input
                  type="text"
                  required
                  value={newValue}
                  onChange={(e) => setNewValue(e.target.value)}
                  placeholder="Enter the new value"
                />
              </div>

              {/* Reason */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Reason for Change *</label>
                <textarea
                  required
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Please explain why you need this change"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                />
              </div>

              {/* Form Actions */}
              <div className="flex justify-end space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowRequestForm(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Request'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Change Requests List */}
      {loading ? (
        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600 mt-2">Loading change requests...</p>
            </div>
          </CardContent>
        </Card>
      ) : changeRequests.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Your Change Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {changeRequests.map((request) => (
                <div key={request.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        {getStatusIcon(request.status)}
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(request.status)}`}>
                          {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                        </span>
                      </div>
                      <h4 className="font-medium text-gray-900 mb-1">
                        {request.field}
                      </h4>
                      <div className="text-sm text-gray-600 space-y-1">
                        <p><span className="font-medium">Current:</span> {request.currentValue || 'Not set'}</p>
                        <p><span className="font-medium">New:</span> {request.newValue}</p>
                        <p><span className="font-medium">Reason:</span> {request.reason}</p>
                        {request.adminResponse && (
                          <p><span className="font-medium">Admin Response:</span> {request.adminResponse}</p>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        Submitted: {request.requestDate.toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="text-center">
              <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Change Requests</h3>
              <p className="text-gray-600">
                You haven't submitted any change requests yet. Click the button above to create your first request.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 