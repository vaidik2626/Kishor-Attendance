const express = require('express');
const router = express.Router();
const {
  createSaint,
  getAllSaints,
  getSaintById,
  updateSaint,
  deleteSaint
} = require('../controllers/saintController');

router.post('/saints', createSaint);
router.get('/saints', getAllSaints);
router.get('/saints/:id', getSaintById);
router.put('/saints/:id', updateSaint);
router.delete('/saints/:id', deleteSaint);

module.exports = router;
