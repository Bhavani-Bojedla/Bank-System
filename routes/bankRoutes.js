const express = require("express");
// const { login } = require("../controllers/authController");
const {login, deposit, withdraw, sendMoney,getHistory, createAccount } = require("../controllers/bankController");
const authenticateToken = require("../middleware/authenticateToken");

const router = express.Router();

router.post('/create', createAccount);
router.post("/login", login);
router.post('/deposit',authenticateToken, deposit);
router.post('/withdraw',authenticateToken, withdraw);
router.post('/send',authenticateToken, sendMoney);
router.get('/history',authenticateToken, getHistory);

module.exports = router;