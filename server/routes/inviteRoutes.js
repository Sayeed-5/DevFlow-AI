const express = require('express')
const router = express.Router()
const { sendInvites, getInvitations, revokeInvitation, acceptInvitation } = require('../controllers/inviteController')
const { protect } = require('../middleware/authMiddleware')

// Public — accept invite via email link (no auth needed)
router.get('/accept/:token', acceptInvitation)

// All below require auth
router.use(protect)

router.post('/send', sendInvites)
router.get('/:orgId', getInvitations)
router.delete('/:inviteId', revokeInvitation)

module.exports = router
