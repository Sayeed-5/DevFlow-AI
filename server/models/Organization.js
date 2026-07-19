const mongoose = require('mongoose')

const memberSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  role: {
    type: String,
    enum: ['owner', 'admin', 'member'],
    default: 'member'
  }
}, { _id: false })

const organizationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Organization name is required'],
    trim: true,
    maxlength: [80, 'Name cannot exceed 80 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [300, 'Description cannot exceed 300 characters'],
    default: ''
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  members: [memberSchema]
}, { timestamps: true })

// Index for fast lookup of orgs by member
organizationSchema.index({ 'members.user': 1 })

// Helper: check if a userId is a member
organizationSchema.methods.isMember = function (userId) {
  return this.members.some(m => m.user.toString() === userId.toString())
}

// Helper: get member role
organizationSchema.methods.getMemberRole = function (userId) {
  const m = this.members.find(m => m.user.toString() === userId.toString())
  return m ? m.role : null
}

module.exports = mongoose.model('Organization', organizationSchema)
