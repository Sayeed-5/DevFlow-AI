const express = require('express')
const router = express.Router()
const {
  createOrg, getMyOrgs, getOrg, updateOrg, deleteOrg,
  getMembers, removeMember, changeMemberRole
} = require('../controllers/orgController')
const { protect } = require('../middleware/authMiddleware')
const { requireOrgMember, requireAdmin, requireOwner } = require('../middleware/orgMiddleware')

// All org routes require authentication
router.use(protect)

router.post('/', createOrg)
router.get('/', getMyOrgs)

router.get('/:orgId', requireOrgMember, getOrg)
router.put('/:orgId', requireOrgMember, requireAdmin, updateOrg)
router.delete('/:orgId', requireOrgMember, requireOwner, deleteOrg)

router.get('/:orgId/members', requireOrgMember, getMembers)
router.delete('/:orgId/members/:userId', requireOrgMember, requireAdmin, removeMember)
router.put('/:orgId/members/:userId/role', requireOrgMember, requireOwner, changeMemberRole)

module.exports = router
