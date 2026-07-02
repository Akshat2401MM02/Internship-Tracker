const express = require('express');
const router = express.Router();
const {
  getInternships,
  getInternshipById,
  createInternship,
  updateInternship,
  deleteInternship,
  getStats,
} = require('../controllers/internshipController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/stats/summary', getStats);

router.route('/').get(getInternships).post(createInternship);

router.route('/:id').get(getInternshipById).put(updateInternship).delete(deleteInternship);

module.exports = router;
