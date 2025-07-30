import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../shared/contexts/AuthContext'
import { getUserDocumentsByEmail } from '../shared/services/authService'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRoles: ('user' | 'admin' | 'driver')[]
  fallbackPath?: string
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRoles, 
  fallbackPath = '/dashboard' 
}) => {
  const { currentUser } = useAuth()
  const [userRoles, setUserRoles] = React.useState<string[]>([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    const checkUserRoles = async () => {
      if (currentUser?.email) {
        try {
          const roles = await getUserDocumentsByEmail(currentUser.email)
          const roleNames = roles.map(role => role.role)
          setUserRoles(roleNames)
        } catch (error) {
          console.error('Error checking user roles:', error)
        } finally {
          setLoading(false)
        }
      } else {
        setLoading(false)
      }
    }

    checkUserRoles()
  }, [currentUser])

  // Show loading while checking roles
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  // Redirect to login if not authenticated
  if (!currentUser) {
    return <Navigate to="/login" replace />
  }

  // Redirect to email verification if email not verified
  if (!currentUser.emailVerified) {
    return <Navigate to="/verify-email" replace />
  }

  // Check if user has any of the required roles
  const hasRequiredRole = requiredRoles.some(role => userRoles.includes(role))

  if (!hasRequiredRole) {
    return <Navigate to={fallbackPath} replace />
  }

  return <>{children}</>
}

export default ProtectedRoute 