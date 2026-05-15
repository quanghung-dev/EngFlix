const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController.js');
const verifyToken = require('../middlewares/auth.js');

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication APIs
 */

/**
 * @swagger
 * /api/v1/auth/clerk/login:
 *   post:
 *     summary: Login with Clerk using email or username and password
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - identifier
 *               - password
 *             properties:
 *               identifier:
 *                 type: string
 *                 description: Clerk sign-in identifier, such as email or username
 *               password:
 *                 type: string
 *                 format: password
 *           example:
 *             identifier: user@example.com
 *             password: your-password
 *     responses:
 *       200:
 *         description: Raw Clerk response
 *       400:
 *         description: Missing identifier or password
 *       401:
 *         description: Clerk authentication failed
 *       422:
 *         description: Clerk validation error
 *       500:
 *         description: Internal server error
 */
router.post('/clerk/login', authController.loginWithClerk);

/**
 * @swagger
 * /api/v1/auth/clerk/register:
 *   post:
 *     summary: Register with Clerk using email and password
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email_address
 *               - password
 *             properties:
 *               email_address:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *               first_name:
 *                 type: string
 *               last_name:
 *                 type: string
 *               username:
 *                 type: string
 *           example:
 *             email_address: user@example.com
 *             password: your-password
 *             first_name: John
 *             last_name: Doe
 *             username: johndoe
 *     responses:
 *       200:
 *         description: Raw Clerk response after preparing email verification
 *       400:
 *         description: Missing email_address or password
 *       422:
 *         description: Clerk validation error
 *       500:
 *         description: Internal server error
 */
router.post('/clerk/register', authController.registerWithClerk);

router.post('/sync', verifyToken, authController.syncUser);

module.exports = router;
