// routes/bankRoutes.js
const express = require('express');
const router = express.Router();
const { createAccount, deposit, withdraw, sendMoney, getHistory } = require('../controllers/bankController');

// POST route to create an account
router.post('/create', createAccount);

// Other routes for deposit, withdraw, sendMoney, etc.
router.post('/deposit', deposit);
router.post('/withdraw', withdraw);
router.post('/send', sendMoney);
router.get('/history', getHistory);

module.exports = router;
 