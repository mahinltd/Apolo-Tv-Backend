// ©2026 Apolo TV Mahin Ltd develop by (Tanvir)

const express = require('express');
const { getGlobalChannels } = require('../controllers/channel.controller');

const router = express.Router();

router.get('/', getGlobalChannels);

module.exports = router;
