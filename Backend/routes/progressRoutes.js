const express = require('express');
const router = express.Router();
const verifyToken = require('../middlewares/auth.js');
const progressController = require('../controllers/progressController.js');

// Định nghĩa route thống kê tiến trình học tập
router.get('/stats', verifyToken, progressController.getStats);

module.exports = router;
