const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController.js');
const verifyToken = require('../middlewares/auth.js');


router.post('/sync', verifyToken, authController.syncUser);

module.exports = router;