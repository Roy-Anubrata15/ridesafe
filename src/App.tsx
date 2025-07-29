import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './contexts/AuthContext'
import { UserDataProvider } from './contexts/UserDataContext'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import Dashboard from './pages/Dashboard'
import VerifyEmailPage from './pages/VerifyEmailPage'
import AdminDashboard from './pages/AdminDashboard'
import AccountSettings from './pages/AccountSettings'
import ProtectedRoute from './components/ProtectedRoute'

function App() {
  return (
    <AuthProvider>
      <UserDataProvider>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            <Route path="/" element={<LoginPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/verify-email" element={<VerifyEmailPage />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route 
              path="/admin" 
              element={
                <ProtectedRoute requiredRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/account-settings" 
              element={
                <ProtectedRoute requiredRoles={['user']}>
                  <AccountSettings />
                </ProtectedRoute>
              } 
            />
          </Routes>
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              success: {
                duration: 3000,
                iconTheme: {
                  primary: '#10B981',
                  secondary: '#fff',
                },
              },
              error: {
                duration: 4000,
                iconTheme: {
                  primary: '#EF4444',
                  secondary: '#fff',
                },
              },
            }}
          />
        </div>
      </UserDataProvider>
    </AuthProvider>
  )
}

export default App 