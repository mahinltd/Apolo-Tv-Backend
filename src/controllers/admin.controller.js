// ©2026 Apolo TV Mahin Ltd develop by (Tanvir)

const Subscription = require('../models/Subscription.model');
const User = require('../models/User.model');
const { sendUserPaymentSuccess } = require('../services/email.service');

const approveSubscription = async (req, res, next) => {
  try {
    const { id } = req.params;

    const subscription = await Subscription.findById(id);

    if (!subscription) {
      return res.status(404).json({
        status: 'error',
        message: 'Subscription not found',
      });
    }

    subscription.status = 'active';
    subscription.expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    await subscription.save();

    const user = await User.findById(subscription.user);
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'Associated user not found',
      });
    }

    user.isPremium = true;
    await user.save();

    // Notify user about subscription activation
    sendUserPaymentSuccess(user, subscription).catch((err) => console.error(err));

    return res.status(200).json({
      status: 'success',
      message: 'Subscription approved successfully',
      subscription,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        country: user.country,
        isPremium: user.isPremium,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { approveSubscription };
