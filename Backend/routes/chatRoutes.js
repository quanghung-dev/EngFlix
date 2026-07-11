const express = require('express');
const router = express.Router();
const verifyToken = require('../middlewares/auth.js');
const chatController = require('../controllers/chatController.js');

// Định nghĩa các route chat cộng đồng (yêu cầu verifyToken)
router.get('/', verifyToken, chatController.getMessages);
router.post('/', verifyToken, chatController.sendMessage);

module.exports = router;
