// ©2026 Apolo TV Mahin Ltd develop by (Tanvir)

const express = require('express');
const { protect } = require('../middlewares/auth.middleware');
const { getPaymentOptions, submitSubscription } = require('../controllers/payment.controller');
const validate = require('../middlewares/validate.middleware');
const { submitSubscriptionSchema } = require('../validations/payment.validation');

const router = express.Router();

router.get('/options', protect, getPaymentOptions);
router.post('/submit', protect, validate(submitSubscriptionSchema), submitSubscription);

module.exports = router;
