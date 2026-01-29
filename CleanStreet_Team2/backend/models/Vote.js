const mongoose = require('mongoose');

const voteSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  complaint_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Complaint',
    required: true
  },
  vote_type: {
    type: String,
    enum: ['upvote', 'downvote'],
    required: true
  },
  created_at: {
    type: Date,
    default: Date.now
  }
});

// Ensure a user can only vote once per complaint
voteSchema.index({ user_id: 1, complaint_id: 1 }, { unique: true });

module.exports = mongoose.model('Vote', voteSchema);
