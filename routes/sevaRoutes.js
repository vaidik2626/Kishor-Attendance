const express = require('express');
const router = express.Router();
const {
  createSeva,
  getAllSevas,
  getSevaById,
  updateSeva,
  deleteSeva
} = require('../controllers/sevaController');

router.post('/sevas', createSeva);
router.get('/sevas', getAllSevas);
router.get('/sevas/:id', getSevaById);
router.put('/sevas/:id', updateSeva);
router.delete('/sevas/:id', deleteSeva);

module.exports = router;
