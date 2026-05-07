// ©2026 Apolo TV Mahin Ltd develop by (Tanvir)

const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    planType: {
      type: String,
      enum: ['BD_MANUAL', 'GLOBAL_AUTO'],
      required: true,
    },
    paymentMethod: {
      type: String,
      enum: ['bKash', 'Nagad', 'Rocket', 'PayPal'],
      required: true,
    },
    transactionId: {
      type: String,
    },
    amount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'active', 'rejected', 'expired'],
      default: 'pending',
    },
    expiresAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

const Subscription = mongoose.model('Subscription', subscriptionSchema);

module.exports = Subscription;