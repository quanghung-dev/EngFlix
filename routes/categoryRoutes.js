const express = require('express');
const router = express.Router();
const verifyToken = require('../middlewares/auth.js');
const requireRole = require('../middlewares/role.js');
const ROLES = require('../constants/roles.js');
const categoriesController = require('../controllers/categoryController.js');

router.get('/', categoriesController.getAllCategories);
router.post('/', verifyToken, requireRole(ROLES.Admin), categoriesController.createCategory);
router.put('/:id', verifyToken, requireRole(ROLES.Admin), categoriesController.updateCategory);
router.delete('/:id', verifyToken, requireRole(ROLES.Admin), categoriesController.deleteCategory);

module.exports = router;
