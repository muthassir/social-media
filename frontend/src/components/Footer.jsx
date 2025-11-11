import React from 'react'

const Footer = () => {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-light mt-5 py-4 border-top">
      <div className="container">
        <div className="row align-items-center">
          <div className="col-md-6">
            <div className="d-flex align-items-center">
              <i className="bi bi-people-fill text-primary fs-5 me-2"></i>
              <span className="fw-bold text-primary">SocialApp</span>
            </div>
            <p className="text-muted small mb-0 mt-1">
              Connect and share with people around you
            </p>
          </div>
          
          <div className="col-md-6 text-md-end">
            <div className="d-flex justify-content-md-end gap-3 mt-3 mt-md-0">
              <a 
                href="#" 
                className="text-muted text-decoration-none"
                title="About Us"
              >
                <i className="bi bi-info-circle me-1"></i>
                About
              </a>
              <a 
                href="#" 
                className="text-muted text-decoration-none"
                title="Contact Support"
              >
                <i className="bi bi-envelope me-1"></i>
                Contact
              </a>
              <a 
                href="#" 
                className="text-muted text-decoration-none"
                title="Privacy Policy"
              >
                <i className="bi bi-shield-check me-1"></i>
                Privacy
              </a>
            </div>
            <p className="text-muted small mb-0 mt-2">
              © {currentYear} SocialApp. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer