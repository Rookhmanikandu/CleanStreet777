const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Please provide a title'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Please provide a description'],
    maxlength: [1000, 'Description cannot be more than 1000 characters']
  },
  photo: {
    type: [String],
    default: []
  },
  upvotes: {
    type: Number,
    default: 0
  },
  downvotes: {
    type: Number,
    default: 0
  },
  location_coords: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      default: [0, 0]
    }
  },
  address: {
    type: String,
    required: [true, 'Please provide an address']
  },
  assigned_to: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Volunteer',
    default: null
  },
  status: {
    type: String,
    enum: ['received', 'in_review', 'assigned', 'resolved', 'rejected'],
    default: 'received'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  }
});

// Update the updated_at field before saving
complaintSchema.pre('save', function(next) {
  this.updated_at = Date.now();
  next();
});

// Create index for geospatial queries
complaintSchema.index({ location_coords: '2dsphere' });

module.exports = mongoose.model('Complaint', complaintSchema);
