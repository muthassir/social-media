const express = require('express');
const {
  createPost,
  getAllPosts,
  likePost,
  addComment
} = require('../controllers/postController.js');
const authMiddleware = require('../middleware/authMiddleware.js');

const router = express.Router();

router.post('/', authMiddleware, createPost);

router.get('/', getAllPosts);

router.post('/:id/like', authMiddleware, likePost);

router.post('/:id/comment', authMiddleware, addComment);

module.exports = router;