// ©2026 Apolo TV Mahin Ltd develop by (Tanvir)

const User = require('../models/User.model');

const toggleFavorite = async (req, res, next) => {
  try {
    const { channelUrl } = req.body;

    if (!channelUrl) {
      return res.status(400).json({
        status: 'error',
        message: 'channelUrl is required',
      });
    }

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found',
      });
    }

    const favorites = user.favorites || [];
    const isFavorite = favorites.includes(channelUrl);

    if (isFavorite) {
      user.favorites.pull(channelUrl);
    } else {
      user.favorites.addToSet(channelUrl);
    }

    await user.save();

    req.user.favorites = user.favorites;

    return res.status(200).json({
      status: 'success',
      favorites: user.favorites,
    });
  } catch (error) {
    next(error);
  }
};

const getFavorites = async (req, res, next) => {
  try {
    return res.status(200).json({
      status: 'success',
      favorites: req.user.favorites || [],
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { toggleFavorite, getFavorites };
