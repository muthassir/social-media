const Post = require('../models/Post.js');
const User = require('../models/User.js');

// Create a new post
const createPost = async (req, res) => {
  try {
    const { text, image } = req.body;
    const userId = req.userId;

    if (!text && !image) {
      return res.status(400).json({
        success: false,
        message: 'Please provide either text or image for the post'
      });
    }

    // Get user details for the post
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Create new post
    const newPost = new Post({
      userId,
      username: user.username,
      text: text || '',
      image: image || '' // Cloudinary URL from frontend
    });

    await newPost.save();

    // Return the created post
    res.status(201).json({
      success: true,
      message: 'Post created successfully',
      post: newPost
    });

  } catch (error) {
    console.log('Create post error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating post'
    });
  }
};

// Get all posts for feed
const getAllPosts = async (req, res) => {
  try {
    // Get posts sorted by latest first, and populate necessary fields
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .limit(20); // Simple pagination

    res.json({
      success: true,
      posts,
      total: posts.length
    });

  } catch (error) {
    console.log('Get posts error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching posts'
    });
  }
};

// Like or unlike a post
const likePost = async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.userId;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // FIX: Consistent ID comparison
    const alreadyLiked = post.likes.some(like => 
      like.userId.toString() === userId.toString()
    );

    if (alreadyLiked) {
      // Remove like
      post.likes = post.likes.filter(like => 
        like.userId.toString() !== userId.toString()
      );
    } else {
      // Add like
      post.likes.push({
        userId: userId,
        username: user.username
      });
    }

    await post.save();

    // FIX: Return consistent data
    res.json({
      success: true,
      message: alreadyLiked ? 'Post unliked' : 'Post liked',
      isLiked: !alreadyLiked, 
      likesCount: post.likes.length,
      post: post
    });

  } catch (error) {
    console.log('Like post error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while processing like'
    });
  }
};

// Add comment to a post
const addComment = async (req, res) => {
  try {
    const postId = req.params.id;
    const { text } = req.body;
    const userId = req.userId;

    // Validate comment text
    if (!text || text.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Comment text is required'
      });
    }

    // Find the post
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Get user details
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Add comment to post
    post.comments.push({
      userId,
      username: user.username,
      text: text.trim()
    });

    await post.save();

    // Get the last comment (the one we just added)
    const newComment = post.comments[post.comments.length - 1];

    res.status(201).json({
      success: true,
      message: 'Comment added successfully',
      comment: newComment,
      commentsCount: post.commentsCount
    });

  } catch (error) {
    console.log('Add comment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while adding comment'
    });
  }
};

module.exports = {
  createPost,
  getAllPosts,
  likePost,
  addComment
};