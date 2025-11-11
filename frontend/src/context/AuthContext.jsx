import React, { createContext, useState, useContext, useEffect } from 'react'
import axios from 'axios'

// Create Auth Context
const AuthContext = createContext()

// Backend host URL
// const HOST = "http://localhost:5000"
const HOST = "https://social-media-rm1u.onrender.com"

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// Auth Provider Component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Check authentication status on app start
  useEffect(() => {
    checkAuthStatus()
  }, [])

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('token')
      if (token) {
        // Set authorization header for all requests
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
        
        // Verify token and get user data
        const response = await axios.get(`${HOST}/api/auth/me`)
        if (response.data.success) {
          setUser(response.data.user)
        }
      }
    } catch (error) {
      console.log('Authentication check failed:', error)
      // Clear invalid token
      localStorage.removeItem('token')
      delete axios.defaults.headers.common['Authorization']
    } finally {
      setLoading(false)
    }
  }

  // Login function
  const login = async (email, password) => {
    try {
      const response = await axios.post(`${HOST}/api/auth/login`, { email, password })
      
      if (response.data.success) {
        const { user, token } = response.data
        
        // Store token and set user
        localStorage.setItem('token', token)
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
        setUser(user)
        
        return { success: true, user }
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed'
      return { success: false, message }
    }
  }

  // Register function
  const register = async (username, email, password) => {
    try {
      const response = await axios.post(`${HOST}/api/auth/register`, {
        username,
        email,
        password
      })
      
      if (response.data.success) {
        const { user, token } = response.data
        
        // Store token and set user
        localStorage.setItem('token', token)
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
        setUser(user)
        
        return { success: true, user }
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed'
      return { success: false, message }
    }
  }

  // Logout function
  const logout = () => {
    localStorage.removeItem('token')
    delete axios.defaults.headers.common['Authorization']
    setUser(null)
  }

  // Context value
  const value = {
    user,
    loading,
    login,
    register,
    logout,
    HOST,
    isAuthenticated: !!user
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}