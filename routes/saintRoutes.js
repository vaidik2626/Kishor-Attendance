const express = require('express');
const router = express.Router();
const { getAllSaints } = require('../controllers/saintController');

router.get('/saints', getAllSaints);

module.exports = router;
