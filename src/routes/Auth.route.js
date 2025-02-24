const express = require('express');
const { loginUser, registerUser, upgradeToPremium } = require('../controllers/Auth.controller');
const { verifyToken } = require('../middlewares/Auth.middleware');
const router = express.Router();

router.post('/login', [loginUser, verifyToken]);
router.post('/register', registerUser);
router.post('/upgrade/:userId', upgradeToPremium);

module.exports = router;
