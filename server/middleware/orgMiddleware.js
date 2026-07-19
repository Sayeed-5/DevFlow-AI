const Organization = require('../models/Organization')

/**
 * requireOrgMember — verifies user is a member of :orgId
 * Attaches req.org and req.orgRole to the request
 */
const requireOrgMember = async (req, res, next) => {
  try {
    const org = await Organization.findById(req.params.orgId)
      .populate('members.user', 'name email avatar')

    if (!org) {
      return res.status(404).json({ message: 'Organization not found' })
    }

    const memberEntry = org.members.find(
      m => m.user._id.toString() === req.user._id.toString()
    )

    if (!memberEntry) {
      return res.status(403).json({ message: 'You are not a member of this organization' })
    }

    req.org = org
    req.orgRole = memberEntry.role   // 'owner' | 'admin' | 'member'
    next()
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

/**
 * requireAdmin — must be called AFTER requireOrgMember
 * Allows 'owner' and 'admin' roles only
 */
const requireAdmin = (req, res, next) => {
  if (!['owner', 'admin'].includes(req.orgRole)) {
    return res.status(403).json({ message: 'Admin or Owner access required' })
  }
  next()
}

/**
 * requireOwner — must be called AFTER requireOrgMember
 * Allows 'owner' role only
 */
const requireOwner = (req, res, next) => {
  if (req.orgRole !== 'owner') {
    return res.status(403).json({ message: 'Owner access required' })
  }
  next()
}

module.exports = { requireOrgMember, requireAdmin, requireOwner }
