const express = require('express')
const router = express.Router({ mergeParams: true })
const {
  createTask, getTasksByProject, getTask,
  updateTask, deleteTask, getMyTasks, getDashboardStats
} = require('../controllers/taskController')
const { protect } = require('../middleware/authMiddleware')

router.use(protect)

// Standalone task routes (not nested under project)
router.get('/my-tasks', getMyTasks)
router.get('/stats', getDashboardStats)

// Nested under /api/projects/:projectId/tasks
router.post('/', createTask)
router.get('/', getTasksByProject)
router.get('/:taskId', getTask)
router.put('/:taskId', updateTask)
router.delete('/:taskId', deleteTask)

module.exports = router
