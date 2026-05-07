// ©2026 Apolo TV Mahin Ltd develop by (Tanvir)

const axios = require('axios');
const User = require('../models/User.model');
const Subscription = require('../models/Subscription.model');
const { sendAdminPaymentAlert } = require('../services/email.service');

const getClientIp = (req) => {
  const forwardedFor = req.headers['x-forwarded-for'];
  const forwardedIp = Array.isArray(forwardedFor)
    ? forwardedFor[0]
    : forwardedFor && forwardedFor.split(',')[0]
      ? forwardedFor.split(',')[0].trim()
      : null;

  return forwardedIp || req.socket?.remoteAddress || '127.0.0.1';
};

const isLocalIp = (ip) => {
  const normalizedIp = (ip || '').replace('::ffff:', '').trim();

  return (
    !normalizedIp ||
    normalizedIp === '::1' ||
    normalizedIp === '127.0.0.1' ||
    normalizedIp === 'localhost' ||
    normalizedIp.startsWith('10.') ||
    normalizedIp.startsWith('192.168.') ||
    /^172\.(1[6-9]|2\d|3[0-1])\./.test(normalizedIp)
  );
};

const getPaymentOptions = async (req, res, next) => {
  try {
    const clientIp = getClientIp(req);
    let country = 'Global';

    if (!isLocalIp(clientIp)) {
      try {
        const geoResponse = await axios.get(`http://ip-api.com/json/${clientIp}`);
        if (geoResponse.data && geoResponse.data.status === 'success') {
          country = geoResponse.data.country || 'Global';
        }
      } catch (geoError) {
        console.error(`❌ Geo-IP lookup failed for ${clientIp}: ${geoError.message}`);
      }
    }

    const user = await User.findById(req.user._id);
    if (user) {
      user.country = country;
      await user.save();
      req.user.country = country;
    }

    if (country === 'Bangladesh') {
      return res.status(200).json({
        status: 'success',
        country,
        pricing: {
          currency: 'BDT',
          amount: 100,
        },
        paymentMethods: ['bKash', 'Nagad', 'Rocket'],
      });
    }

    return res.status(200).json({
      status: 'success',
      country,
      pricing: {
        currency: 'USD',
        amount: 2.99,
      },
      paymentMethods: ['PayPal'],
    });
  } catch (error) {
    next(error);
  }
};

const submitSubscription = async (req, res, next) => {
  try {
    const { planType, paymentMethod, amount, transactionId } = req.body;

    if (!planType || !paymentMethod || amount === undefined || amount === null) {
      return res.status(400).json({
        status: 'error',
        message: 'planType, paymentMethod, and amount are required',
      });
    }

    const manualMethods = ['bKash', 'Nagad', 'Rocket'];
    if (manualMethods.includes(paymentMethod) && !transactionId) {
      return res.status(400).json({
        status: 'error',
        message: 'transactionId is required for manual payment methods',
      });
    }

    const subscription = await Subscription.create({
      user: req.user._id,
      planType,
      paymentMethod,
      transactionId: transactionId || undefined,
      amount,
      status: 'pending',
    });

    // Trigger admin alert for Bangladesh manual payments
    if (planType === 'BD_MANUAL') {
      sendAdminPaymentAlert(req.user, subscription).catch((err) => console.error(err));
    }

    return res.status(201).json({
      status: 'success',
      subscription,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getPaymentOptions, submitSubscription };
