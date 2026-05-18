const express = require('express');
const router = express.Router();

const adminControllers = require('../controllers/adminController.js');
const lessonsAdminRoutes = require('./lessonsAdminRoutes.js');
const categoryAdminRoutes = require('./categoryAdminRoutes.js');
const transcriptAdminRoutes = require('./transcriptAdminRoutes.js');
const verifyToken = require('../middlewares/auth.js');
const requireRole = require('../middlewares/role.js');
const ROLES = require('../constants/roles.js');

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Admin dashboard APIs
 */

/**
 * @swagger
 * /api/v1/admin/dashboard:
 *   get:
 *     summary: Get admin dashboard data
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard data returned successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 stats:
 *                   type: object
 *                   properties:
 *                     totalUsers:
 *                       type: integer
 *                     activeNow:
 *                       type: integer
 *             example:
 *               message: "Welcome to the admin dashboard"
 *               stats:
 *                 totalUsers: 100
 *                 activeNow: 5
 *       401:
 *         description: Missing or expired bearer token
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Internal server error
 */
router.use(verifyToken, requireRole(ROLES.Admin));

router.get('/dashboard', adminControllers.getDashboardData);

router.use('/lessons', lessonsAdminRoutes);
router.use('/categories', categoryAdminRoutes);
router.use('/transcripts', transcriptAdminRoutes);

module.exports = router;
