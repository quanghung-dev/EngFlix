const express = require('express');
const router = express.Router();
const categoriesController = require('../controllers/categoryController.js');

router.get('/', categoriesController.getAllCategories);

module.exports = router;
