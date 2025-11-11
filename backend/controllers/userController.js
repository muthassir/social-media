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

    res.json({
      success: true,
      user: {
        ...user.toObject(),
        postsCount: userPosts.length,
        isFollowing
      },
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

    // Find target user
    const targetUser = await User.findOne({ username });
    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Find current user
    const currentUser = await User.findById(currentUserId);

    // Check if already following
    const isFollowing = currentUser.following.includes(targetUser._id);

    if (isFollowing) {
      // Unfollow: Remove from following and followers
      currentUser.following = currentUser.following.filter(
        id => id.toString() !== targetUser._id.toString()
      );
      targetUser.followers = targetUser.followers.filter(
        id => id.toString() !== currentUserId.toString()
      );
    } else {
      // Follow: Add to following and followers
      currentUser.following.push(targetUser._id);
      targetUser.followers.push(currentUserId);
    }

    await currentUser.save();
    await targetUser.save();

    res.json({
      success: true,
      message: isFollowing ? 'Unfollowed successfully' : 'Followed successfully',
      isFollowing: !isFollowing,
      followersCount: targetUser.followers.length // Use actual array length
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