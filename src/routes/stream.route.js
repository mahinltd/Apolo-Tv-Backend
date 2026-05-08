// ©2026 Apolo TV Mahin Ltd develop by (Tanvir)

const express = require('express');
const { watchStream } = require('../controllers/stream.controller');

const router = express.Router();

router.get('/watch', watchStream);

module.exports = router;