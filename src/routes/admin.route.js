// ©2026 Apolo TV Mahin Ltd develop by (Tanvir)

const express = require('express');
const { protect, adminProtect } = require('../middlewares/auth.middleware');
const { approveSubscription } = require('../controllers/admin.controller');

const router = express.Router();

router.put('/subscriptions/:id/approve', protect, adminProtect, approveSubscription);

module.exports = router;
