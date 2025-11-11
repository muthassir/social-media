import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const ProfileDropdown = () => {
  const [showDropdown, setShowDropdown] = useState(false)
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    setShowDropdown(false)
    navigate('/login')
  }

  const handleProfileClick = () => {
    setShowDropdown(false)
    // Navigate to profile page or show profile modal
    navigate('/profile')
  }

  return (
    <div className="dropdown">
      <button
        className="btn btn-outline-light dropdown-toggle d-flex align-items-center"
        type="button"
        onClick={() => setShowDropdown(!showDropdown)}
      >
        <i className="bi bi-person-circle me-2"></i>
        {user?.username}
      </button>
      
      {showDropdown && (
        <div className="dropdown-menu show position-absolute end-0 mt-2">
          <button 
            className="dropdown-item d-flex align-items-center"
            onClick={handleProfileClick}
          >
            <i className="bi bi-person me-2"></i>
            My Profile
          </button>
         
          <div className="dropdown-divider"></div>
          <button 
            className="dropdown-item d-flex align-items-center text-danger"
            onClick={handleLogout}
          >
            <i className="bi bi-box-arrow-right me-2"></i>
            Logout
          </button>
        </div>
      )}
    </div>
  )
}

export default ProfileDropdown