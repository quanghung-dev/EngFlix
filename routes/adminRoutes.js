const express = require('express');
const router = express.Router();

const adminControllers = require('../controllers/adminController.js');
const lessonsAdminRoutes = require('./lessonsAdminRoutes.js');
const categoryAdminRoutes = require('./categoryAdminRoutes.js');
const transcriptAdminRoutes = require('./transcriptAdminRoutes.js');
const verifyToken = require('../middlewares/auth.js');
const requireRole = require('../middlewares/role.js');
const ROLES = require('../constants/roles.js');

router.get('/dashboard', verifyToken, requireRole(ROLES.Admin), adminControllers.getDashboardData);

router.use('/lessons', lessonsAdminRoutes);
router.use('/categories', categoryAdminRoutes);
router.use('/transcripts', transcriptAdminRoutes);

module.exports = router;
