// ©2026 Apolo TV Mahin Ltd develop by (Tanvir)

const { ZodError } = require('zod');

const validate = (schema) => {
  return (req, res, next) => {
    try {
      req.body = schema.parse(req.body);
      return next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.issues.map((issue) => ({
          field: issue.path.join('.') || 'body',
          message: issue.message,
        }));

        return res.status(400).json({
          status: 'error',
          message: 'Validation failed',
          errors,
        });
      }

      return next(error);
    }
  };
};

module.exports = validate;