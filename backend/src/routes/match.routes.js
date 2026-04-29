const router                     = require('express').Router();
const ctrl                       = require('../controllers/match.controller');
const { protect, adminOnly }     = require('../middleware/auth.middleware');

router.post('/scan-all', protect, adminOnly, ctrl.scanAll);
router.post('/:reportId', protect, ctrl.matchReport);

module.exports = router;