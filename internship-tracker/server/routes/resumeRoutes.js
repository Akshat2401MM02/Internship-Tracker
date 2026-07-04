const express = require('express');
const router = express.Router();
const { tailorResume, chatResume } = require('../controllers/resumeController');
const { generateResumePdf } = require('../controllers/pdfController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.post('/tailor', protect, upload.single('resumeFile'), tailorResume);
router.post('/chat', protect, chatResume);
router.post('/pdf', protect, generateResumePdf);

module.exports = router;
