const Organization = require('../models/Organization')
const Project = require('../models/Project')
const Task = require('../models/Task')
const Invitation = require('../models/Invitation')

// @desc   Create a new organization
// @route  POST /api/organizations
const createOrg = async (req, res) => {
  try {
    const { name, description } = req.body
    if (!name) return res.status(400).json({ message: 'Organization name is required' })

    const org = await Organization.create({
      name: name.trim(),
      description: description?.trim() || '',
      createdBy: req.user._id,
      members: [{ user: req.user._id, role: 'owner' }]
    })

    await org.populate('members.user', 'name email avatar')
    res.status(201).json({ org })
  } catch (err) {
    res.status(500).json({ message: 'Failed to create organization', error: err.message })
  }
}

// @desc   Get all organizations current user is a member of
// @route  GET /api/organizations
const getMyOrgs = async (req, res) => {
  try {
    const orgs = await Organization.find({ 'members.user': req.user._id })
      .populate('members.user', 'name email avatar')
      .sort({ createdAt: -1 })
    res.json({ orgs })
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch organizations', error: err.message })
  }
}

// @desc   Get single org details
// @route  GET /api/organizations/:orgId
const getOrg = async (req, res) => {
  try {
    await req.org.populate('members.user', 'name email avatar')
    res.json({ org: req.org })
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch organization', error: err.message })
  }
}

// @desc   Update org (name, description)
// @route  PUT /api/organizations/:orgId
const updateOrg = async (req, res) => {
  try {
    const { name, description } = req.body
    const updates = {}
    if (name) updates.name = name.trim()
    if (description !== undefined) updates.description = description.trim()

    const org = await Organization.findByIdAndUpdate(
      req.params.orgId,
      updates,
      { new: true, runValidators: true }
    ).populate('members.user', 'name email avatar')

    res.json({ org })
  } catch (err) {
    res.status(500).json({ message: 'Failed to update organization', error: err.message })
  }
}

// @desc   Delete org + all its projects & tasks
// @route  DELETE /api/organizations/:orgId
const deleteOrg = async (req, res) => {
  try {
    const projectIds = await Project.find({ organization: req.params.orgId }).distinct('_id')
    await Task.deleteMany({ project: { $in: projectIds } })
    await Project.deleteMany({ organization: req.params.orgId })
    await Invitation.deleteMany({ organization: req.params.orgId })
    await Organization.findByIdAndDelete(req.params.orgId)

    res.json({ message: 'Organization and all its data deleted' })
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete organization', error: err.message })
  }
}

// @desc   Get all members of an org
// @route  GET /api/organizations/:orgId/members
const getMembers = async (req, res) => {
  try {
    await req.org.populate('members.user', 'name email avatar')
    res.json({ members: req.org.members })
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch members', error: err.message })
  }
}

// @desc   Remove a member from org
// @route  DELETE /api/organizations/:orgId/members/:userId
const removeMember = async (req, res) => {
  try {
    const { userId } = req.params

    // Can't remove the owner
    const target = req.org.members.find(m => m.user.toString() === userId)
    if (!target) return res.status(404).json({ message: 'Member not found' })
    if (target.role === 'owner') return res.status(403).json({ message: 'Cannot remove the owner' })

    await Organization.findByIdAndUpdate(
      req.params.orgId,
      { $pull: { members: { user: userId } } }
    )
    res.json({ message: 'Member removed' })
  } catch (err) {
    res.status(500).json({ message: 'Failed to remove member', error: err.message })
  }
}

// @desc   Change a member's role
// @route  PUT /api/organizations/:orgId/members/:userId/role
const changeMemberRole = async (req, res) => {
  try {
    const { userId } = req.params
    const { role } = req.body

    if (!['admin', 'member'].includes(role)) {
      return res.status(400).json({ message: 'Role must be admin or member' })
    }

    const org = await Organization.findOneAndUpdate(
      { _id: req.params.orgId, 'members.user': userId },
      { $set: { 'members.$.role': role } },
      { new: true }
    ).populate('members.user', 'name email avatar')

    if (!org) return res.status(404).json({ message: 'Member not found' })
    res.json({ org })
  } catch (err) {
    res.status(500).json({ message: 'Failed to change role', error: err.message })
  }
}

module.exports = { createOrg, getMyOrgs, getOrg, updateOrg, deleteOrg, getMembers, removeMember, changeMemberRole }
