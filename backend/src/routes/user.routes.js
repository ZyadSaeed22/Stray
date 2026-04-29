const router                     = require('express').Router();
const ctrl                       = require('../controllers/user.controller');
const { protect, adminOnly }     = require('../middleware/auth.middleware');

router.get('/profile',      protect, ctrl.getProfile);
router.put('/profile',      protect, ctrl.updateProfile);
router.get('/',             protect, adminOnly, ctrl.getAllUsers);
router.patch('/:id/verify', protect, adminOnly, ctrl.verifyUser);

module.exports = router;