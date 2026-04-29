const router          = require('express').Router();
const { body }        = require('express-validator');
const ctrl            = require('../controllers/report.controller');
const { protect }     = require('../middleware/auth.middleware');
const validate        = require('../middleware/validate.middleware');
const { uploadChild } = require('../config/upload');

router.post('/',
  protect,
  uploadChild.single('childPhoto'),
  [
    body('type').isIn(['missing', 'found']).withMessage('type must be missing or found'),
    body('phone').notEmpty().withMessage('Contact phone required'),
  ],
  validate,
  ctrl.createReport
);

router.get('/',     ctrl.getReports);
router.get('/:id',  ctrl.getReport);
router.delete('/:id', protect, ctrl.deleteReport);

module.exports = router;