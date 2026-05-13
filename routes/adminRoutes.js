const express = require('express');
const router = express.Router();

const adminControllers = require('../controllers/adminController.js');
const adminServices = require('../services/adminServices.js');
const verifyToken = require('../middlewares/auth.js');
const requireRole = require('../middlewares/role.js');


router.get('/dashboard', verifyToken, requireRole('admin'), adminControllers.getDashboardData);

module.exports = router;
