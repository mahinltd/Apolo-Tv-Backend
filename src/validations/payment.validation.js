// ©2026 Apolo TV Mahin Ltd develop by (Tanvir)

const { z } = require('zod');

const submitSubscriptionSchema = z
  .object({
    planType: z.enum(['BD_MANUAL', 'GLOBAL_AUTO'], {
      errorMap: () => ({ message: 'planType must be BD_MANUAL or GLOBAL_AUTO' }),
    }),
    paymentMethod: z.enum(['bKash', 'Nagad', 'Rocket', 'PayPal'], {
      errorMap: () => ({ message: 'paymentMethod must be bKash, Nagad, Rocket, or PayPal' }),
    }),
    amount: z.number({ invalid_type_error: 'amount must be a number' }).positive('amount must be greater than 0'),
    transactionId: z.string().trim().min(1, 'transactionId cannot be empty').optional(),
  })
  .superRefine((data, ctx) => {
    const manualMethods = ['bKash', 'Nagad', 'Rocket'];
    if (manualMethods.includes(data.paymentMethod) && !data.transactionId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['transactionId'],
        message: 'transactionId is required for manual payment methods',
      });
    }
  });

module.exports = { submitSubscriptionSchema };