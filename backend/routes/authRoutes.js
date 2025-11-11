const express = require('express');
const {
  registerUser,
  loginUser,
  getCurrentUser
} = require('../controllers/authController.js');
const authMiddleware = require('../middleware/authMiddleware.js');

const router = express.Router();

router.post('/register', registerUser);

router.post('/login', loginUser);

router.get('/me', authMiddleware, getCurrentUser);

module.exports = router;