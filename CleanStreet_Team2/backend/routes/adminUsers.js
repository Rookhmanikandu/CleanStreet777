const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Complaint = require('../models/Complaint');
const { protectAdmin } = require('../middleware/adminAuth');

// @route   GET /api/admin/users
// @desc    Get all users
// @access  Private/Admin
router.get('/', protectAdmin, async (req, res) => {
  try {
    const { isBlocked } = req.query;
    
    let query = {};
    if (isBlocked !== undefined) {
      query.isBlocked = isBlocked === 'true';
    }

    const users = await User.find(query)
      .select('-password')
      .sort({ created_at: -1 });

    // Get complaint count for each user
    const usersWithComplaintCount = await Promise.all(
      users.map(async (user) => {
        const complaintCount = await Complaint.countDocuments({ user_id: user._id });
        return {
          ...user.toObject(),
          complaintsCount: complaintCount
        };
      })
    );

    res.status(200).json({
      success: true,
      count: usersWithComplaintCount.length,
      users: usersWithComplaintCount
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/admin/users/:id
// @desc    Get single user with their complaints
// @access  Private/Admin
router.get('/:id', protectAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get user's complaints
    const complaints = await Complaint.find({ user_id: req.params.id })
      .sort({ created_at: -1 });

    res.status(200).json({
      success: true,
      user,
      complaints,
      complaintsCount: complaints.length
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/admin/users/:id/block
// @desc    Block/Unblock user
// @access  Private/Admin
router.put('/:id/block', protectAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.isBlocked = !user.isBlocked;
    await user.save();

    res.status(200).json({
      success: true,
      message: `User ${user.isBlocked ? 'blocked' : 'unblocked'} successfully`,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isBlocked: user.isBlocked
      }
    });
  } catch (error) {
    console.error('Block user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   DELETE /api/admin/users/:id
// @desc    Delete user
// @access  Private/Admin
router.delete('/:id', protectAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Optional: You might want to delete all user's complaints as well
    // await Complaint.deleteMany({ user_id: req.params.id });

    await user.deleteOne();

    res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;
