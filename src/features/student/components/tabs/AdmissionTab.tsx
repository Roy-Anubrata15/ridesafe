import React, { useState } from 'react'
import { FileText, Plus, X } from 'lucide-react'
import { useUserData } from '../../../../shared/contexts/UserDataContext'
import { useAuth } from '../../../../shared/contexts/AuthContext'
import { submitAdmissionForm } from '../../../../features/admin/services/admissionService'
import { Button, Card, CardHeader, CardTitle, CardContent, Input } from '../../../../shared/components/ui'
import toast from 'react-hot-toast'

export const AdmissionTab: React.FC = () => {
  const { student, updateStudent } = useUserData()
  const { currentUser } = useAuth()
  const [showAdmissionForm, setShowAdmissionForm] = useState(false)
  const [isSubmittingAdmission, setIsSubmittingAdmission] = useState(false)
  const [admissionForm, setAdmissionForm] = useState({
    userEmail: currentUser?.email || '',
    studentName: '',
    guardianName: '',
    guardianEmail: '',
    guardianPhone: '',
    alternatePhone: '',
    studentClass: '',
    schoolName: '',
    pickupLocation: '',
    dropLocation: '',
    emergencyContact: '',
    medicalConditions: '',
    specialRequirements: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmittingAdmission(true)
    
    try {
      await submitAdmissionForm(admissionForm)
      updateStudent({ admissionStatus: 'pending' })
      setShowAdmissionForm(false)
      toast.success('Admission form submitted successfully!')
    } catch (error) {
      toast.error('Failed to submit admission form')
    } finally {
      setIsSubmittingAdmission(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setAdmissionForm(prev => ({ ...prev, [field]: value }))
  }

  // Show admission status if already applied
  if (student.admissionStatus === 'pending' || student.admissionStatus === 'approved' || student.admissionStatus === 'rejected') {
    return (
      <div className="space-y-4 sm:space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Admission Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="bg-gray-50 rounded-lg p-6">
                <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {student.admissionStatus === 'pending' ? 'Application Under Review' :
                   student.admissionStatus === 'approved' ? 'Application Approved' : 'Application Rejected'}
                </h3>
                <p className="text-gray-600 mb-4">
                  {student.admissionStatus === 'pending' 
                    ? 'Your admission application is currently being reviewed by our admin team.'
                    : student.admissionStatus === 'approved'
                    ? 'Your admission has been approved! You can now access all features.'
                    : 'Your admission application was rejected. Please review and reapply.'
                  }
                </p>
                {student.admissionStatus === 'rejected' && (
                  <Button 
                    onClick={() => {
                      updateStudent({ admissionStatus: 'none' })
                      setShowAdmissionForm(true)
                    }}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Reapply Now
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Show admission portal with button to create form
  if (!showAdmissionForm) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Admission Portal</CardTitle>
            <p className="text-sm text-gray-600">Apply for transportation services</p>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Admission Application</h3>
              <p className="text-gray-600 mb-6">
                Complete the admission form to apply for transportation services. 
                Your application will be reviewed by our admin team.
              </p>
              <Button 
                onClick={() => setShowAdmissionForm(true)}
                className="inline-flex items-center"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Admission Form
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Show admission form
  return (
    <div className="space-y-4 sm:space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Admission Application</CardTitle>
              <p className="text-sm text-gray-600 mt-1">Complete the form below to apply for transportation services</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAdmissionForm(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Guardian Information */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Guardian Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Guardian Name *</label>
                  <Input
                    type="text"
                    required
                    value={admissionForm.guardianName}
                    onChange={(e) => handleInputChange('guardianName', e.target.value)}
                    placeholder="Enter guardian's full name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Guardian Email *</label>
                  <Input
                    type="email"
                    required
                    value={admissionForm.guardianEmail}
                    onChange={(e) => handleInputChange('guardianEmail', e.target.value)}
                    placeholder="Enter guardian's email"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Guardian Phone *</label>
                  <Input
                    type="tel"
                    required
                    value={admissionForm.guardianPhone}
                    onChange={(e) => handleInputChange('guardianPhone', e.target.value)}
                    placeholder="Enter guardian's phone number"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Alternate Phone</label>
                  <Input
                    type="tel"
                    value={admissionForm.alternatePhone}
                    onChange={(e) => handleInputChange('alternatePhone', e.target.value)}
                    placeholder="Enter alternate phone number"
                  />
                </div>
              </div>
            </div>

            {/* Student Information */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Student Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Student Name *</label>
                  <Input
                    type="text"
                    required
                    value={admissionForm.studentName}
                    onChange={(e) => handleInputChange('studentName', e.target.value)}
                    placeholder="Enter student's full name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Student Class *</label>
                  <select
                    required
                    value={admissionForm.studentClass}
                    onChange={(e) => handleInputChange('studentClass', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select Class</option>
                    <option value="Nursery">Nursery</option>
                    <option value="LKG">LKG</option>
                    <option value="UKG">UKG</option>
                    <option value="Class 1">Class 1</option>
                    <option value="Class 2">Class 2</option>
                    <option value="Class 3">Class 3</option>
                    <option value="Class 4">Class 4</option>
                    <option value="Class 5">Class 5</option>
                    <option value="Class 6">Class 6</option>
                    <option value="Class 7">Class 7</option>
                    <option value="Class 8">Class 8</option>
                    <option value="Class 9">Class 9</option>
                    <option value="Class 10">Class 10</option>
                    <option value="Class 11">Class 11</option>
                    <option value="Class 12">Class 12</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">School Name *</label>
                  <Input
                    type="text"
                    required
                    value={admissionForm.schoolName}
                    onChange={(e) => handleInputChange('schoolName', e.target.value)}
                    placeholder="Enter school name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Emergency Contact</label>
                  <Input
                    type="tel"
                    value={admissionForm.emergencyContact}
                    onChange={(e) => handleInputChange('emergencyContact', e.target.value)}
                    placeholder="Enter emergency contact number"
                  />
                </div>
              </div>
            </div>

            {/* Additional Information */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Additional Information</h3>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Medical Conditions (if any)</label>
                  <textarea
                    value={admissionForm.medicalConditions}
                    onChange={(e) => handleInputChange('medicalConditions', e.target.value)}
                    placeholder="Enter any medical conditions or allergies"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Special Requirements (if any)</label>
                  <textarea
                    value={admissionForm.specialRequirements}
                    onChange={(e) => handleInputChange('specialRequirements', e.target.value)}
                    placeholder="Enter any special requirements or accommodations needed"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows={3}
                  />
                </div>
              </div>
            </div>

            {/* Location Information */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Location Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Pickup Location *</label>
                  <Input
                    type="text"
                    required
                    value={admissionForm.pickupLocation}
                    onChange={(e) => handleInputChange('pickupLocation', e.target.value)}
                    placeholder="Enter pickup address"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Drop Location *</label>
                  <Input
                    type="text"
                    required
                    value={admissionForm.dropLocation}
                    onChange={(e) => handleInputChange('dropLocation', e.target.value)}
                    placeholder="Enter drop address"
                  />
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end space-x-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowAdmissionForm(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmittingAdmission}
              >
                {isSubmittingAdmission ? 'Submitting...' : 'Send Request'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
} 