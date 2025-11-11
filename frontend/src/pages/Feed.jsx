import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import axios from 'axios'

// Components
import CreatePost from '../components/CreatePost'
import Post from '../components/Post'

const Feed = () => {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const { user, isAuthenticated, HOST } = useAuth()

  // Fetch posts from backend
  const fetchPosts = async () => {
    try {
      setLoading(true)
      const response = await axios.get(`${HOST}/api/posts`)
      if (response.data.success) {
        setPosts(response.data.posts)
      }
    } catch (error) {
      console.log('Error fetching posts:', error)
      setError('Failed to load posts')
    } finally {
      setLoading(false)
    }
  }

  // Load posts on component mount
  useEffect(() => {
    fetchPosts()
  }, [])

  // Handle new post creation
  const handleNewPost = (newPost) => {
    setPosts([newPost, ...posts])
  }

  // Handle post like update
  const handlePostUpdate = (postId, updatedPost) => {
    setPosts(posts.map(post => 
      post._id === postId ? updatedPost : post
    ))
  }

  if (loading) {
    return (
      <div className="container mt-4">
        <div className="d-flex justify-content-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading posts...</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mt-4">
      <div className="row justify-content-center">
        <div className="col-md-8 col-lg-6">
          
          {/* Welcome Message */}
          <div className="text-center mb-4">
            <h4 className="text-primary">
              {isAuthenticated ? `Welcome, ${user?.username}! 👋` : 'Explore Social Posts 🌟'}
            </h4>
            <p className="text-muted">
              {isAuthenticated 
                ? "Share what's on your mind with the community" 
                : "Join the community to share your thoughts and connect with others"
              }
            </p>
          </div>

          {/* Create Post Component - Only for logged in users */}
          {isAuthenticated && <CreatePost onNewPost={handleNewPost} />}

          {/* Login Prompt for guests */}
          {!isAuthenticated && (
            <div className="card shadow-sm mb-4">
              <div className="card-body text-center py-4">
                <i className="bi bi-people display-4 text-muted mb-3"></i>
                <h5 className="text-primary">Join the Conversation</h5>
                <p className="text-muted mb-3">
                  Login to share your thoughts, like posts, and comment
                </p>
                <div className="d-flex gap-2 justify-content-center">
                  <a href="/login" className="btn btn-primary">
                    <i className="bi bi-box-arrow-in-right me-2"></i>
                    Login
                  </a>
                  <a href="/register" className="btn btn-outline-primary">
                    <i className="bi bi-person-plus me-2"></i>
                    Register
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="alert alert-warning d-flex align-items-center">
              <i className="bi bi-exclamation-triangle me-2"></i>
              {error}
            </div>
          )}

          {/* Posts Feed */}
          <div className="mt-4">
            {posts.length === 0 ? (
              <div className="text-center py-5">
                <i className="bi bi-inbox display-1 text-muted"></i>
                <h5 className="mt-3 text-muted">No posts yet</h5>
                <p className="text-muted">
                  {isAuthenticated ? 'Be the first to share something!' : 'Be the first to join and share!'}
                </p>
              </div>
            ) : (
              posts.map(post => (
                <Post 
                  key={post._id} 
                  post={post} 
                  currentUser={user}
                  onPostUpdate={handlePostUpdate}
                />
              ))
            )}
          </div>

        </div>
      </div>
    </div>
  )
}

export default Feed