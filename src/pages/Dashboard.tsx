import { useState, useEffect } from 'react'
import { useAuth } from '../shared/contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import { Shield } from 'lucide-react'
import toast from 'react-hot-toast'
import { getUserDocumentsByEmail } from '../shared/services/authService'
import UserDashboard from '../features/student/components/UserDashboard'

const Dashboard = () => {
  const { currentUser } = useAuth()
  const navigate = useNavigate()
  const [currentRole, setCurrentRole] = useState<any>(null)
  const [userRoles, setUserRoles] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Load user roles on component mount
  useEffect(() => {
    const loadUserRoles = async () => {
      if (currentUser?.email) {
        try {
          const roles = await getUserDocumentsByEmail(currentUser.email)
          setUserRoles(roles)
          
          // Check if user has ALL THREE roles (user, admin, driver)
          const hasUserRole = roles.some(role => role.role === 'user')
          const hasAdminRole = roles.some(role => role.role === 'admin')
          const hasDriverRole = roles.some(role => role.role === 'driver')
          const hasAllThreeRoles = hasUserRole && hasAdminRole && hasDriverRole
          
          console.log('User roles:', roles.map(r => r.role))
          console.log('Has all three roles:', hasAllThreeRoles)
          
          // Set default role based on user's actual roles
          if (roles.length > 0) {
            // If user has ALL THREE roles, set admin as default and allow role switching
            if (hasAllThreeRoles) {
              const adminRole = roles.find(role => role.role === 'admin')
              setCurrentRole(adminRole)
            } else {
              // For users with only 1 or 2 roles, set their primary role as default
              const userRole = roles.find(role => role.role === 'user')
              const driverRole = roles.find(role => role.role === 'driver')
              const adminRole = roles.find(role => role.role === 'admin')
              
              // Priority: User > Driver > Admin (for non-full-access users)
              if (userRole) {
                setCurrentRole(userRole)
              } else if (driverRole) {
                setCurrentRole(driverRole)
              } else if (adminRole) {
                setCurrentRole(adminRole)
              } else {
                setCurrentRole(roles[0]) // Fallback
              }
            }
          }
        } catch (error) {
          console.error('Error loading user roles:', error)
          toast.error('Failed to load user roles')
        } finally {
          setLoading(false)
        }
      }
    }

    loadUserRoles()
  }, [currentUser])

  // Check if user is logged in
  if (!currentUser) {
    navigate('/login')
    return null
  }

  // Check if email is verified
  if (!currentUser.emailVerified) {
    navigate('/verify-email')
    return null
  }

  // Show loading while fetching roles
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }



  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content */}
      <main className="max-w-7xl mx-auto pb-6 sm:px-6 lg:px-8">
        <div className="px-4 pb-6 sm:px-0">
          <div className="bg-white rounded-lg shadow p-6">

                               {currentRole?.role === 'admin' && 
                    userRoles.some(role => role.role === 'user') && 
                    userRoles.some(role => role.role === 'admin') && 
                    userRoles.some(role => role.role === 'driver') ? (
                     <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                       <h3 className="text-lg font-semibold text-blue-900 mb-2">🔐 Full Admin Privileges Active!</h3>
                       <p className="text-blue-800 text-sm sm:text-base leading-relaxed">
                         You have access to all three panels (User, Admin, Driver) and can switch between roles. You can also access the admin panel.
                         Use the role selector above to manage different user perspectives.
                       </p>
                       <div className="mt-4 pt-4 border-t border-blue-200">
                         <button
                           onClick={() => navigate('/admin')}
                           className="w-full sm:w-auto flex items-center justify-center space-x-2 px-4 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
                         >
                           <Shield className="w-4 h-4" />
                           <span>Access Admin Panel</span>
                         </button>
                       </div>
                     </div>
                   ) : currentRole?.role === 'admin' && 
                        (!userRoles.some(role => role.role === 'user') || 
                         !userRoles.some(role => role.role === 'driver')) ? (
                     <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                       <h3 className="text-lg font-semibold text-orange-900 mb-2">🔐 Admin Access Active!</h3>
                       <p className="text-orange-800 text-sm sm:text-base leading-relaxed">
                         You are registered as an admin and can access all panels (User, Admin, Driver) by logging in through each panel. 
                         To enable role switching (dropdown), register in all three roles.
                       </p>
                       <div className="mt-4 pt-4 border-t border-orange-200">
                         <p className="text-sm text-orange-700 mb-3">
                           <strong>Missing roles for switching:</strong> 
                           {!userRoles.some(role => role.role === 'user') && ' User'}
                           {!userRoles.some(role => role.role === 'driver') && ' Driver'}
                         </p>
                         <div className="mt-3">
                           <button
                             onClick={() => navigate('/admin')}
                             className="w-full sm:w-auto flex items-center justify-center space-x-2 px-4 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
                           >
                             <Shield className="w-4 h-4" />
                             <span>Access Admin Panel</span>
                           </button>
                         </div>
                       </div>
                     </div>
                   ) : currentRole?.role === 'driver' ? (
                     <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                       <h3 className="text-lg font-semibold text-orange-900 mb-2">🚗 Driver Dashboard</h3>
                       <p className="text-orange-800 text-sm sm:text-base leading-relaxed">
                         Welcome, Driver! Here you can manage your routes, view student pickups, and track your vehicle.
                       </p>
                       <div className="mt-4 pt-4 border-t border-orange-200">
                         <div className="space-y-2">
                           <p className="text-sm text-orange-700">
                             <strong>Vehicle:</strong> {currentRole.vehicleNumber || 'Not assigned'}
                           </p>
                           <p className="text-sm text-orange-700">
                             <strong>License:</strong> {currentRole.licenseNumber || 'Not provided'}
                           </p>
                         </div>
                       </div>
                     </div>
                   ) : currentRole?.role === 'user' ? (
                     <UserDashboard />
                   ) : (
                     <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                       <h3 className="text-lg font-semibold text-green-900 mb-2">👋 Welcome to RideSafe!</h3>
                       <p className="text-green-800 text-sm sm:text-base leading-relaxed">
                         Welcome! Please select your role to continue.
                       </p>
                     </div>
                   )}
          </div>
        </div>
      </main>
    </div>
  )
}

export default Dashboard 