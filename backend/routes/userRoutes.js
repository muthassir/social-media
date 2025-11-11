const express = require('express');
const {
  getUserProfile,
  toggleFollow,
  updateProfile
} = require('../controllers/userController.js');
const authMiddleware = require('../middleware/authMiddleware.js');

const router = express.Router();

router.get('/:username', getUserProfile);
router.post('/:username/follow', authMiddleware, toggleFollow);
router.put('/profile', authMiddleware, updateProfile);

module.exports = router;