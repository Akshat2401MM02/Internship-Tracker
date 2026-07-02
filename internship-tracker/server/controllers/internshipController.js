const Internship = require('../models/Internship');

// @desc    Get all internships for logged-in user (supports filtering & search)
// @route   GET /api/internships
// @access  Private
const getInternships = async (req, res, next) => {
  try {
    const { status, search, sortBy } = req.query;

    const query = { user: req.user._id };

    if (status && status !== 'All') {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { company: { $regex: search, $options: 'i' } },
        { role: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
      ];
    }

    let sort = { createdAt: -1 };
    if (sortBy === 'deadline') sort = { deadline: 1 };
    if (sortBy === 'company') sort = { company: 1 };
    if (sortBy === 'applicationDate') sort = { applicationDate: -1 };

    const internships = await Internship.find(query).sort(sort);
    res.json(internships);
  } catch (error) {
    next(error);
  }
};

// @desc    Get single internship
// @route   GET /api/internships/:id
// @access  Private
const getInternshipById = async (req, res, next) => {
  try {
    const internship = await Internship.findById(req.params.id);

    if (!internship) {
      res.status(404);
      throw new Error('Internship not found');
    }

    if (internship.user.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Not authorized to access this internship');
    }

    res.json(internship);
  } catch (error) {
    next(error);
  }
};

// @desc    Create new internship
// @route   POST /api/internships
// @access  Private
const createInternship = async (req, res, next) => {
  try {
    const {
      company,
      role,
      status,
      applicationDate,
      deadline,
      location,
      mode,
      stipend,
      jobLink,
      contactPerson,
      notes,
    } = req.body;

    if (!company || !role) {
      res.status(400);
      throw new Error('Company and role are required');
    }

    const internship = await Internship.create({
      user: req.user._id,
      company,
      role,
      status,
      applicationDate,
      deadline,
      location,
      mode,
      stipend,
      jobLink,
      contactPerson,
      notes,
    });

    res.status(201).json(internship);
  } catch (error) {
    next(error);
  }
};

// @desc    Update internship
// @route   PUT /api/internships/:id
// @access  Private
const updateInternship = async (req, res, next) => {
  try {
    const internship = await Internship.findById(req.params.id);

    if (!internship) {
      res.status(404);
      throw new Error('Internship not found');
    }

    if (internship.user.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Not authorized to update this internship');
    }

    const updated = await Internship.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.json(updated);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete internship
// @route   DELETE /api/internships/:id
// @access  Private
const deleteInternship = async (req, res, next) => {
  try {
    const internship = await Internship.findById(req.params.id);

    if (!internship) {
      res.status(404);
      throw new Error('Internship not found');
    }

    if (internship.user.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Not authorized to delete this internship');
    }

    await internship.deleteOne();
    res.json({ message: 'Internship removed', id: req.params.id });
  } catch (error) {
    next(error);
  }
};

// @desc    Get dashboard stats
// @route   GET /api/internships/stats/summary
// @access  Private
const getStats = async (req, res, next) => {
  try {
    const internships = await Internship.find({ user: req.user._id });

    const summary = {
      total: internships.length,
      Wishlist: 0,
      Applied: 0,
      OA: 0,
      Interview: 0,
      Offer: 0,
      Rejected: 0,
    };

    internships.forEach((i) => {
      if (summary[i.status] !== undefined) summary[i.status] += 1;
    });

    const upcomingDeadlines = internships
      .filter((i) => i.deadline && new Date(i.deadline) >= new Date())
      .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
      .slice(0, 5);

    res.json({ summary, upcomingDeadlines });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getInternships,
  getInternshipById,
  createInternship,
  updateInternship,
  deleteInternship,
  getStats,
};
