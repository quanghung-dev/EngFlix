const express = require('express');
const router = express.Router();
const verifyToken = require('../middlewares/auth.js');
const friendshipController = require('../controllers/friendshipController.js');

// Định nghĩa các endpoint quản lý mối quan hệ bạn bè (yêu cầu verifyToken)
router.get('/', verifyToken, friendshipController.getFriendsList);
router.get('/requests', verifyToken, friendshipController.getIncomingRequests);
router.get('/search', verifyToken, friendshipController.searchNewFriends);
router.get('/status/:userId', verifyToken, friendshipController.getStatus);
router.post('/requests', verifyToken, friendshipController.sendRequest);
router.put('/requests/:id', verifyToken, friendshipController.acceptRequest);
router.delete('/:id', verifyToken, friendshipController.declineOrRemove);

module.exports = router;
