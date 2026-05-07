// ©2026 Apolo TV Mahin Ltd develop by (Tanvir)

const checkHealth = async (req, res, next) => {
  try {
    res.status(200).json({
      status: 'success',
      application: 'Apolo TV API',
      message: 'Server is up and running smoothly.',
      timestamp: new Date(),
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { checkHealth };