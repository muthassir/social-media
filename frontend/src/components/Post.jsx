import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'

const Post = ({ post, currentUser, onPostUpdate }) => {
  const [commentText, setCommentText] = useState('')
  const [showComments, setShowComments] = useState(false)
  const [loading, setLoading] = useState(false)
  const [commentLoading, setCommentLoading] = useState(false)
  const navigate = useNavigate()
  const {HOST} = useAuth()

  const isLiked = currentUser && post.likes.some(like => 
    like.userId === currentUser?.id || like.userId === currentUser?._id
  )

  const handleLike = async () => {
    if (!currentUser) {
      navigate('/login')
      return
    }

    if (loading) return

    setLoading(true)
    try {
      const response = await axios.post(`${HOST}/api/posts/${post._id}/like`)
      if (response.data.success) {
        onPostUpdate(post._id, { 
          ...post, 
          likes: response.data.isLiked 
            ? [...post.likes, { userId: currentUser.id, username: currentUser.username }]
            : post.likes.filter(like => 
                like.userId !== currentUser.id && like.userId !== currentUser._id
              )
        })
      }
    } catch (error) {
      console.log('Error liking post:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddComment = async (e) => {
    e.preventDefault()
    
    if (!currentUser) {
      navigate('/login')
      return
    }
    
    if (!commentText.trim() || commentLoading) return

    setCommentLoading(true)
    try {
      const response = await axios.post(`${HOST}/api/posts/${post._id}/comment`, {
        text: commentText
      })
      
      if (response.data.success) {
        onPostUpdate(post._id, {
          ...post,
          comments: [...post.comments, response.data.comment]
        })
        setCommentText('')
      }
    } catch (error) {
      console.log('Error adding comment:', error)
    } finally {
      setCommentLoading(false)
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = (now - date) / (1000 * 60 * 60)
    
    if (diffInHours < 1) {
      return 'Just now'
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`
    } else {
      return date.toLocaleDateString()
    }
  }

  return (
    <div className="card shadow-sm mb-4">
      <div className="card-body">
        
        <div className="d-flex align-items-center mb-3">
          <div className="flex-shrink-0">
            <i className="bi bi-person-circle text-muted fs-4"></i>
          </div>
          <div className="flex-grow-1 ms-3">
              <Link 
              to={`/user/${post.username}`}
              className="text-decoration-none fw-bold text-dark"
            >
              {post.username}
            </Link>
            <small className="text-muted">
              {formatDate(post.createdAt)}
            </small>
          </div>
        </div>

        {post.text && (
          <p className="card-text mb-3">{post.text}</p>
        )}

        {post.image && (
          <div className="mb-3">
            <img
              src={post.image}
              alt="Post"
              className="img-fluid rounded"
              style={{ maxHeight: '400px', objectFit: 'cover', width: '100%' }}
            />
          </div>
        )}

        <div className="d-flex justify-content-between text-muted small mb-3">
          <span>
            <i className="bi bi-heart-fill text-danger me-1"></i>
            {post.likesCount || post.likes.length} likes
          </span>
          <span 
            className="text-primary cursor-pointer"
            style={{ cursor: 'pointer' }}
            onClick={() => setShowComments(!showComments)}
          >
            <i className="bi bi-chat me-1"></i>
            {post.commentsCount || post.comments.length} comments
          </span>
        </div>

        {currentUser && (
          <div className="d-flex gap-2 border-top border-bottom py-2 mb-3">
            <button
              className={`btn btn-sm flex-grow-1 ${isLiked ? 'btn-danger' : 'btn-outline-secondary'}`}
              onClick={handleLike}
              disabled={loading}
            >
              <i className={`bi ${isLiked ? 'bi-heart-fill' : 'bi-heart'} me-1`}></i>
              {isLiked ? 'Liked' : 'Like'}
            </button>
            <button
              className="btn btn-outline-secondary btn-sm flex-grow-1"
              onClick={() => setShowComments(!showComments)}
            >
              <i className="bi bi-chat me-1"></i>
              Comment
            </button>
          </div>
        )}

        {!currentUser && (
          <div className="border-top border-bottom py-2 mb-3">
            <div className="text-center">
              <small className="text-muted">
                <a href="/login" className="text-primary text-decoration-none">
                  Login
                </a> to like and comment on this post
              </small>
            </div>
          </div>
        )}

        {/* Comments Section */}
        {showComments && (
          <div className="mt-3">
            {currentUser && (
              <form onSubmit={handleAddComment} className="mb-3">
                <div className="input-group">
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    placeholder="Write a comment..."
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    disabled={commentLoading}
                  />
                  <button
                    type="submit"
                    className="btn btn-primary btn-sm"
                    disabled={!commentText.trim() || commentLoading}
                  >
                    {commentLoading ? (
                      <span className="spinner-border spinner-border-sm"></span>
                    ) : (
                      <i className="bi bi-send"></i>
                    )}
                  </button>
                </div>
              </form>
            )}

            {/* Comments List */}
            <div className="comments-section">
              {post.comments.length === 0 ? (
                <p className="text-muted text-center small py-2">
                  No comments yet. {currentUser ? 'Be the first to comment!' : 'Login to be the first to comment!'}
                </p>
              ) : (
                post.comments.map((comment, index) => (
                  <div key={index} className="d-flex mb-2">
                    <div className="flex-shrink-0">
                      <i className="bi bi-person-circle text-muted"></i>
                    </div>
                    <div className="flex-grow-1 ms-2 bg-light rounded p-2">
                      <div className="d-flex justify-content-between align-items-start">
                        <h6 className="mb-0 small fw-bold">{comment.username}</h6>
                        <small className="text-muted">
                          {formatDate(comment.createdAt)}
                        </small>
                      </div>
                      <p className="mb-0 small">{comment.text}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Post