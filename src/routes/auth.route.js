// ©2026 Apolo TV Mahin Ltd develop by (Tanvir)

const express = require('express');
const { registerUser, authUser } = require('../controllers/auth.controller');
const validate = require('../middlewares/validate.middleware');
const { registerSchema, loginSchema } = require('../validations/auth.validation');

const router = express.Router();

router.post('/register', validate(registerSchema), registerUser);
router.post('/login', validate(loginSchema), authUser);

module.exports = router;
