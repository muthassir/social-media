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
  const { HOST } = useAuth()

  // FIX: Consistent user ID comparison
  const isLiked = currentUser && post.likes.some(like => {
    const likeUserId = like.userId?.toString();
    const currentUserId = currentUser._id?.toString() || currentUser.id?.toString();
    return likeUserId === currentUserId;
  });

  const handleLike = async () => {
    if (!currentUser) {
      navigate('/login')
      return
    }

    if (loading) return

    setLoading(true)
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${HOST}/api/posts/${post._id}/like`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        // FIX: Properly update likes and counts
        const updatedPost = {
          ...post,
          likes: response.data.isLiked 
            ? [...post.likes, { 
                userId: currentUser._id || currentUser.id, 
                username: currentUser.username 
              }]
            : post.likes.filter(like => {
                const likeUserId = like.userId?.toString();
                const currentUserId = currentUser._id?.toString() || currentUser.id?.toString();
                return likeUserId !== currentUserId;
              }),
          // FIX: Update likes count properly
          likesCount: response.data.isLiked 
            ? (post.likesCount || post.likes.length) + 1 
            : Math.max((post.likesCount || post.likes.length) - 1, 0)
        };

        onPostUpdate(post._id, updatedPost);
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
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${HOST}/api/posts/${post._id}/comment`,
        { text: commentText },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data.success) {
        const updatedPost = {
          ...post,
          comments: [...post.comments, response.data.comment],
          // FIX: Update comments count
          commentsCount: (post.commentsCount || post.comments.length) + 1
        };
        
        onPostUpdate(post._id, updatedPost);
        setCommentText('');
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
        
        {/* Improved Header Alignment with Profile Picture */}
        <div className="d-flex align-items-center mb-3">
          <div className="flex-shrink-0">
            {post.userProfilePicture ? (
              <img
                src={post.userProfilePicture}
                alt={post.username}
                className="rounded-circle"
                style={{
                  width: '40px',
                  height: '40px',
                  objectFit: 'cover'
                }}
              />
            ) : (
              <i className="bi bi-person-circle text-muted fs-4"></i>
            )}
          </div>
          <div className="flex-grow-1 ms-3">
            <div className="d-flex flex-column">
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

        {/* Engagement Stats */}
        <div className="d-flex justify-content-between text-muted small mb-3">
          <span>
            <i className="bi bi-heart-fill text-danger me-1"></i>
            {post.likesCount || post.likes?.length || 0} likes
          </span>
          <span 
            className="text-primary cursor-pointer"
            style={{ cursor: 'pointer' }}
            onClick={() => setShowComments(!showComments)}
          >
            <i className="bi bi-chat me-1"></i>
            {post.commentsCount || post.comments?.length || 0} comments
          </span>
        </div>

        {/* Action Buttons */}
        {currentUser && (
          <div className="d-flex gap-2 border-top border-bottom py-2 mb-3">
            <button
              className={`btn btn-sm flex-grow-1 ${isLiked ? 'btn-danger' : 'btn-outline-secondary'}`}
              onClick={handleLike}
              disabled={loading}
            >
              {loading ? (
                <span className="spinner-border spinner-border-sm me-1"></span>
              ) : (
                <i className={`bi ${isLiked ? 'bi-heart-fill' : 'bi-heart'} me-1`}></i>
              )}
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
                <Link to="/login" className="text-primary text-decoration-none">
                  Login
                </Link> to like and comment on this post
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
                  <div key={index} className="d-flex align-items-start mb-2">
                    <div className="flex-shrink-0 me-2">
                      <i className="bi bi-person-circle text-muted"></i>
                    </div>
                    <div className="flex-grow-1">
                      <div className="bg-light rounded p-2">
                        <div className="d-flex justify-content-between align-items-start mb-1">
                          <h6 className="mb-0 small fw-bold">{comment.username}</h6>
                          <small className="text-muted">
                            {formatDate(comment.createdAt)}
                          </small>
                        </div>
                        <p className="mb-0 small">{comment.text}</p>
                      </div>
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