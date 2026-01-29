const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: false,     // ✅ Google Users ke liye optional
    trim: true,
    default: ""
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date,

  username: {
    type: String,
    unique: true,
    sparse: true,
    trim: true
  },

  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    lowercase: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
  },

  password: {
    type: String,
    required: false,      // ✅ Password optional for Google Auth
    minlength: 6,
    select: false
  },

  phoneNumber: {
    type: String,
    default: ''
  },

  state: {
    type: String,
    default: ''
  },

  city: {
    type: String,
    default: ''
  },

  role: {
    type: String,
    enum: ['user', 'volunteer', 'admin'],
    default: 'user'
  },

  profilePhoto: {
    type: String,
    default: ''
  },
  isBlocked: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// ✅ Hash password only if present
userSchema.pre('save', async function(next) {
  if (!this.password || !this.isModified('password')) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// ✅ Safe password compare (Google users won't have password)
userSchema.methods.comparePassword = async function(enteredPassword) {
  if (!this.password) return false; // ✅ Important Fix
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
