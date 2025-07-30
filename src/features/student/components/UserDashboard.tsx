import { useState } from 'react'
import { useAuth } from '../../../shared/contexts/AuthContext'
import { useUserData } from '../../../shared/contexts/UserDataContext'
import { useNavigate } from 'react-router-dom'
import { HeroSection } from './HeroSection'
import { TabNavigation } from './TabNavigation'
import { OverviewTab } from './tabs/OverviewTab'
import { ServicesTab } from './tabs/ServicesTab'
import { SchoolsTab } from './tabs/SchoolsTab'
import { TrackingTab } from './tabs/TrackingTab'
import { PaymentsTab } from './tabs/PaymentsTab'
import { ReviewsTab } from './tabs/ReviewsTab'
import { AdmissionTab } from './tabs/AdmissionTab'
import { ChangeRequestTab } from './tabs/ChangeRequestTab'
import { RealTimeNotification } from '../../../shared/components/RealTimeNotification'

const UserDashboard = () => {
  const { logout } = useAuth()
  const { student, loading } = useUserData()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('overview')

  const handleLogout = async () => {
    try {
      await logout()
      navigate('/login')
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewTab onTabChange={setActiveTab} />
      case 'services':
        return <ServicesTab />
      case 'schools':
        return <SchoolsTab />
      case 'tracking':
        return <TrackingTab />
      case 'payments':
        return <PaymentsTab />
      case 'reviews':
        return <ReviewsTab />
      case 'admission':
        return <AdmissionTab />
      case 'change-requests':
        return <ChangeRequestTab />
      default:
        return <OverviewTab onTabChange={setActiveTab} />
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <RealTimeNotification />
      <HeroSection 
        student={student} 
        onLogout={handleLogout}
        onAccountClick={() => navigate('/account-settings')}
      />
      
      <div className="max-w-7xl mx-auto py-4 sm:py-6 sm:px-6 lg:px-8">
        <div className="px-3 py-4 sm:px-0 sm:py-6">
          <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />
          {renderContent()}
        </div>
      </div>
    </div>
  )
}

export default UserDashboard 