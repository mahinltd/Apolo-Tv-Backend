// ©2026 Apolo TV Mahin Ltd develop by (Tanvir)

const express = require('express');
const { protect } = require('../middlewares/auth.middleware');
const { toggleFavorite, getFavorites } = require('../controllers/user.controller');

const router = express.Router();

router.post('/favorites', protect, toggleFavorite);
router.get('/favorites', protect, getFavorites);

module.exports = router;
