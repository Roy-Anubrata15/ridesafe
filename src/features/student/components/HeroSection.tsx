import React from 'react'
import { Bus, User, Bell, LogOut, Check } from 'lucide-react'
import { Button } from '../../../shared/components/ui'

interface Student {
  guardianName: string
}

interface HeroSectionProps {
  student: Student
  onLogout: () => void
  onAccountClick: () => void
}

export const HeroSection: React.FC<HeroSectionProps> = ({ 
  student, 
  onLogout, 
  onAccountClick 
}) => {
  return (
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
              <Button 
                variant="ghost"
                size="sm"
                className="relative p-2 sm:p-3 bg-blue-600/50 border border-blue-500/30 hover:bg-blue-600/70 text-white"
                onClick={onAccountClick}
              >
                <User className="w-4 h-4 sm:w-5 sm:h-5" />
              </Button>
              <span className="text-white text-xs sm:text-sm font-medium hidden md:inline">
                {student.guardianName}
              </span>
            </div>
            
            {/* Notification Bell - Always Enabled */}
            <Button 
              variant="ghost"
              size="sm"
              className="relative p-2 sm:p-3 bg-green-600/50 border border-green-500/30 hover:bg-green-600/70 text-white"
            >
              <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
              <div className="absolute top-1 right-1 sm:top-2 sm:right-2 w-2 h-2 sm:w-3 sm:h-3 bg-green-500 rounded-full animate-pulse"></div>
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white">
                <Check className="w-1.5 h-1.5 text-white mx-auto mt-0.5" />
              </div>
            </Button>
            
            {/* Logout Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={onLogout}
              className="flex items-center space-x-1 sm:space-x-2 px-3 sm:px-4 py-2 sm:py-3 bg-red-600/80 border border-red-500/30 text-white hover:bg-red-600"
            >
              <LogOut className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="text-xs sm:text-sm font-medium hidden lg:inline">Logout</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
} 