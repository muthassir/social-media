import React, { useState, useEffect } from 'react'
import { useParams, Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import axios from 'axios'

const HOST = "http://localhost:5000"

const UserConnections = () => {
  const { username } = useParams()
  const location = useLocation()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const { user: currentUser, isAuthenticated } = useAuth()

  // Determine if we're showing followers or following
  const isFollowersPage = location.pathname.includes('followers')
  const pageType = isFollowersPage ? 'followers' : 'following'
  const pageTitle = isFollowersPage ? 'Followers' : 'Following'

  useEffect(() => {
    fetchUsers()
  }, [username, pageType])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      setError('')
      
      // First get user data
      const response = await axios.get(`${HOST}/api/users/${username}`)
      
      if (response.data.success) {
        const userData = response.data.user
        
        // Get the user IDs (either followers or following)
        const userIds = isFollowersPage ? userData.followers : userData.following
        
        // Fetch details for each user
        const userDetails = await Promise.all(
          userIds.map(async (userId) => {
            try {
              const userResponse = await axios.get(`${HOST}/api/users/id/${userId}`)
              return userResponse.data.user
            } catch (error) {
              console.log('Error fetching user:', error)
              return null
            }
          })
        )
        
        // Filter out any failed requests
        const validUsers = userDetails.filter(user => user !== null)
        setUsers(validUsers)
      }
    } catch (error) {
      console.log(`Error fetching ${pageType}:`, error)
      setError(`Failed to load ${pageType}`)
    } finally {
      setLoading(false)
    }
  }

  const handleFollowToggle = async (targetUsername, currentFollowingStatus) => {
    if (!isAuthenticated) {
      alert('Please login to follow users')
      return
    }

    try {
      const token = localStorage.getItem('token')
      const response = await axios.post(
        `${HOST}/api/users/${targetUsername}/follow`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      )

      if (response.data.success) {
        // Update the local state to reflect the change
        setUsers(prevUsers => 
          prevUsers.map(user => 
            user.username === targetUsername 
              ? { 
                  ...user, 
                  isFollowing: response.data.isFollowing,
                  followersCount: response.data.isFollowing 
                    ? (user.followersCount || 0) + 1 
                    : (user.followersCount || 1) - 1
                }
              : user
          )
        )
      }
    } catch (error) {
      console.log('Follow error:', error)
      setError('Failed to process follow action')
    }
  }

  if (loading) {
    return (
      <div className="container mt-4">
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '50vh' }}>
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <span className="ms-3">Loading {pageType}...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mt-4">
        <div className="alert alert-danger">
          <i className="bi bi-exclamation-triangle me-2"></i>
          {error}
        </div>
        <div className="text-center mt-3">
          <Link to={`/user/${username}`} className="btn btn-primary">
            <i className="bi bi-arrow-left me-1"></i>
            Back to Profile
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container mt-4">
      <div className="row justify-content-center">
        <div className="col-md-8 col-lg-6">
          
          {/* Header */}
          <div className="d-flex align-items-center mb-4">
            <Link to={`/user/${username}`} className="btn btn-outline-secondary btn-sm me-3">
              <i className="bi bi-arrow-left"></i>
            </Link>
            <h4 className="mb-0">
              <i className={`bi ${isFollowersPage ? 'bi-people' : 'bi-person-check'} me-2 text-primary`}></i>
              {username}'s {pageTitle}
            </h4>
          </div>

          {/* Users List */}
          <div className="card shadow">
            <div className="card-body p-0">
              {users.length === 0 ? (
                <div className="text-center py-5">
                  <i className={`bi ${isFollowersPage ? 'bi-people' : 'bi-person-x'} display-4 text-muted mb-3`}></i>
                  <h5 className="text-muted">
                    {isFollowersPage ? 'No followers yet' : 'Not following anyone'}
                  </h5>
                  <p className="text-muted">
                    {isFollowersPage 
                      ? 'This user doesn\'t have any followers' 
                      : 'This user isn\'t following anyone yet'
                    }
                  </p>
                </div>
              ) : (
                <div className="list-group list-group-flush">
                  {users.map(user => (
                    <div key={user._id} className="list-group-item d-flex align-items-center py-3">
                      <img
                        src={user.profilePicture || '/default-avatar.png'}
                        alt={user.username}
                        className="rounded-circle me-3"
                        style={{
                          width: '50px',
                          height: '50px',
                          objectFit: 'cover'
                        }}
                      />
                      <div className="flex-grow-1">
                        <Link 
                          to={`/user/${user.username}`}
                          className="text-decoration-none fw-bold text-dark"
                        >
                          {user.username}
                        </Link>
                        {user.fullName && (
                          <p className="text-muted mb-0 small">{user.fullName}</p>
                        )}
                        <p className="text-muted mb-0 small">{user.bio || 'No bio'}</p>
                      </div>
                      <div className="text-end">
                        <small className="text-muted d-block">
                          {user.followersCount || 0} followers
                        </small>
                        <div className="d-flex gap-2 mt-1">
                          <Link 
                            to={`/user/${user.username}`}
                            className="btn btn-outline-primary btn-sm"
                          >
                            View Profile
                          </Link>
                          {isAuthenticated && currentUser.username !== user.username && (
                            <button
                              className={`btn btn-sm ${user.isFollowing ? 'btn-outline-danger' : 'btn-primary'}`}
                              onClick={() => handleFollowToggle(user.username, user.isFollowing)}
                            >
                              {user.isFollowing ? 'Unfollow' : 'Follow'}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default UserConnections