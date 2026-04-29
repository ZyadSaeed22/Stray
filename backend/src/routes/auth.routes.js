const router          = require('express').Router();
const { body }        = require('express-validator');
const ctrl            = require('../controllers/auth.controller');
const { protect }     = require('../middleware/auth.middleware');
const validate        = require('../middleware/validate.middleware');
const { uploadCard }  = require('../config/upload');

router.post('/signup',
  uploadCard.single('nationalCardPhoto'),
  [
    body('email').isEmail().withMessage('Valid email required'),
    body('password').isLength({ min: 6 }).withMessage('Password min 6 chars'),
    body('phone').notEmpty().withMessage('Phone required'),
    body('nationalId').notEmpty().withMessage('National ID required'),
  ],
  validate,
  ctrl.signup
);

router.post('/login',
  [
    body('email').isEmail().withMessage('Valid email required'),
    body('password').notEmpty().withMessage('Password required'),
  ],
  validate,
  ctrl.login
);

router.get('/me', protect, ctrl.getMe);

module.exports = router;