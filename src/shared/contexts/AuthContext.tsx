import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { 
  User, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  sendEmailVerification,
  applyActionCode
} from 'firebase/auth'
import { auth } from '../services/firebase/config'

interface AuthContextType {
  currentUser: User | null
  register: (email: string, password: string) => Promise<any>
  login: (email: string, password: string) => Promise<any>
  logout: () => Promise<void>
  sendVerificationEmail: () => Promise<void>
  verifyEmail: (actionCode: string) => Promise<void>
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const register = async (email: string, password: string) => {
    return createUserWithEmailAndPassword(auth, email, password)
  }

  const login = async (email: string, password: string) => {
    return signInWithEmailAndPassword(auth, email, password)
  }

  const logout = async () => {
    return signOut(auth)
  }

  const sendVerificationEmail = async () => {
    if (currentUser) {
      return sendEmailVerification(currentUser)
    }
  }

  const verifyEmail = async (actionCode: string) => {
    return applyActionCode(auth, actionCode)
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user)
      setLoading(false)
    })

    return unsubscribe
  }, [])

  const value: AuthContextType = {
    currentUser,
    register,
    login,
    logout,
    sendVerificationEmail,
    verifyEmail,
    loading
  }

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  )
} 