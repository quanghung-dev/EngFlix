const express = require('express');
const router = express.Router();
const verifyToken = require('../middlewares/auth.js');
const postController = require('../controllers/postController.js');

// Định nghĩa các endpoint bài viết cộng đồng (yêu cầu verifyToken)
router.get('/feed', verifyToken, postController.getFeed);
router.post('/', verifyToken, postController.createNewPost);
router.get('/user/:userId', verifyToken, postController.getUserWall);
router.delete('/:id', verifyToken, postController.deleteUserPost);
router.post('/:id/like', verifyToken, postController.likePost);
router.get('/:id/comments', verifyToken, postController.getComments);
router.post('/:id/comments', verifyToken, postController.postComment);

module.exports = router;
