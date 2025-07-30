import { useState, useEffect } from 'react'
import { Mail, CheckCircle, RefreshCw } from 'lucide-react'
import { useAuth } from '../shared/contexts/AuthContext'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { markUserAsVerified, getUserDocumentsByEmail } from '../shared/services/authService'
import toast from 'react-hot-toast'

const VerifyEmailPage = () => {

  const [resendLoading, setResendLoading] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const { currentUser, sendVerificationEmail, verifyEmail } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  // Debug logging
  console.log('VerifyEmailPage - currentUser:', currentUser)
  console.log('VerifyEmailPage - currentUser?.emailVerified:', currentUser?.emailVerified)

  // Check for verification code in URL
  useEffect(() => {
    const actionCode = searchParams.get('oobCode')
    if (actionCode) {
      handleEmailVerification(actionCode)
    }
  }, [searchParams])

  // Countdown timer for resend button
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  const handleEmailVerification = async (actionCode: string) => {
    try {
      await verifyEmail(actionCode)
      
      // Mark user as verified in Firestore for all their roles
      if (currentUser?.email) {
        try {
          const userDocuments = await getUserDocumentsByEmail(currentUser.email)
          for (const userDoc of userDocuments) {
            await markUserAsVerified(userDoc.uid, userDoc.role)
          }
          console.log('Marked user as verified in Firestore for all roles')
        } catch (firestoreError) {
          console.warn('Failed to update Firestore verification status:', firestoreError)
          // Continue even if Firestore update fails
        }
      }
      
      toast.success('Email verified successfully!')
      navigate('/dashboard')
    } catch (error: any) {
      console.error('Email verification error:', error)
      let errorMessage = 'Email verification failed. Please try again.'
      
      if (error.code === 'auth/invalid-action-code') {
        errorMessage = 'Invalid verification link. Please request a new one.'
      } else if (error.code === 'auth/expired-action-code') {
        errorMessage = 'Verification link has expired. Please request a new one.'
      }
      
      toast.error(errorMessage)
    }
  }

  const handleResendVerification = async () => {
    setResendLoading(true)
    try {
      await sendVerificationEmail()
      toast.success('Verification email sent! Please check your inbox.')
      setCountdown(60) // 60 second cooldown
    } catch (error: any) {
      console.error('Resend verification error:', error)
      toast.error('Failed to send verification email. Please try again.')
    } finally {
      setResendLoading(false)
    }
  }

  // Check if user is already verified (for cases where Firebase Auth is verified but Firestore isn't)
  const checkAndUpdateVerificationStatus = async () => {
    if (currentUser?.emailVerified && currentUser?.email) {
      try {
        const userDocuments = await getUserDocumentsByEmail(currentUser.email)
        let needsUpdate = false
        
        for (const userDoc of userDocuments) {
          if (userDoc.emailVerified !== true) {
            needsUpdate = true
            await markUserAsVerified(userDoc.uid, userDoc.role)
          }
        }
        
        if (needsUpdate) {
          console.log('Updated Firestore verification status for existing verified user')
        }
      } catch (error) {
        console.warn('Failed to check/update verification status:', error)
      }
    }
  }

  // Check verification status on component mount
  useEffect(() => {
    checkAndUpdateVerificationStatus()
  }, [currentUser])

  const handleBackToLogin = () => {
    navigate('/login')
  }

  // If no current user, show a different message for registration flow
  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <Mail className="mx-auto h-12 w-12 text-primary-600" />
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              Check Your Email
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              We've sent a verification email to your registered email address.
            </p>
            <p className="mt-2 text-sm text-gray-600">
              Please check your inbox and click the verification link to activate your account.
            </p>
            <div className="mt-6 space-y-4">
              <button
                onClick={handleBackToLogin}
                className="w-full btn-primary"
              >
                Back to Login
              </button>
              <p className="text-xs text-gray-500">
                Didn't receive the email? Check your spam folder or try registering again.
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (currentUser.emailVerified) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              Email Verified!
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Your email has been successfully verified.
            </p>
            <button
              onClick={() => navigate('/dashboard')}
              className="mt-4 btn-primary"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Mail className="mx-auto h-12 w-12 text-primary-600" />
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Verify Your Email
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            We've sent a verification email to:
          </p>
          <p className="mt-1 text-sm font-medium text-gray-900">
            {currentUser.email}
          </p>
        </div>

        <div className="bg-white py-8 px-6 shadow rounded-lg">
          <div className="space-y-6">
            <div className="text-center">
              <p className="text-sm text-gray-600">
                Please check your email and click the verification link to activate your account.
              </p>
            </div>

            <div className="space-y-4">
              <button
                onClick={handleResendVerification}
                disabled={resendLoading || countdown > 0}
                className="w-full flex justify-center items-center btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {resendLoading ? (
                  <RefreshCw className="animate-spin h-5 w-5 mr-2" />
                ) : (
                  <Mail className="h-5 w-5 mr-2" />
                )}
                {countdown > 0 
                  ? `Resend in ${countdown}s` 
                  : resendLoading 
                    ? 'Sending...' 
                    : 'Resend Verification Email'
                }
              </button>

              <button
                onClick={handleBackToLogin}
                className="w-full btn-primary"
              >
                Back to Login
              </button>
            </div>

            <div className="text-center">
              <p className="text-xs text-gray-500">
                Didn't receive the email? Check your spam folder or try resending.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default VerifyEmailPage 