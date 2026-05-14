const express = require('express');
const router = express.Router();

const adminControllers = require('../controllers/adminController.js');
const verifyToken = require('../middlewares/auth.js');
const requireRole = require('../middlewares/role.js');
const ROLES = require('../constants/roles.js');

router.get('/dashboard', verifyToken, requireRole(ROLES.Admin), adminControllers.getDashboardData);

module.exports = router;
