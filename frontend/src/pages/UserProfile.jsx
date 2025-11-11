import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import axios from 'axios'


const UserProfile = () => {
  const { username } = useParams()
  const [user, setUser] = useState(null)
  const [userPosts, setUserPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [followLoading, setFollowLoading] = useState(false)
  const { user: currentUser, isAuthenticated, HOST } = useAuth()

  // Fetch user profile and posts
  useEffect(() => {
    fetchUserProfile()
  }, [username])

  const fetchUserProfile = async () => {
    try {
      setLoading(true)
      setError('')
      const response = await axios.get(`${HOST}/api/users/${username}`)
      
      if (response.data.success) {
        setUser(response.data.user)
        setUserPosts(response.data.posts)
      }
    } catch (error) {
      console.log('Error fetching user profile:', error)
      setError('Failed to load user profile')
    } finally {
      setLoading(false)
    }
  }

  const handleFollowToggle = async () => {
    if (!isAuthenticated) {
      alert('Please login to follow users')
      return
    }

    setFollowLoading(true)
    try {
      const token = localStorage.getItem('token')
      const response = await axios.post(
        `${HOST}/api/users/${username}/follow`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      )

      if (response.data.success) {
        setUser(prev => ({
          ...prev,
          isFollowing: response.data.isFollowing,
          followersCount: response.data.followersCount
        }))
      }
    } catch (error) {
      console.log('Follow error:', error)
      setError('Failed to process follow action')
    } finally {
      setFollowLoading(false)
    }
  }

  // Loading state
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

  // Error state
  if (error) {
    return (
      <div className="container mt-4">
        <div className="alert alert-danger">
          <i className="bi bi-exclamation-triangle me-2"></i>
          {error}
        </div>
        <div className="text-center mt-3">
          <Link to="/" className="btn btn-primary">
            <i className="bi bi-arrow-left me-1"></i>
            Back to Feed
          </Link>
        </div>
      </div>
    )
  }

  // User not found state
  if (!user) {
    return (
      <div className="container mt-4">
        <div className="alert alert-warning text-center">
          <i className="bi bi-person-x me-2"></i>
          User not found
        </div>
        <div className="text-center mt-3">
          <Link to="/" className="btn btn-primary">
            <i className="bi bi-arrow-left me-1"></i>
            Back to Feed
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container mt-4">
      <div className="row justify-content-center">
        <div className="col-md-10">
          
          {/* Back Button */}
          <div className="mb-4">
            <Link to="/" className="btn btn-outline-secondary btn-sm">
              <i className="bi bi-arrow-left me-1"></i>
              Back to Feed
            </Link>
          </div>

          {/* User Profile Header */}
          <div className="card shadow-sm mb-4">
            <div className="card-body">
              <div className="row align-items-center">
                <div className="col-md-3 text-center">
                  <img
                    src={user.profilePicture || '/default-avatar.png'}
                    alt={user.username}
                    className="rounded-circle border"
                    style={{
                      width: '120px',
                      height: '120px',
                      objectFit: 'cover'
                    }}
                  />
                </div>
                <div className="col-md-9">
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <h3 className="mb-1">@{user.username}</h3>
                      {user.fullName && (
                        <h5 className="text-muted mb-2">{user.fullName}</h5>
                      )}
                      <p className="text-muted mb-3">{user.bio || 'No bio yet'}</p>
                    </div>
                    
                    {/* Follow Button */}
                    {isAuthenticated && currentUser.username !== username && (
                      <button
                        className={`btn ${user.isFollowing ? 'btn-outline-danger' : 'btn-primary'}`}
                        onClick={handleFollowToggle}
                        disabled={followLoading}
                      >
                        {followLoading ? (
                          <span className="spinner-border spinner-border-sm"></span>
                        ) : user.isFollowing ? (
                          <>
                            <i className="bi bi-person-dash me-1"></i>
                            Unfollow
                          </>
                        ) : (
                          <>
                            <i className="bi bi-person-plus me-1"></i>
                            Follow
                          </>
                        )}
                      </button>
                    )}
                  </div>
                  
<div className="row text-center mt-3">
  <div className="col-4">
    <div className="fw-bold h5 text-primary">{user.postsCount || 0}</div>
    <small className="text-muted">Posts</small>
  </div>
  <div className="col-4">
    <Link to={`/user/${username}/followers`} className="text-decoration-none">
      <div className="fw-bold h5 text-primary cursor-pointer">{user.followersCount || 0}</div>
      <small className="text-muted">Followers</small>
    </Link>
  </div>
  <div className="col-4">
    <Link to={`/user/${username}/following`} className="text-decoration-none">
      <div className="fw-bold h5 text-primary cursor-pointer">{user.followingCount || 0}</div>
      <small className="text-muted">Following</small>
    </Link>
  </div>
</div>
                </div>
              </div>
            </div>
          </div>

          {/* User's Posts */}
          <div className="mb-4">
            <h5 className="text-muted mb-3">
              <i className="bi bi-images me-2"></i>
              Posts by {user.username}
            </h5>
            
            {userPosts.length === 0 ? (
              <div className="card text-center py-5">
                <i className="bi bi-inbox display-4 text-muted mb-3"></i>
                <h5 className="text-muted">No posts yet</h5>
                <p className="text-muted">This user hasn't shared anything yet</p>
              </div>
            ) : (
              <div className="row">
                {userPosts.map(post => (
                  <div key={post._id} className="col-md-6 col-lg-4 mb-4">
                    <div className="card h-100">
                      {post.image && (
                        <img 
                          src={post.image} 
                          alt="Post" 
                          className="card-img-top"
                          style={{ 
                            height: '200px', 
                            objectFit: 'cover' 
                          }}
                        />
                      )}
                      <div className="card-body">
                        <p className="card-text">
                          {post.text && (post.text.length > 100 
                            ? `${post.text.substring(0, 100)}...` 
                            : post.text
                          )}
                        </p>
                      </div>
                      <div className="card-footer bg-transparent">
                        <small className="text-muted">
                          <i className="bi bi-heart-fill text-danger me-1"></i>
                          {post.likesCount || post.likes.length} likes
                        </small>
                        <small className="text-muted ms-3">
                          <i className="bi bi-chat me-1"></i>
                          {post.commentsCount || post.comments.length} comments
                        </small>
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
  )
}

export default UserProfile