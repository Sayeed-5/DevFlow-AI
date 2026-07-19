const express = require('express')
const router = express.Router({ mergeParams: true })   // mergeParams to get :orgId
const {
  createProject, getProjects, getProject, updateProject, deleteProject
} = require('../controllers/projectController')
const { protect } = require('../middleware/authMiddleware')
const { requireOrgMember, requireAdmin } = require('../middleware/orgMiddleware')

router.use(protect)
router.use(requireOrgMember)

router.post('/', createProject)
router.get('/', getProjects)
router.get('/:projectId', getProject)
router.put('/:projectId', requireAdmin, updateProject)
router.delete('/:projectId', requireAdmin, deleteProject)

module.exports = router
