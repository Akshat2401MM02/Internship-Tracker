const express = require('express');
const router = express.Router();
const { tailorResume } = require('../controllers/resumeController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.post('/tailor', protect, upload.single('resumeFile'), tailorResume);

module.exports = router;
