const express = require('express');
const router = express.Router();
const Complaint = require('../models/Complaint');
const { protectVolunteer } = require('../middleware/adminAuth');

// @route   GET /api/volunteer/complaints
// @desc    Get all assigned complaints for logged in volunteer
// @access  Private/Volunteer
router.get('/', protectVolunteer, async (req, res) => {
  try {
    const complaints = await Complaint.find({ assigned_to: req.volunteer._id })
      .populate('user_id', 'name email phone')
      .sort({ created_at: -1 });

    res.status(200).json({
      success: true,
      count: complaints.length,
      complaints
    });
  } catch (error) {
    console.error('Get assigned complaints error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/volunteer/complaints/stats/dashboard
// @desc    Get volunteer dashboard statistics
// @access  Private/Volunteer
router.get('/stats/dashboard', protectVolunteer, async (req, res) => {
  try {
    const total = await Complaint.countDocuments({ assigned_to: req.volunteer._id });
    const assigned = await Complaint.countDocuments({ 
      assigned_to: req.volunteer._id,
      status: { $in: ['assigned', 'in_review'] }
    });
    const resolved = await Complaint.countDocuments({ 
      assigned_to: req.volunteer._id,
      status: 'resolved'
    });

    res.status(200).json({
      success: true,
      stats: {
        total,
        assigned,
        resolved
      }
    });
  } catch (error) {
    console.error('Get volunteer stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/volunteer/complaints/:id
// @desc    Get single assigned complaint
// @access  Private/Volunteer
router.get('/:id', protectVolunteer, async (req, res) => {
  try {
    const complaint = await Complaint.findOne({
      _id: req.params.id,
      assigned_to: req.volunteer._id
    }).populate('user_id', 'name email phone');

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found or not assigned to you'
      });
    }

    res.status(200).json({
      success: true,
      complaint
    });
  } catch (error) {
    console.error('Get complaint error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/volunteer/complaints/:id/status
// @desc    Update complaint status (assigned complaints only)
// @access  Private/Volunteer
router.put('/:id/status', protectVolunteer, async (req, res) => {
  try {
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Please provide status'
      });
    }

    // Volunteers can only change status to certain values
    const allowedStatuses = ['assigned', 'in_review', 'resolved'];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status value. Allowed: assigned, in_review, resolved'
      });
    }

    const complaint = await Complaint.findOne({
      _id: req.params.id,
      assigned_to: req.volunteer._id
    });

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found or not assigned to you'
      });
    }

    complaint.status = status;
    complaint.updated_at = Date.now();
    await complaint.save();

    res.status(200).json({
      success: true,
      message: 'Complaint status updated successfully',
      complaint
    });
  } catch (error) {
    console.error('Update complaint status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;
