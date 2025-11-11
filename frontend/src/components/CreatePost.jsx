import React, { useState } from 'react'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'

// Cloudinary configuration
const CLOUD_NAME = 'de13d1vnc' 
const UPLOAD_PRESET = 'my_upload_preset'

 


const CreatePost = ({ onNewPost }) => {
  const [text, setText] = useState('')
  const [image, setImage] = useState('')
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)

  const { user, HOST } = useAuth()

  // Upload image to Cloudinary
  const uploadToCloudinary = async (file) => {
    setUploading(true)
    
    const formData = new FormData()
    formData.append('file', file)
    formData.append('upload_preset', UPLOAD_PRESET)
    
    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
        {
          method: 'POST',
          body: formData,
        }
      )
      
      const data = await response.json()
      
      if (data.secure_url) {
        setImage(data.secure_url)
        setError('')
      } else {
        throw new Error('Upload failed')
      }
    } catch (error) {
      console.error('Cloudinary upload error:', error)
      setError('Failed to upload image. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  // Handle image file selection
  const handleImageUpload = (e) => {
    const file = e.target.files[0]
    
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file')
      return
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size should be less than 5MB')
      return
    }

    setError('')
    uploadToCloudinary(file)
  }

  // Remove selected image
  const removeImage = () => {
    setImage('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validate that at least one field is filled
    if (!text.trim() && !image) {
      setError('Please add some text or an image')
      return
    }

    setLoading(true)
    setError('')

    try {
      const token = localStorage.getItem('token')
      const response = await axios.post(`${HOST}/api/posts`, {
        text: text.trim(),
        image: image
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.data.success) {
        // Call parent callback with new post
        onNewPost(response.data.post)
        // Reset form
        setText('')
        setImage('')
        setShowForm(false)
        setError('')
      }
    } catch (error) {
      console.log('Error creating post:', error)
      setError('Failed to create post. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (!showForm) {
    return (
      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <div 
            className="d-flex align-items-center p-2 border rounded cursor-pointer"
            onClick={() => setShowForm(true)}
            style={{ cursor: 'pointer' }}
          >
            <div className="flex-shrink-0">
              <i className="bi bi-person-circle text-muted fs-4"></i>
            </div>
            <div className="flex-grow-1 ms-3">
              <span className="text-muted">
                What's on your mind, {user?.username}?
              </span>
            </div>
            <div>
              <i className="bi bi-image text-muted me-2"></i>
              <i className="bi bi-camera-video text-muted"></i>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="card shadow-sm mb-4">
      <div className="card-body">
        {/* Form Header */}
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h6 className="card-title mb-0">Create Post</h6>
          <button 
            type="button" 
            className="btn-close" 
            onClick={() => setShowForm(false)}
            disabled={loading || uploading}
          ></button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="alert alert-warning py-2">
            <small>
              <i className="bi bi-exclamation-triangle me-1"></i>
              {error}
            </small>
          </div>
        )}

        {/* Create Post Form */}
        <form onSubmit={handleSubmit}>
          {/* Text Input */}
          <div className="mb-3">
            <textarea
              className="form-control"
              rows="3"
              placeholder="What's on your mind?"
              value={text}
              onChange={(e) => setText(e.target.value)}
              disabled={loading || uploading}
            ></textarea>
          </div>

          {/* Image Upload */}
          <div className="mb-3">
            <label htmlFor="imageUpload" className="form-label small text-muted">
              Add Image
            </label>
            <input
              type="file"
              className="form-control form-control-sm"
              id="imageUpload"
              accept="image/*"
              onChange={handleImageUpload}
              disabled={loading || uploading}
            />
            <div className="form-text">
              Supported formats: JPG, PNG, GIF. Max size: 5MB
            </div>
          </div>

          {/* Image Preview */}
          {image && (
            <div className="mb-3">
              <div className="position-relative">
                <img 
                  src={image} 
                  alt="Preview" 
                  className="img-fluid rounded"
                  style={{ maxHeight: '200px' }}
                />
                <button
                  type="button"
                  className="btn btn-danger btn-sm position-absolute top-0 end-0 m-2"
                  onClick={removeImage}
                  disabled={uploading}
                >
                  <i className="bi bi-x"></i>
                </button>
              </div>
              {uploading && (
                <div className="text-center mt-2">
                  <div className="spinner-border spinner-border-sm text-primary" role="status">
                    <span className="visually-hidden">Uploading...</span>
                  </div>
                  <small className="text-muted ms-2">Uploading image...</small>
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="d-flex gap-2">
            <button
              type="submit"
              className="btn btn-primary flex-grow-1"
              disabled={loading || uploading || (!text.trim() && !image)}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2"></span>
                  Posting...
                </>
              ) : (
                <>
                  <i className="bi bi-send me-2"></i>
                  Post
                </>
              )}
            </button>
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={() => setShowForm(false)}
              disabled={loading || uploading}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreatePost