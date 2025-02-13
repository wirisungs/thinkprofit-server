const express = require('express');
const { loginUser, registerUser } = require('../controllers/Auth.controller');
const { verifyToken } = require('../middlewares/Auth.middleware');
const router = express.Router();

router.post('/login', [loginUser, verifyToken]);
router.post('/register', registerUser);

module.exports = router;
