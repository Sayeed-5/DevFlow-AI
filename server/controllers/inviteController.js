const Invitation = require('../models/Invitation')
const Organization = require('../models/Organization')
const User = require('../models/User')
const { generateInviteToken } = require('../utils/generateToken')
const { sendInviteEmail } = require('../utils/sendEmail')

// @desc   Send invite emails to one or more addresses
// @route  POST /api/invitations/send
const sendInvites = async (req, res) => {
  try {
    const { emails, orgId, role = 'member' } = req.body
    if (!emails || !Array.isArray(emails) || emails.length === 0) {
      return res.status(400).json({ message: 'Provide at least one email address' })
    }
    if (!orgId) return res.status(400).json({ message: 'orgId is required' })

    const org = await Organization.findById(orgId)
    if (!org) return res.status(404).json({ message: 'Organization not found' })

    // Check requester is admin/owner
    const requesterRole = org.getMemberRole(req.user._id)
    if (!['owner', 'admin'].includes(requesterRole)) {
      return res.status(403).json({ message: 'Admin access required to send invites' })
    }

    const results = { sent: [], failed: [], alreadyMember: [] }

    for (const rawEmail of emails) {
      const email = rawEmail.trim().toLowerCase()
      if (!email) continue

      // Check if already an org member
      const existingUser = await User.findOne({ email })
      if (existingUser && org.isMember(existingUser._id)) {
        results.alreadyMember.push(email)
        continue
      }

      // Cancel any existing pending invite for same email+org
      await Invitation.updateMany(
        { email, organization: orgId, status: 'pending' },
        { status: 'revoked' }
      )

      // Create new invitation
      const token = generateInviteToken()
      const invitation = await Invitation.create({
        email,
        organization: orgId,
        role,
        token,
        invitedBy: req.user._id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      })

      // Send email (non-blocking — don't fail request if email fails)
      try {
        await sendInviteEmail({
          to: email,
          orgName: org.name,
          inviterName: req.user.name,
          token
        })
        results.sent.push(email)
      } catch (emailErr) {
        console.error(`Failed to send invite email to ${email}:`, emailErr.message)
        // Still save the invite, just note email failed
        results.failed.push({ email, reason: 'Email delivery failed' })
      }
    }

    res.status(201).json({
      message: `Invitations processed`,
      sent: results.sent.length,
      failed: results.failed.length,
      alreadyMember: results.alreadyMember.length,
      details: results
    })
  } catch (err) {
    res.status(500).json({ message: 'Failed to send invitations', error: err.message })
  }
}

// @desc   List pending invitations for an org
// @route  GET /api/invitations/:orgId
const getInvitations = async (req, res) => {
  try {
    const invitations = await Invitation.find({
      organization: req.params.orgId,
      status: 'pending'
    })
      .populate('invitedBy', 'name email')
      .sort({ createdAt: -1 })

    res.json({ invitations })
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch invitations', error: err.message })
  }
}

// @desc   Revoke/cancel an invitation
// @route  DELETE /api/invitations/:inviteId
const revokeInvitation = async (req, res) => {
  try {
    const invitation = await Invitation.findById(req.params.inviteId)
    if (!invitation) return res.status(404).json({ message: 'Invitation not found' })

    invitation.status = 'revoked'
    await invitation.save()
    res.json({ message: 'Invitation revoked' })
  } catch (err) {
    res.status(500).json({ message: 'Failed to revoke invitation', error: err.message })
  }
}

// @desc   Accept invite via token (called when user clicks email link)
// @route  GET /api/invitations/accept/:token
// No auth required — user may or may not be logged in
const acceptInvitation = async (req, res) => {
  try {
    const invitation = await Invitation.findOne({ token: req.params.token })
      .populate('organization')

    if (!invitation) {
      return res.status(404).json({ message: 'Invitation not found or already used' })
    }
    if (invitation.status !== 'pending') {
      return res.status(410).json({ message: `This invitation has been ${invitation.status}` })
    }
    if (invitation.isExpired()) {
      invitation.status = 'expired'
      await invitation.save()
      return res.status(410).json({ message: 'This invitation has expired' })
    }

    const org = invitation.organization

    // Find or prompt user
    const user = await User.findOne({ email: invitation.email })
    if (!user) {
      // User not registered yet — return info so frontend can redirect to register
      return res.status(200).json({
        requiresRegistration: true,
        email: invitation.email,
        orgName: org.name,
        token: invitation.token
      })
    }

    // Check if already a member
    if (org.isMember(user._id)) {
      invitation.status = 'accepted'
      await invitation.save()
      return res.json({ message: 'Already a member', org })
    }

    // Add user to org
    await Organization.findByIdAndUpdate(org._id, {
      $push: { members: { user: user._id, role: invitation.role } }
    })

    invitation.status = 'accepted'
    await invitation.save()

    res.json({ message: 'Invitation accepted!', orgId: org._id, orgName: org.name })
  } catch (err) {
    res.status(500).json({ message: 'Failed to accept invitation', error: err.message })
  }
}

module.exports = { sendInvites, getInvitations, revokeInvitation, acceptInvitation }
