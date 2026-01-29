const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Comment = require('../models/Comment');
const Complaint = require('../models/Complaint');

// @route   GET /api/comments/complaint/:complaintId
// @desc    Get all comments for a complaint
// @access  Private
router.get('/complaint/:complaintId', protect, async (req, res) => {
  try {
    const comments = await Comment.find({ complaint_id: req.params.complaintId })
      .populate('user_id', 'name email')
      .sort({ timestamp: -1 });

    res.status(200).json({
      success: true,
      count: comments.length,
      comments
    });
  } catch (error) {
    console.error('Get comments error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/comments
// @desc    Create a new comment
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { complaint_id, content } = req.body;

    // Validate
    if (!complaint_id || !content) {
      return res.status(400).json({
        success: false,
        message: 'Please provide complaint ID and content'
      });
    }

    // Check if complaint exists
    const complaint = await Complaint.findById(complaint_id);
    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found'
      });
    }

    // Create comment
    const comment = await Comment.create({
      user_id: req.user.id,
      complaint_id,
      content: content.trim()
    });

    // Populate user info
    await comment.populate('user_id', 'name email');

    res.status(201).json({
      success: true,
      comment,
      message: 'Comment posted successfully'
    });
  } catch (error) {
    console.error('Create comment error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
});

// @route   POST /api/comments/:id/like
// @desc    Like/Unlike a comment
// @access  Private
router.post('/:id/like', protect, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }

    // Check if user already liked
    const likedIndex = comment.likedBy.indexOf(req.user.id);

    if (likedIndex > -1) {
      // Unlike - remove user from likedBy array
      comment.likedBy.splice(likedIndex, 1);
      comment.likes = Math.max(0, comment.likes - 1);
    } else {
      // Like - add user to likedBy array
      comment.likedBy.push(req.user.id);
      comment.likes += 1;
    }

    await comment.save();

    res.status(200).json({
      success: true,
      likes: comment.likes,
      isLiked: likedIndex === -1,
      message: likedIndex > -1 ? 'Comment unliked' : 'Comment liked'
    });
  } catch (error) {
    console.error('Like comment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   DELETE /api/comments/:id
// @desc    Delete a comment
// @access  Private (Owner or Admin)
router.delete('/:id', protect, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }

    // Check if user owns the comment or is admin
    if (comment.user_id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this comment'
      });
    }

    await comment.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Comment deleted successfully'
    });
  } catch (error) {
    console.error('Delete comment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;
