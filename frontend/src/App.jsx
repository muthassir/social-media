import React from 'react'
import { Routes, Route, Navigate, BrowserRouter } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Login from './pages/Login'
import Register from './pages/Register'
import Feed from './pages/Feed'
import Profile from './pages/Profile'
import UserProfile from './pages/UserProfile'
import UserConnections from './pages/UserConnections'

import { AuthProvider, useAuth } from './context/AuthContext'

// Protected Route
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth()
  
  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    )
  }
  
  return user ? children : <Navigate to="/login" />
}

// Public Route Component (redirect if already logged in)
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth()
  
  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    )
  }
  
  return !user ? children : <Navigate to="/" />
}

// Main App Content
const AppContent = () => {
  const { user } = useAuth()

  return (
    <div className="App d-flex flex-column min-vh-100">
      <BrowserRouter>
      <Navbar />
      
      <main className="flex-grow-1">
        <Routes>
          <Route 
            path="/login" 
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            } 
          />
          <Route 
            path="/register" 
            element={
              <PublicRoute>
                <Register />
              </PublicRoute>
            } 
          />
                    <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                      <Route path="/user/:username" element={<UserProfile />} /> 

                      <Route path="/user/:username/followers" element={<UserConnections />} />
<Route path="/user/:username/following" element={<UserConnections />} />

          {/*public route*/}
          <Route path="/" element={<Feed />} />
        </Routes>
      </main>

      {/* Show footer on all pages */}
      <Footer />
      </BrowserRouter>
    </div>
  )
}

// Main App Component with AuthProvider
function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App