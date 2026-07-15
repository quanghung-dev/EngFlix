const express = require('express');
const topicsController = require('../controllers/topicsController.js');

const router = express.Router();

router.get('/overview', topicsController.getOverview);

module.exports = router;
