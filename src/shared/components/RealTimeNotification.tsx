import React, { useState, useEffect } from 'react'
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { subscribeToUserRealTimeUpdates, RealTimeSyncCallbacks } from '../services/realTimeSyncService'

interface Notification {
  id: string
  type: 'success' | 'error' | 'info' | 'warning'
  title: string
  message: string
  timestamp: Date
}

export const RealTimeNotification: React.FC = () => {
  const { currentUser } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (!currentUser?.email) return

    const syncCallbacks: RealTimeSyncCallbacks = {
      onAdmissionStatusChange: (email, status) => {
        if (email === currentUser.email) {
          const notification: Notification = {
            id: Date.now().toString(),
            type: status === 'approved' ? 'success' : status === 'rejected' ? 'error' : 'info',
            title: status === 'approved' ? 'Admission Approved!' : 
                   status === 'rejected' ? 'Admission Rejected' : 'Admission Status Updated',
            message: status === 'approved' ? 'Your admission has been approved. You can now access all features.' :
                    status === 'rejected' ? 'Your admission was rejected. Please review and reapply.' :
                    'Your admission status has been updated.',
            timestamp: new Date()
          }
          addNotification(notification)
        }
      },
      onChangeRequestUpdate: (email, requestData) => {
        if (email === currentUser.email) {
          const notification: Notification = {
            id: Date.now().toString(),
            type: requestData.status === 'approved' ? 'success' : 
                  requestData.status === 'rejected' ? 'error' : 'info',
            title: requestData.status === 'approved' ? 'Change Request Approved!' :
                   requestData.status === 'rejected' ? 'Change Request Rejected' : 'Change Request Updated',
            message: requestData.status === 'approved' ? 
                    `Your request to change "${requestData.field}" has been approved.` :
                    requestData.status === 'rejected' ? 
                    `Your request to change "${requestData.field}" was rejected.` :
                    `Your change request for "${requestData.field}" has been updated.`,
            timestamp: new Date()
          }
          addNotification(notification)
        }
      }
    }

    const unsubscribe = subscribeToUserRealTimeUpdates(currentUser.email, syncCallbacks)
    return unsubscribe
  }, [currentUser?.email])

  const addNotification = (notification: Notification) => {
    setNotifications(prev => [notification, ...prev.slice(0, 4)]) // Keep only last 5 notifications
    setIsVisible(true)
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
      removeNotification(notification.id)
    }, 5000)
  }

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
    if (notifications.length <= 1) {
      setIsVisible(false)
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />
      default:
        return <Info className="w-5 h-5 text-blue-500" />
    }
  }

  const getNotificationStyles = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800'
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800'
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800'
      default:
        return 'bg-blue-50 border-blue-200 text-blue-800'
    }
  }

  if (!isVisible || notifications.length === 0) {
    return null
  }

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`flex items-start space-x-3 p-4 rounded-lg border shadow-lg transition-all duration-300 ${getNotificationStyles(notification.type)}`}
        >
          {getNotificationIcon(notification.type)}
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-medium">{notification.title}</h4>
            <p className="text-sm mt-1">{notification.message}</p>
            <p className="text-xs mt-2 opacity-75">
              {notification.timestamp.toLocaleTimeString()}
            </p>
          </div>
          <button
            onClick={() => removeNotification(notification.id)}
            className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  )
} 