// ©2026 Apolo TV Mahin Ltd develop by (Tanvir)

const express = require('express');
const { watchStream, playStream, playTemporaryStream, relayStreamAsset } = require('../controllers/stream.controller');

const router = express.Router();

router.get('/play/temp/:token', playTemporaryStream);
router.get('/play/:id', playStream);
router.get('/play/:id/asset', relayStreamAsset);
router.get('/watch', watchStream);

module.exports = router;