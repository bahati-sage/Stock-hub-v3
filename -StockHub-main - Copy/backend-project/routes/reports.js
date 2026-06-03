const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const auth = require('../middleware/auth');

router.get('/daily', auth, reportController.dailyReport);
router.get('/weekly', auth, reportController.weeklyReport);
router.get('/monthly', auth, reportController.monthlyReport);

module.exports = router;
