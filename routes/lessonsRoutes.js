const express = require('express');
const router = express.Router();
const verifyToken = require('../middlewares/auth.js');
const requireRole = require('../middlewares/role.js');
const ROLES = require('../constants/roles.js');
const lessonController = require('../controllers/lessonsController.js');

router.get('/', lessonController.getLessons);
router.get('/:id', lessonController.getLessonById);
router.post('/', lessonController.createLesson);
router.put('/:id', lessonController.updateLesson);
router.delete('/:id', lessonController.deleteLesson);

module.exports = router;
