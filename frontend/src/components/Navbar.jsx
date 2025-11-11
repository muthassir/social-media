import React from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import ProfileDropdown from './ProfileDropdown'

const Navbar = () => {
  const { isAuthenticated } = useAuth()

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-info shadow-sm">
      <div className="container">
        {/* Brand Logo */}
        <Link className="navbar-brand fw-bold" to="/">
          <i className="bi bi-people-fill me-2"></i>
          SocialApp
        </Link>

        {/* Mobile Toggle Button */}
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* Navigation Links */}
        <div className="collapse navbar-collapse" id="navbarNav">
          {isAuthenticated ? (
            // Authenticated User Menu with Profile Dropdown
            <div className="navbar-nav ms-auto align-items-center">
              <ProfileDropdown />
            </div>
          ) : (
            // Guest User Menu
            <div className="navbar-nav ms-auto">
              <Link className="nav-link" to="/login">
                <i className="bi bi-box-arrow-in-right me-1"></i>
                Login
              </Link>
              <Link className="nav-link" to="/register">
                <i className="bi bi-person-plus me-1"></i>
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}

export default Navbar