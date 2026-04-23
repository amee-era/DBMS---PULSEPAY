const express = require('express');
const { getDashboard, transferMoney } = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/dashboard', authMiddleware, getDashboard);
router.post('/transfer', authMiddleware, transferMoney);

module.exports = router;
