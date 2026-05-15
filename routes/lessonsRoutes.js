const express = require('express');
const router = express.Router();
const lessonController = require('../controllers/lessonsController.js');

router.get('/', lessonController.getLessons);
router.get('/:lessonId', (req, res, next) => {
    req.params.id = req.params.lessonId;
    return lessonController.getLessonById(req, res, next);
});

module.exports = router;
