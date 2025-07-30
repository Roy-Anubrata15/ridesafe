import { 
  User, 
  BookOpen, 
  DollarSign, 
  Award, 
  AlertCircle, 
  Phone, 
  Mail, 
  MapPin, 
  Star,
  Lock,
  FileText,
  Edit3
} from 'lucide-react'
import { useUserData } from '../../../../shared/contexts/UserDataContext'
import { Button, Card, CardHeader, CardTitle, CardContent } from '../../../../shared/components/ui'

interface OverviewTabProps {
  onTabChange?: (tab: string) => void
}

export const OverviewTab: React.FC<OverviewTabProps> = ({ onTabChange }) => {
  const { student, updateStudent } = useUserData()

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'inactive':
        return 'bg-red-100 text-red-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Welcome Section */}
      <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white border-0">
        <CardContent className="p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl lg:text-2xl font-bold mb-2">Welcome back, {student.guardianName}!</h2>
          <p className="text-blue-100 text-sm sm:text-base">
            {student.admissionStatus === 'approved' 
              ? 'Track your child\'s safe journey to school with RideSafe'
              : 'Complete your admission to start using our transportation services'
            }
          </p>
        </CardContent>
      </Card>

      {/* Admission Status Message */}
      {student.admissionStatus !== 'approved' && (
        <Card variant="outlined" className="bg-yellow-50 border-yellow-200">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div>
                <h3 className="text-sm sm:text-base font-medium text-yellow-900 mb-1">
                  {student.admissionStatus === 'pending' ? 'Admission Under Review' : 
                   student.admissionStatus === 'rejected' ? 'Admission Rejected' : 'Admission Required'}
                </h3>
                <p className="text-sm text-yellow-800">
                  {student.admissionStatus === 'pending' 
                    ? 'Your admission application is currently being reviewed by our admin team. You will be notified once it\'s approved.'
                    : student.admissionStatus === 'rejected'
                    ? 'Your admission application was rejected. Please review and reapply with updated information.'
                    : 'Please complete your admission form to start using our transportation services. Visit the Admission page to begin.'
                  }
                </p>
                {student.admissionStatus === 'rejected' && (
                  <Button 
                    variant="outline"
                    size="sm"
                    onClick={() => updateStudent({ admissionStatus: 'none' })}
                    className="mt-3 text-yellow-700 bg-yellow-100 hover:bg-yellow-200 border-yellow-300"
                  >
                    Reapply Now
                  </Button>
                )}
                {student.admissionStatus === 'none' && (
                  <Button 
                    variant="outline"
                    size="sm"
                    onClick={() => updateStudent({ admissionStatus: 'none' })}
                    className="mt-3 text-yellow-700 bg-yellow-100 hover:bg-yellow-200 border-yellow-300"
                  >
                    Apply for Admission
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 sm:gap-6">
        {/* Student Info - Show only if approved */}
        {student.admissionStatus === 'approved' && (
          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-600">Student</p>
                  <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">{student.name}</p>
                  <p className="text-xs sm:text-sm text-gray-500">{student.class}</p>
                </div>
                <User className="w-6 h-6 sm:w-8 sm:h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
        )}

        {/* School Info - Show only if approved */}
        {student.admissionStatus === 'approved' && (
          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-600">School</p>
                  <p className="text-sm sm:text-lg font-bold text-gray-900">{student.school}</p>
                  <p className="text-xs sm:text-sm text-gray-500">Active</p>
                </div>
                <BookOpen className="w-6 h-6 sm:w-8 sm:h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Monthly Fee - Show only if approved */}
        {student.admissionStatus === 'approved' && (
          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-600">Monthly Fee</p>
                  <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">₹2,500</p>
                  <p className="text-xs sm:text-sm text-gray-500">Next due: Feb 29</p>
                </div>
                <DollarSign className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Service Rating - Always show */}
        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600">Service Rating</p>
                <div className="flex items-center">
                  <Star className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400 fill-current" />
                  <span className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 ml-1">4.8</span>
                </div>
                <p className="text-xs sm:text-sm text-gray-500">Based on 127 reviews</p>
              </div>
              <Award className="w-6 h-6 sm:w-8 sm:h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        {/* Admission Status - Show if not approved */}
        {student.admissionStatus !== 'approved' && (
          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-600">Admission Status</p>
                  <p className={`text-lg sm:text-xl lg:text-2xl font-bold ${
                    student.admissionStatus === 'pending' ? 'text-yellow-600' : 
                    student.admissionStatus === 'rejected' ? 'text-red-600' : 'text-gray-600'
                  }`}>
                    {student.admissionStatus === 'pending' ? 'Pending' : 
                     student.admissionStatus === 'rejected' ? 'Rejected' : 'Not Applied'}
                  </p>
                  <p className="text-xs sm:text-sm text-gray-500">
                    {student.admissionStatus === 'pending' ? 'Under review' : 
                     student.admissionStatus === 'rejected' ? 'Please reapply' : 'Apply now'}
                  </p>
                </div>
                <AlertCircle className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Student Details - Show only if approved */}
      {student.admissionStatus === 'approved' && (
        <Card>
          <CardHeader>
            <CardTitle>Student Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-3 sm:mb-4 text-sm sm:text-base">Personal Details</h4>
                <div className="space-y-2 sm:space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600 text-xs sm:text-sm">Name:</span>
                    <span className="font-medium text-xs sm:text-sm">{student.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 text-xs sm:text-sm">Class:</span>
                    <span className="font-medium text-xs sm:text-sm">{student.class}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 text-xs sm:text-sm">School:</span>
                    <span className="font-medium text-xs sm:text-sm">{student.school}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 text-xs sm:text-sm">Status:</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(student.status)}`}>
                      {student.status}
                    </span>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-3 sm:mb-4 text-sm sm:text-base">Contact Information</h4>
                <div className="space-y-2 sm:space-y-3">
                  <div className="flex items-center space-x-2 sm:space-x-3">
                    <Phone className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
                    <span className="text-gray-600 text-xs sm:text-sm">{student.guardianPhone}</span>
                  </div>
                  <div className="flex items-center space-x-2 sm:space-x-3">
                    <Mail className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
                    <span className="text-gray-600 text-xs sm:text-sm">{student.guardianEmail}</span>
                  </div>
                  <div className="flex items-center space-x-2 sm:space-x-3">
                    <MapPin className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
                    <span className="text-gray-600 text-xs sm:text-sm">{student.pickupLocation}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions - Show only if approved */}
      {student.admissionStatus === 'approved' && (
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <Button
                onClick={() => onTabChange?.('payments')}
                className="flex items-center space-x-3 p-4 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white h-auto"
              >
                <DollarSign className="w-6 h-6" />
                <div className="text-left">
                  <p className="font-medium">Payments</p>
                  <p className="text-sm text-green-100">Manage your payments</p>
                </div>
              </Button>
              <Button
                onClick={() => onTabChange?.('tracking')}
                className="flex items-center space-x-3 p-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white h-auto"
              >
                <MapPin className="w-6 h-6" />
                <div className="text-left">
                  <p className="font-medium">Live Tracking</p>
                  <p className="text-sm text-blue-100">Track your child's journey</p>
                </div>
              </Button>
              <Button
                onClick={() => onTabChange?.('change-requests')}
                className="flex items-center space-x-3 p-4 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white h-auto"
              >
                <Edit3 className="w-6 h-6" />
                <div className="text-left">
                  <p className="font-medium">Change Requests</p>
                  <p className="text-sm text-purple-100">Update your information</p>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions - Show for non-approved users */}
      {student.admissionStatus !== 'approved' && (
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="bg-gray-50 rounded-lg p-6">
                <Lock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h4 className="text-lg font-medium text-gray-900 mb-2">Access Restricted</h4>
                <p className="text-gray-600 mb-4">
                  {student.admissionStatus === 'pending' 
                    ? 'Payments and tracking will be available once your admission is approved.'
                    : student.admissionStatus === 'rejected'
                    ? 'Your admission was rejected. Please reapply to access payments and tracking features.'
                    : 'Please complete your admission form to access payments and tracking features.'
                  }
                </p>
                <Button
                  onClick={() => onTabChange?.('admission')}
                  className="inline-flex items-center"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  {student.admissionStatus === 'pending' ? 'Check Admission Status' : 
                   student.admissionStatus === 'rejected' ? 'Reapply for Admission' : 'Apply for Admission'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Activity - Show only if approved */}
      {student.admissionStatus === 'approved' && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 sm:space-y-4">
              <div className="flex items-center space-x-3 sm:space-x-4">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-900">Student picked up from home</p>
                  <p className="text-xs text-gray-500">Today at 7:30 AM</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 sm:space-x-4">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-900">Payment received for January</p>
                  <p className="text-xs text-gray-500">Yesterday at 2:15 PM</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 sm:space-x-4">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-900">Review submitted for driver</p>
                  <p className="text-xs text-gray-500">2 days ago</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 