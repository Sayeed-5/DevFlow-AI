const mongoose = require('mongoose')

const invitationSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  organization: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true
  },
  role: {
    type: String,
    enum: ['admin', 'member'],
    default: 'member'
  },
  token: {
    type: String,
    required: true,
    unique: true
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'expired', 'revoked'],
    default: 'pending'
  },
  invitedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  expiresAt: {
    type: Date,
    required: true,
    default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)  // 7 days
  }
}, { timestamps: true })

invitationSchema.index({ token: 1 })
invitationSchema.index({ email: 1, organization: 1 })

// Auto-expire check
invitationSchema.methods.isExpired = function () {
  return this.expiresAt < new Date() || this.status === 'expired'
}

module.exports = mongoose.model('Invitation', invitationSchema)
