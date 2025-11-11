const User = require('../models/User.js');
const Post = require('../models/Post.js');

const getUserProfile = async (req, res) => {
  try {
    const { username } = req.params;

    const user = await User.findOne({ username }).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get user's posts
    const userPosts = await Post.find({ username })
      .sort({ createdAt: -1 })
      .limit(50);

    // Check if current user is following this user
    let isFollowing = false;
    if (req.userId) {
      const currentUser = await User.findById(req.userId);
      isFollowing = currentUser.following.includes(user._id);
    }

    // Now toObject() will include the virtual fields automatically
    const userWithData = {
      ...user.toObject(),
      postsCount: userPosts.length,
      isFollowing
    };

    res.json({
      success: true,
      user: userWithData,
      posts: userPosts
    });

  } catch (error) {
    console.log('Get user profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching user profile'
    });
  }
};

const toggleFollow = async (req, res) => {
  try {
    const { username } = req.params;
    const currentUserId = req.userId;

    const targetUser = await User.findOne({ username });
    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const currentUser = await User.findById(currentUserId);

    // Check if already following
    const isCurrentlyFollowing = currentUser.following.includes(targetUser._id);

    if (isCurrentlyFollowing) {
      // Unfollow
      currentUser.following.pull(targetUser._id);
      targetUser.followers.pull(currentUserId);
    } else {
      // Follow
      currentUser.following.push(targetUser._id);
      targetUser.followers.push(currentUserId);
    }

    await currentUser.save();
    await targetUser.save();

    // FIX: Return consistent data structure
    res.json({
      success: true,
      message: isCurrentlyFollowing ? 'Unfollowed successfully' : 'Followed successfully',
      isFollowing: !isCurrentlyFollowing, // This is the NEW state
      followersCount: targetUser.followers.length
    });

  } catch (error) {
    console.log('Follow/unfollow error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while processing follow'
    });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { fullName, bio, profilePicture } = req.body;
    const userId = req.userId;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { fullName, bio, profilePicture },
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: updatedUser
    });

  } catch (error) {
    console.log('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating profile'
    });
  }
};

module.exports = {
  getUserProfile,
  toggleFollow,
  updateProfile
};