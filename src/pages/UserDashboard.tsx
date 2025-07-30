import { useState } from 'react'
import { 
  User, 
  MapPin, 
  Clock, 
  DollarSign, 
  Star, 
  Plus, 
  Phone,
  Mail,
  Shield,
  BookOpen,
  FileText,
  Bell,
  LogOut,
  Home,
  Bus,
  GraduationCap,
  Users,
  Award,
  CheckCircle,
  AlertCircle,
  Check,
  Lock,
  X
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useUserData } from '../contexts/UserDataContext'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'



interface School {
  id: string
  name: string
  address: string
  phone: string
  email: string
  website: string
  rating: number
  studentsCount: number
  services: string[]
  image: string
}

interface Service {
  id: string
  name: string
  description: string
  price: number
  features: string[]
  icon: string
}

interface Payment {
  id: string
  month: string
  amount: number
  status: 'paid' | 'pending' | 'overdue'
  dueDate: Date
  paidDate?: Date
  paymentMethod: string
}

interface Review {
  id: string
  rating: number
  comment: string
  date: Date
  driverName: string
  vehicleNumber: string
}

const UserDashboard = () => {
  const { logout } = useAuth()
  const { student, updateStudent } = useUserData()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('overview')




  const [schools] = useState<School[]>([
    {
      id: '1',
      name: 'St. Mary\'s School',
      address: '456 School Road, City Center, Delhi',
      phone: '+91 11 2345 6789',
      email: 'info@stmarys.edu.in',
      website: 'www.stmarys.edu.in',
      rating: 4.8,
      studentsCount: 1250,
      services: ['Morning Pickup', 'Afternoon Drop', 'Evening Pickup', 'Weekend Service'],
      image: '/school1.jpg'
    },
    {
      id: '2',
      name: 'Delhi Public School',
      address: '789 Education Lane, New Delhi',
      phone: '+91 11 3456 7890',
      email: 'contact@dps.edu.in',
      website: 'www.dps.edu.in',
      rating: 4.6,
      studentsCount: 2100,
      services: ['Morning Pickup', 'Afternoon Drop', 'Evening Pickup'],
      image: '/school2.jpg'
    },
    {
      id: '3',
      name: 'Modern School',
      address: '321 Learning Street, Delhi',
      phone: '+91 11 4567 8901',
      email: 'info@modernschool.edu.in',
      website: 'www.modernschool.edu.in',
      rating: 4.7,
      studentsCount: 1800,
      services: ['Morning Pickup', 'Afternoon Drop', 'Evening Pickup', 'Weekend Service', 'Holiday Service'],
      image: '/school3.jpg'
    }
  ])

  const [services] = useState<Service[]>([
    {
      id: '1',
      name: 'Standard Transportation',
      description: 'Daily pickup and drop service to and from school',
      price: 2500,
      features: ['Morning Pickup', 'Afternoon Drop', 'GPS Tracking', 'Professional Drivers', 'Safe Vehicles'],
      icon: '🚌'
    },
    {
      id: '2',
      name: 'Premium Transportation',
      description: 'Enhanced service with additional safety features',
      price: 3500,
      features: ['All Standard Features', 'Live Video Feed', 'Temperature Monitoring', 'Priority Support', 'Flexible Timings'],
      icon: '⭐'
    },
    {
      id: '3',
      name: 'Weekend Service',
      description: 'Transportation for weekend activities and classes',
      price: 500,
      features: ['Weekend Pickup/Drop', 'Activity Center Transport', 'Flexible Scheduling', 'Same Safety Standards'],
      icon: '📅'
    }
  ])

  const [payments] = useState<Payment[]>([
    {
      id: '1',
      month: 'January 2024',
      amount: 2500,
      status: 'paid',
      dueDate: new Date('2024-01-31'),
      paidDate: new Date('2024-01-25'),
      paymentMethod: 'PayPal'
    },
    {
      id: '2',
      month: 'February 2024',
      amount: 2500,
      status: 'pending',
      dueDate: new Date('2024-02-29'),
      paymentMethod: 'PayPal'
    },
    {
      id: '3',
      month: 'March 2024',
      amount: 2500,
      status: 'overdue',
      dueDate: new Date('2024-03-31'),
      paymentMethod: 'PayPal'
    }
  ])

  const [reviews] = useState<Review[]>([
    {
      id: '1',
      rating: 5,
      comment: 'Excellent service! Driver is very punctual and professional. My child feels safe and comfortable.',
      date: new Date('2024-01-20'),
      driverName: 'Rajesh Kumar',
      vehicleNumber: 'DL-01-AB-1234'
    },
    {
      id: '2',
      rating: 4,
      comment: 'Good service overall. Vehicle is clean and safe. Driver is friendly and responsible.',
      date: new Date('2024-01-15'),
      driverName: 'Rajesh Kumar',
      vehicleNumber: 'DL-01-AB-1234'
    }
  ])

  const handleLogout = async () => {
    try {
      await logout()
      toast.success('Logged out successfully!')
      navigate('/login')
    } catch (error) {
      toast.error('Failed to log out')
    }
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Home },
    { id: 'services', label: 'Services', icon: Bus },
    { id: 'schools', label: 'Schools', icon: GraduationCap },
    { id: 'tracking', label: 'Live Tracking', icon: MapPin },
    { id: 'payments', label: 'Payments', icon: DollarSign },
    { id: 'reviews', label: 'Reviews', icon: Star },
    { id: 'admission', label: 'Admission', icon: FileText },

  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100'
      case 'inactive': return 'text-red-600 bg-red-100'
      case 'pending': return 'text-yellow-600 bg-yellow-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'text-green-600 bg-green-100'
      case 'pending': return 'text-yellow-600 bg-yellow-100'
      case 'overdue': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const renderOverview = () => (
    <div className="space-y-4 sm:space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-4 sm:p-6 text-white">
        <h2 className="text-lg sm:text-xl lg:text-2xl font-bold mb-2">Welcome back, {student.guardianName}!</h2>
        <p className="text-blue-100 text-sm sm:text-base">
          {student.admissionStatus === 'approved' 
            ? 'Track your child\'s safe journey to school with RideSafe'
            : 'Complete your admission to start using our transportation services'
          }
        </p>
      </div>

      {/* Admission Status Message */}
      {student.admissionStatus !== 'approved' && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 sm:p-6">
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
                <button 
                  onClick={() => setActiveTab('admission')}
                  className="mt-3 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-yellow-700 bg-yellow-100 hover:bg-yellow-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                >
                  Reapply Now
                </button>
              )}
              {student.admissionStatus === 'none' && (
                <button 
                  onClick={() => setActiveTab('admission')}
                  className="mt-3 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-yellow-700 bg-yellow-100 hover:bg-yellow-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                >
                  Apply for Admission
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 sm:gap-6">
        {/* Student Info - Show only if approved */}
        {student.admissionStatus === 'approved' && (
          <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600">Student</p>
                <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">{student.name}</p>
                <p className="text-xs sm:text-sm text-gray-500">{student.class}</p>
              </div>
              <User className="w-6 h-6 sm:w-8 sm:h-8 text-blue-500" />
            </div>
          </div>
        )}

        {/* School Info - Show only if approved */}
        {student.admissionStatus === 'approved' && (
          <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600">School</p>
                <p className="text-sm sm:text-lg font-bold text-gray-900">{student.school}</p>
                <p className="text-xs sm:text-sm text-gray-500">Active</p>
              </div>
              <BookOpen className="w-6 h-6 sm:w-8 sm:h-8 text-green-500" />
            </div>
          </div>
        )}

        {/* Monthly Fee - Show only if approved */}
        {student.admissionStatus === 'approved' && (
          <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600">Monthly Fee</p>
                <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">₹2,500</p>
                <p className="text-xs sm:text-sm text-gray-500">Next due: Feb 29</p>
              </div>
              <DollarSign className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-500" />
            </div>
          </div>
        )}

        {/* Service Rating - Always show */}
        <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm border">
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
        </div>

        {/* Admission Status - Show if not approved */}
        {student.admissionStatus !== 'approved' && (
          <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm border">
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
          </div>
        )}
      </div>

      {/* Student Details - Show only if approved */}
      {student.admissionStatus === 'approved' && (
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200">
            <h3 className="text-base sm:text-lg font-medium text-gray-900">Student Information</h3>
          </div>
          <div className="p-4 sm:p-6">
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
          </div>
        </div>
      )}

      {/* Quick Actions - Show only if approved */}
      {student.admissionStatus === 'approved' && (
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200">
            <h3 className="text-base sm:text-lg font-medium text-gray-900">Quick Actions</h3>
          </div>
          <div className="p-4 sm:p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <button
                onClick={() => setActiveTab('payments')}
                className="flex items-center space-x-3 p-4 bg-gradient-to-r from-green-500 to-green-600 rounded-lg text-white hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-sm"
              >
                <DollarSign className="w-6 h-6" />
                <div className="text-left">
                  <p className="font-medium">Payments</p>
                  <p className="text-sm text-green-100">Manage your payments</p>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('tracking')}
                className="flex items-center space-x-3 p-4 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg text-white hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-sm"
              >
                <MapPin className="w-6 h-6" />
                <div className="text-left">
                  <p className="font-medium">Live Tracking</p>
                  <p className="text-sm text-blue-100">Track your child's journey</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions - Show for non-approved users */}
      {student.admissionStatus !== 'approved' && (
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200">
            <h3 className="text-base sm:text-lg font-medium text-gray-900">Quick Actions</h3>
          </div>
          <div className="p-4 sm:p-6">
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
                <button
                  onClick={() => setActiveTab('admission')}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  {student.admissionStatus === 'pending' ? 'Check Admission Status' : 
                   student.admissionStatus === 'rejected' ? 'Reapply for Admission' : 'Apply for Admission'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recent Activity - Show only if approved */}
      {student.admissionStatus === 'approved' && (
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200">
            <h3 className="text-base sm:text-lg font-medium text-gray-900">Recent Activity</h3>
          </div>
          <div className="p-4 sm:p-6">
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
          </div>
        </div>
      )}
    </div>
  )

  const renderServices = () => (
    <div className="space-y-4 sm:space-y-6">
      {/* Services Header */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200">
          <h3 className="text-base sm:text-lg font-medium text-gray-900">Our Services</h3>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">Choose from our comprehensive transportation services</p>
        </div>
        <div className="p-4 sm:p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            {services.map((service) => (
              <div key={service.id} className="border border-gray-200 rounded-lg p-4 sm:p-6 hover:shadow-md transition-shadow">
                <div className="text-center mb-3 sm:mb-4">
                  <div className="text-2xl sm:text-4xl mb-2">{service.icon}</div>
                  <h4 className="text-sm sm:text-lg font-semibold text-gray-900">{service.name}</h4>
                  <p className="text-gray-600 text-sm">{service.description}</p>
                </div>
                <div className="text-center mb-4">
                  <span className="text-2xl font-bold text-primary-600">₹{service.price}</span>
                  <span className="text-gray-500 text-sm">/month</span>
                </div>
                <ul className="space-y-2 mb-6">
                  {service.features.map((feature, index) => (
                    <li key={index} className="flex items-center text-sm text-gray-600">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <button className="w-full btn-primary">
                  Select Service
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Why Choose Us */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Why Choose RideSafe?</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Shield className="w-6 h-6 text-blue-600" />
              </div>
              <h4 className="font-medium text-gray-900 mb-2">Safety First</h4>
              <p className="text-sm text-gray-600">GPS tracking, professional drivers, and safe vehicles</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Clock className="w-6 h-6 text-green-600" />
              </div>
              <h4 className="font-medium text-gray-900 mb-2">Punctual Service</h4>
              <p className="text-sm text-gray-600">On-time pickup and drop with real-time updates</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <h4 className="font-medium text-gray-900 mb-2">Experienced Team</h4>
              <p className="text-sm text-gray-600">Trained drivers and support staff</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Award className="w-6 h-6 text-yellow-600" />
              </div>
              <h4 className="font-medium text-gray-900 mb-2">Quality Assured</h4>
              <p className="text-sm text-gray-600">Regular maintenance and quality checks</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  const renderSchools = () => (
    <div className="space-y-6">
      {/* Schools Header */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Partner Schools</h3>
          <p className="text-sm text-gray-600 mt-1">We provide transportation services to these prestigious schools</p>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {schools.map((school) => (
              <div key={school.id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                <div className="h-48 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <GraduationCap className="w-16 h-16 text-white" />
                </div>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-lg font-semibold text-gray-900">{school.name}</h4>
                    <div className="flex items-center">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="text-sm font-medium text-gray-900 ml-1">{school.rating}</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{school.address}</p>
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <Phone className="w-4 h-4 mr-2" />
                      {school.phone}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Mail className="w-4 h-4 mr-2" />
                      {school.email}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Users className="w-4 h-4 mr-2" />
                      {school.studentsCount} students
                    </div>
                  </div>
                  <div className="mb-4">
                    <h5 className="text-sm font-medium text-gray-900 mb-2">Services Offered:</h5>
                    <div className="flex flex-wrap gap-1">
                      {school.services.map((service, index) => (
                        <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                          {service}
                        </span>
                      ))}
                    </div>
                  </div>
                  <button className="w-full btn-primary">
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )

  const renderTracking = () => {
    // Check if user has access to tracking
    if (student.admissionStatus !== 'approved') {
      return (
        <div className="space-y-4 sm:space-y-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex items-start space-x-3">
              <Lock className="w-6 h-6 text-red-600 mt-1" />
              <div>
                <h3 className="text-lg font-medium text-red-900 mb-2">Access Restricted</h3>
                <p className="text-red-800 mb-4">
                  {student.admissionStatus === 'pending' 
                    ? 'Live tracking will be available once your admission is approved.'
                    : 'Please complete your admission form to access tracking features.'
                  }
                </p>
                <button
                  onClick={() => setActiveTab('schools')}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                >
                  {student.admissionStatus === 'pending' ? 'Check Admission Status' : 'Apply for Admission'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )
    }

    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Live Tracking</h3>
          </div>
          <div className="p-6">
          <div className="bg-gray-100 rounded-lg h-64 flex items-center justify-center">
            <div className="text-center">
              <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Map integration coming soon...</p>
              <p className="text-sm text-gray-500">Real-time tracking of your child's vehicle</p>
            </div>
          </div>
          
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-blue-50 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">Current Status</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-blue-700">Status:</span>
                  <span className="font-medium text-blue-900">On Route</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700">Driver:</span>
                  <span className="font-medium text-blue-900">Rajesh Kumar</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700">Vehicle:</span>
                  <span className="font-medium text-blue-900">DL-01-AB-1234</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700">ETA:</span>
                  <span className="font-medium text-blue-900">8:15 AM</span>
                </div>
              </div>
            </div>
            
            <div className="bg-green-50 rounded-lg p-4">
              <h4 className="font-medium text-green-900 mb-2">Route Information</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-green-700">Pickup:</span>
                  <span className="font-medium text-green-900">7:30 AM</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-green-700">Drop:</span>
                  <span className="font-medium text-green-900">8:15 AM</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-green-700">Distance:</span>
                  <span className="font-medium text-green-900">5.2 km</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-green-700">Duration:</span>
                  <span className="font-medium text-green-900">45 min</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    )
  }

  const renderPayments = () => {
    // Check if user has access to payments
    if (student.admissionStatus !== 'approved') {
      return (
        <div className="space-y-4 sm:space-y-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex items-start space-x-3">
              <Lock className="w-6 h-6 text-red-600 mt-1" />
              <div>
                <h3 className="text-lg font-medium text-red-900 mb-2">Access Restricted</h3>
                <p className="text-red-800 mb-4">
                  {student.admissionStatus === 'pending' 
                    ? 'Payments will be available once your admission is approved.'
                    : 'Please complete your admission form to access payment features.'
                  }
                </p>
                <button
                  onClick={() => setActiveTab('schools')}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                >
                  {student.admissionStatus === 'pending' ? 'Check Admission Status' : 'Apply for Admission'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )
    }

    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900">Payment History</h3>
            <button className="btn-primary">
              <Plus className="w-4 h-4 mr-2" />
              Make Payment
            </button>
          </div>
        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Month
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Due Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {payments.map((payment) => (
                  <tr key={payment.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {payment.month}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ₹{payment.amount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(payment.status)}`}>
                        {payment.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {payment.dueDate.toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {payment.status === 'pending' && (
                        <button className="text-primary-600 hover:text-primary-900">
                          Pay Now
                        </button>
                      )}
                      {payment.status === 'paid' && (
                        <span className="text-green-600">Paid on {payment.paidDate?.toLocaleDateString()}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
    )
  }

  const renderReviews = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-900">Reviews & Ratings</h3>
          <button className="btn-primary">
            <Plus className="w-4 h-4 mr-2" />
            Write Review
          </button>
        </div>
        <div className="p-6">
          <div className="space-y-6">
            {reviews.map((review) => (
              <div key={review.id} className="border-b border-gray-200 pb-6 last:border-b-0">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-gray-500">{review.rating}/5</span>
                  </div>
                  <span className="text-sm text-gray-500">{review.date.toLocaleDateString()}</span>
                </div>
                <p className="mt-2 text-gray-700">{review.comment}</p>
                <div className="mt-3 flex items-center space-x-4 text-sm text-gray-500">
                  <span>Driver: {review.driverName}</span>
                  <span>Vehicle: {review.vehicleNumber}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )

  // Admission form state - moved outside render function
  const [showAdmissionForm, setShowAdmissionForm] = useState(false)
  const [admissionForm, setAdmissionForm] = useState({
    guardianName: '',
    guardianEmail: '',
    guardianPhone: '',
    alternatePhone: '',
    studentClass: '',
    schoolName: '',
    pickupLocation: '',
    dropLocation: ''
  })

  const [isSubmittingAdmission, setIsSubmittingAdmission] = useState(false)

  const renderAdmission = () => {

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault()
      setIsSubmittingAdmission(true)
      
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 2000))
        
        // Update student status to pending
        updateStudent({
          admissionStatus: 'pending',
          name: admissionForm.guardianName,
          class: admissionForm.studentClass,
          school: admissionForm.schoolName,
          pickupLocation: admissionForm.pickupLocation,
          dropLocation: admissionForm.dropLocation,
          guardianName: admissionForm.guardianName,
          guardianEmail: admissionForm.guardianEmail,
          guardianPhone: admissionForm.guardianPhone,
          alternatePhone: admissionForm.alternatePhone
        })
        
        toast.success('Admission form submitted successfully! You will be notified once approved.')
        setShowAdmissionForm(false)
        setActiveTab('overview')
      } catch (error) {
        toast.error('Failed to submit admission form. Please try again.')
      } finally {
        setIsSubmittingAdmission(false)
      }
    }

    const handleInputChange = (field: string, value: string) => {
      setAdmissionForm(prev => ({
        ...prev,
        [field]: value
      }))
    }

    // If already applied, show status
    if (student.admissionStatus === 'pending') {
      return (
        <div className="space-y-4 sm:space-y-6">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-6 h-6 text-yellow-600 mt-1" />
              <div>
                <h3 className="text-lg font-medium text-yellow-900 mb-2">Admission Under Review</h3>
                <p className="text-yellow-800 mb-4">
                  Your admission application has been submitted and is currently being reviewed by our admin team. 
                  You will receive a notification once the decision is made.
                </p>
                <div className="bg-white rounded-lg p-4 border border-yellow-200">
                  <h4 className="font-medium text-gray-900 mb-3">Submitted Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Student Name:</span>
                      <p className="font-medium">{student.name}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Class:</span>
                      <p className="font-medium">{student.class}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">School:</span>
                      <p className="font-medium">{student.school}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Pickup Location:</span>
                      <p className="font-medium">{student.pickupLocation}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    }

    // If rejected, show reapply option
    if (student.admissionStatus === 'rejected') {
      return (
        <div className="space-y-4 sm:space-y-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-6 h-6 text-red-600 mt-1" />
              <div>
                <h3 className="text-lg font-medium text-red-900 mb-2">Admission Rejected</h3>
                <p className="text-red-800 mb-4">
                  Your previous admission application was not approved. You can reapply with updated information.
                </p>
                <button
                  onClick={() => updateStudent({ admissionStatus: 'none' })}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                >
                  Reapply Now
                </button>
              </div>
            </div>
          </div>
        </div>
      )
    }

    // If approved, show success message
    if (student.admissionStatus === 'approved') {
      return (
        <div className="space-y-4 sm:space-y-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <div className="flex items-start space-x-3">
              <CheckCircle className="w-6 h-6 text-green-600 mt-1" />
              <div>
                <h3 className="text-lg font-medium text-green-900 mb-2">Admission Approved!</h3>
                <p className="text-green-800 mb-4">
                  Congratulations! Your admission has been approved. You can now access all features including payments and live tracking.
                </p>
                <div className="bg-white rounded-lg p-4 border border-green-200">
                  <h4 className="font-medium text-gray-900 mb-3">Approved Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Student Name:</span>
                      <p className="font-medium">{student.name}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Class:</span>
                      <p className="font-medium">{student.class}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">School:</span>
                      <p className="font-medium">{student.school}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Monthly Fee:</span>
                      <p className="font-medium">₹2,500</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    }

    // Show admission portal with button to create form
    if (!showAdmissionForm) {
      return (
        <div className="space-y-4 sm:space-y-6">
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Admission Portal</h2>
              <p className="text-sm text-gray-600 mt-1">Apply for transportation services</p>
            </div>
            <div className="p-4 sm:p-6">
              <div className="text-center">
                <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Admission Application</h3>
                <p className="text-gray-600 mb-6">
                  Complete the admission form to apply for transportation services. 
                  Your application will be reviewed by our admin team.
                </p>
                <button 
                  onClick={() => setShowAdmissionForm(true)}
                  className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Admission Form
                </button>
              </div>
            </div>
          </div>
        </div>
      )
    }

    // Show admission form
    return (
      <div className="space-y-4 sm:space-y-6">
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-medium text-gray-900">Admission Application</h2>
                <p className="text-sm text-gray-600 mt-1">Complete the form below to apply for transportation services</p>
              </div>
              <button
                onClick={() => setShowAdmissionForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
          <div className="p-4 sm:p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Guardian Information */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Guardian Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Guardian Name *</label>
                    <input
                      type="text"
                      required
                      value={admissionForm.guardianName}
                      onChange={(e) => handleInputChange('guardianName', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter guardian's full name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Guardian Email *</label>
                    <input
                      type="email"
                      required
                      value={admissionForm.guardianEmail}
                      onChange={(e) => handleInputChange('guardianEmail', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter guardian's email"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Guardian Phone *</label>
                    <input
                      type="tel"
                      required
                      value={admissionForm.guardianPhone}
                      onChange={(e) => handleInputChange('guardianPhone', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter guardian's phone number"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Alternate Phone</label>
                    <input
                      type="tel"
                      value={admissionForm.alternatePhone}
                      onChange={(e) => handleInputChange('alternatePhone', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                    <input
                      type="text"
                      required
                      value={admissionForm.schoolName}
                      onChange={(e) => handleInputChange('schoolName', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter school name"
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
                    <input
                      type="text"
                      required
                      value={admissionForm.pickupLocation}
                      onChange={(e) => handleInputChange('pickupLocation', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter pickup address"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Drop Location *</label>
                    <input
                      type="text"
                      required
                      value={admissionForm.dropLocation}
                      onChange={(e) => handleInputChange('dropLocation', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter drop address"
                    />
                  </div>
                </div>
              </div>



              {/* Submit Button */}
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowAdmissionForm(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingAdmission}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {isSubmittingAdmission ? 'Submitting...' : 'Send Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    )
  }



  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview()
      case 'services':
        return renderServices()
      case 'schools':
        return renderSchools()
      case 'tracking':
        return renderTracking()
      case 'payments':
        return renderPayments()
      case 'reviews':
        return renderReviews()
      case 'admission':
        return renderAdmission()

      default:
        return renderOverview()
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Classic Hero Section - Professional Design */}
      <div className="relative bg-gradient-to-r from-blue-700 via-blue-800 to-slate-800 border-b border-blue-600/30 rounded-b-3xl mx-2 sm:mx-4 mt-2 sm:mt-4 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex items-center justify-between">
            {/* Left: RideSafe Logo */}
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-md border border-blue-400/30">
                <Bus className="w-5 h-5 sm:w-7 sm:h-7 text-white" />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-white">
                  RideSafe
                </h1>
                <p className="text-blue-100 text-xs sm:text-sm font-medium">School Transportation</p>
              </div>
            </div>
            
            {/* Right: Account, Notifications, Logout */}
            <div className="flex items-center space-x-2 sm:space-x-3 lg:space-x-4">
              {/* Account Icon with Parent Name */}
              <div className="flex items-center space-x-2 sm:space-x-3">
                <button 
                  className="relative p-2 sm:p-3 bg-blue-600/50 rounded-lg border border-blue-500/30 hover:bg-blue-600/70 transition-all duration-200 shadow-sm"
                  onClick={() => navigate('/account-settings')}
                >
                  <User className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </button>
                <span className="text-white text-xs sm:text-sm font-medium hidden md:inline">
                  {student.guardianName}
                </span>
              </div>
              
              {/* Notification Bell - Always Enabled */}
              <button className="relative p-2 sm:p-3 bg-green-600/50 rounded-lg border border-green-500/30 hover:bg-green-600/70 transition-all duration-200 shadow-sm">
                <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                <div className="absolute top-1 right-1 sm:top-2 sm:right-2 w-2 h-2 sm:w-3 sm:h-3 bg-green-500 rounded-full animate-pulse"></div>
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white">
                  <Check className="w-1.5 h-1.5 text-white mx-auto mt-0.5" />
                </div>
              </button>
              
              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="flex items-center space-x-1 sm:space-x-2 px-3 sm:px-4 py-2 sm:py-3 bg-red-600/80 rounded-lg border border-red-500/30 text-white hover:bg-red-600 transition-all duration-200 shadow-sm"
              >
                <LogOut className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="text-xs sm:text-sm font-medium hidden lg:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto py-4 sm:py-6 sm:px-6 lg:px-8">
        <div className="px-3 py-4 sm:px-0 sm:py-6">
          {/* Tabs */}
          <div className="border-b border-gray-200 mb-4 sm:mb-6">
            <nav className="-mb-px flex space-x-4 sm:space-x-8 overflow-x-auto">
              {tabs.map((tab) => {
                const Icon = tab.icon
                const isAdmissionTab = tab.id === 'admission'
                const showAdmissionIndicator = isAdmissionTab && student.admissionStatus !== 'approved'
                
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-1 sm:space-x-2 py-2 px-1 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap relative ${
                      activeTab === tab.id
                        ? 'border-primary-500 text-primary-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span>{tab.label}</span>
                    {showAdmissionIndicator && (
                      <div className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                    )}
                  </button>
                )
              })}
            </nav>
          </div>

          {/* Tab Content */}
          {renderContent()}
        </div>
      </div>
    </div>
  )
}

export default UserDashboard 