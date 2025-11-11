import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import axios from 'axios'

const Profile = () => {
  const { user, HOST } = useAuth()
  const [profile, setProfile] = useState(null)
  const [userPosts, setUserPosts] = useState([])
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  
  const [formData, setFormData] = useState({
    bio: '',
    profilePicture: '',
    fullName: ''
  })

  // Fetch user profile and posts
  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token')
      
      // Fetch user profile with followers/following data
      const userResponse = await axios.get(`${HOST}/api/users/${user.username}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      // Fetch user's posts to count them
      const postsResponse = await axios.get(`${HOST}/api/posts`)
      
      if (userResponse.data.success) {
        const userData = userResponse.data.user
        const userPosts = postsResponse.data.posts.filter(post => post.username === user.username)
        
        setProfile(userData)
        setUserPosts(userPosts)
        setFormData({
          bio: userData.bio || '',
          profilePicture: userData.profilePicture || '',
          fullName: userData.fullName || ''
        })
      }
    } catch (error) {
      console.log('Error fetching profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveProfile = async (e) => {
    e.preventDefault()
    setSaving(true)
    
    try {
      const token = localStorage.getItem('token')
      const response = await axios.put(`${HOST}/api/users/profile`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      if (response.data.success) {
        setProfile(response.data.user)
        setIsEditing(false)
        // Refresh profile data after update
        fetchProfile()
      }
    } catch (error) {
      console.log('Error updating profile:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleImageUpload = async (file) => {
    // Use the same Cloudinary config as CreatePost
    const CLOUD_NAME = 'de13d1vnc' 
    const UPLOAD_PRESET = 'my_upload_preset'
    
    const uploadData = new FormData()
    uploadData.append('file', file)
    uploadData.append('upload_preset', UPLOAD_PRESET)
    
    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
        { method: 'POST', body: uploadData }
      )
      const data = await response.json()
      
      if (data.secure_url) {
        setFormData(prev => ({ ...prev, profilePicture: data.secure_url }))
      }
    } catch (error) {
      console.error('Upload error:', error)
    }
  }

  if (loading) {
    return (
      <div className="container mt-4">
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '50vh' }}>
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <span className="ms-3">Loading profile...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="container mt-4">
      <div className="row justify-content-center">
        <div className="col-md-8 col-lg-6">
          <div className="card shadow">
            <div className="card-body p-4">
              
              {/* Header */}
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h4 className="card-title mb-0">
                  <i className="bi bi-person-circle me-2 text-primary"></i>
                  My Profile
                </h4>
                {!isEditing && (
                  <button
                    className="btn btn-outline-primary btn-sm"
                    onClick={() => setIsEditing(true)}
                  >
                    <i className="bi bi-pencil me-1"></i>
                    Edit Profile
                  </button>
                )}
              </div>

              {/* Profile Picture */}
              <div className="text-center mb-4">
                <div className="position-relative d-inline-block">
                  <img
                    src={formData.profilePicture || '/default-avatar.png'}
                    alt="Profile"
                    className="rounded-circle border profile-img"
                    style={{
                      width: '150px',
                      height: '150px',
                      objectFit: 'cover'
                    }}
                  />
                  {isEditing && (
                    <label 
                      className="btn btn-primary btn-sm position-absolute bottom-0 end-0 rounded-circle"
                      style={{ width: '40px', height: '40px', cursor: 'pointer' }}
                    >
                      <i className="bi bi-camera"></i>
                      <input
                        type="file"
                        className="d-none"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files[0]
                          if (file) handleImageUpload(file)
                        }}
                      />
                    </label>
                  )}
                </div>
              </div>

              {/* Profile Form */}
              <form onSubmit={handleSaveProfile}>
                <div className="row">
                  {/* Username (readonly) */}
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Username</label>
                    <input
                      type="text"
                      className="form-control"
                      value={user?.username}
                      disabled
                    />
                    <div className="form-text">Username cannot be changed</div>
                  </div>

                  {/* Email (readonly) */}
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Email</label>
                    <input
                      type="email"
                      className="form-control"
                      value={user?.email}
                      disabled
                    />
                  </div>
                </div>

                {/* Full Name */}
                <div className="mb-3">
                  <label className="form-label">Full Name</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.fullName}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      fullName: e.target.value
                    }))}
                    disabled={!isEditing}
                    placeholder="Enter your full name"
                  />
                </div>

                {/* Bio */}
                <div className="mb-4">
                  <label className="form-label">Bio</label>
                  <textarea
                    className="form-control"
                    rows="4"
                    value={formData.bio}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      bio: e.target.value
                    }))}
                    disabled={!isEditing}
                    placeholder="Tell us about yourself..."
                    maxLength="500"
                  />
                  <div className="form-text">
                    {formData.bio.length}/500 characters
                  </div>
                </div>

                {/* Action Buttons */}
                {isEditing && (
                  <div className="d-flex gap-2">
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={saving}
                    >
                      {saving ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2"></span>
                          Saving...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-check me-2"></i>
                          Save Changes
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={() => {
                        setIsEditing(false)
                        setFormData({
                          bio: profile?.bio || '',
                          profilePicture: profile?.profilePicture || '',
                          fullName: profile?.fullName || ''
                        })
                      }}
                      disabled={saving}
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </form>

              {/* Profile Stats - Now with real data */}
              {!isEditing && profile && (
                <div className="mt-4 pt-4 border-top">
                  <h6 className="text-muted mb-3">Profile Stats</h6>
                  <div className="row text-center">
                    <div className="col-4">
                      <div className="fw-bold h5 text-primary">{userPosts.length}</div>
                      <small className="text-muted">Posts</small>
                    </div>
                    <div className="col-4">
                      <div className="fw-bold h5 text-primary">{profile.followersCount || profile.followers?.length || 0}</div>
                      <small className="text-muted">Followers</small>
                    </div>
                    <div className="col-4">
                      <div className="fw-bold h5 text-primary">{profile.followingCount || profile.following?.length || 0}</div>
                      <small className="text-muted">Following</small>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile