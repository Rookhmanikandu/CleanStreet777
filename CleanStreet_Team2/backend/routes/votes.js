const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Vote = require('../models/Vote');
const Complaint = require('../models/Complaint');

// @route   POST /api/votes/:complaintId
// @desc    Vote on a complaint (upvote or downvote)
// @access  Private
router.post('/:complaintId', protect, async (req, res) => {
  try {
    const { complaintId } = req.params;
    const { vote_type } = req.body; // 'upvote' or 'downvote'
    const userId = req.user.id;

    // Validate vote type
    if (!['upvote', 'downvote'].includes(vote_type)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid vote type. Must be "upvote" or "downvote"'
      });
    }

    // Check if complaint exists
    const complaint = await Complaint.findById(complaintId);
    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found'
      });
    }

    // Check if user has already voted on this complaint
    const existingVote = await Vote.findOne({
      user_id: userId,
      complaint_id: complaintId
    });

    if (existingVote) {
      // If the vote is the same, remove it (toggle off)
      if (existingVote.vote_type === vote_type) {
        // Remove vote
        await Vote.deleteOne({ _id: existingVote._id });
        
        // Update complaint vote counts
        if (vote_type === 'upvote') {
          complaint.upvotes = Math.max(0, complaint.upvotes - 1);
        } else {
          complaint.downvotes = Math.max(0, complaint.downvotes - 1);
        }
        await complaint.save();

        return res.status(200).json({
          success: true,
          message: 'Vote removed',
          vote: null,
          upvotes: complaint.upvotes,
          downvotes: complaint.downvotes
        });
      } else {
        // Change vote type
        const oldVoteType = existingVote.vote_type;
        existingVote.vote_type = vote_type;
        await existingVote.save();

        // Update complaint vote counts
        if (oldVoteType === 'upvote') {
          complaint.upvotes = Math.max(0, complaint.upvotes - 1);
          complaint.downvotes += 1;
        } else {
          complaint.downvotes = Math.max(0, complaint.downvotes - 1);
          complaint.upvotes += 1;
        }
        await complaint.save();

        return res.status(200).json({
          success: true,
          message: 'Vote updated',
          vote: existingVote,
          upvotes: complaint.upvotes,
          downvotes: complaint.downvotes
        });
      }
    }

    // Create new vote
    const vote = await Vote.create({
      user_id: userId,
      complaint_id: complaintId,
      vote_type
    });

    // Update complaint vote counts
    if (vote_type === 'upvote') {
      complaint.upvotes += 1;
    } else {
      complaint.downvotes += 1;
    }
    await complaint.save();

    res.status(201).json({
      success: true,
      message: 'Vote registered',
      vote,
      upvotes: complaint.upvotes,
      downvotes: complaint.downvotes
    });
  } catch (error) {
    console.error('Vote error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
});

// @route   GET /api/votes/:complaintId
// @desc    Get user's vote on a specific complaint
// @access  Private
router.get('/:complaintId', protect, async (req, res) => {
  try {
    const { complaintId } = req.params;
    const userId = req.user.id;

    const vote = await Vote.findOne({
      user_id: userId,
      complaint_id: complaintId
    });

    res.status(200).json({
      success: true,
      vote: vote || null
    });
  } catch (error) {
    console.error('Get vote error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/votes/complaint/:complaintId/stats
// @desc    Get vote statistics for a complaint
// @access  Public
router.get('/complaint/:complaintId/stats', async (req, res) => {
  try {
    const { complaintId } = req.params;

    const complaint = await Complaint.findById(complaintId);
    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found'
      });
    }

    res.status(200).json({
      success: true,
      stats: {
        upvotes: complaint.upvotes || 0,
        downvotes: complaint.downvotes || 0,
        total: (complaint.upvotes || 0) + (complaint.downvotes || 0)
      }
    });
  } catch (error) {
    console.error('Get vote stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;
