const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.json({ success: true, message: 'Remedies route working' });
});

module.exports = router;