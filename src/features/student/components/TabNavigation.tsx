import React from 'react'
import { 
  Home, 
  Bus, 
  GraduationCap, 
  MapPin, 
  DollarSign, 
  Star, 
  FileText,
  Edit3
} from 'lucide-react'

interface TabNavigationProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

const tabs = [
  { id: 'overview', name: 'Overview', icon: Home },
  { id: 'services', name: 'Services', icon: Bus },
  { id: 'schools', name: 'Schools', icon: GraduationCap },
  { id: 'tracking', name: 'Tracking', icon: MapPin },
  { id: 'payments', name: 'Payments', icon: DollarSign },
  { id: 'reviews', name: 'Reviews', icon: Star },
  { id: 'admission', name: 'Admission', icon: FileText },
  { id: 'change-requests', name: 'Change Requests', icon: Edit3 }
]

export const TabNavigation: React.FC<TabNavigationProps> = ({ 
  activeTab, 
  onTabChange 
}) => {
  return (
    <div className="border-b border-gray-200 mb-4 sm:mb-6">
      <nav className="-mb-px flex space-x-4 sm:space-x-8 overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex items-center space-x-2 px-3 py-2 text-sm sm:text-base font-medium border-b-2 transition-colors ${
                isActive
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden sm:inline">{tab.name}</span>
            </button>
          )
        })}
      </nav>
    </div>
  )
} 