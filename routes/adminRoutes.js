const express = require('express');
const router = express.Router();

const adminControllers = require('../controllers/adminController.js');
const lessonController = require('../controllers/lessonsController.js');
const categoriesController = require('../controllers/categoryController.js');
const verifyToken = require('../middlewares/auth.js');
const requireRole = require('../middlewares/role.js');
const ROLES = require('../constants/roles.js');

router.get('/dashboard', verifyToken, requireRole(ROLES.Admin), adminControllers.getDashboardData);

router.get('/lessons', verifyToken, requireRole(ROLES.Admin), lessonController.getLessons);
router.get('/lessons/:id', verifyToken, requireRole(ROLES.Admin), lessonController.getLessonById);
router.post('/lessons', verifyToken, requireRole(ROLES.Admin), lessonController.createLesson);
router.put('/lessons/:id', verifyToken, requireRole(ROLES.Admin), lessonController.updateLesson);
router.delete('/lessons/:id', verifyToken, requireRole(ROLES.Admin), lessonController.deleteLesson);

router.get('/categories', verifyToken, requireRole(ROLES.Admin), categoriesController.getAllCategories);
router.get('/categories/:id', verifyToken, requireRole(ROLES.Admin), categoriesController.getCategoryById);
router.post('/categories', verifyToken, requireRole(ROLES.Admin), categoriesController.createCategory);
router.put('/categories/:id', verifyToken, requireRole(ROLES.Admin), categoriesController.updateCategory);
router.delete('/categories/:id', verifyToken, requireRole(ROLES.Admin), categoriesController.deleteCategory);

module.exports = router;
