const Task = require('../models/Task')
const Project = require('../models/Project')
const Organization = require('../models/Organization')

// @desc   Create a task
// @route  POST /api/projects/:projectId/tasks
const createTask = async (req, res) => {
  try {
    const { title, description, status, priority, dueDate, assigneeId } = req.body
    if (!title) return res.status(400).json({ message: 'Task title is required' })

    const project = await Project.findById(req.params.projectId)
    if (!project) return res.status(404).json({ message: 'Project not found' })

    // Verify user is member of the org
    const org = await Organization.findById(project.organization)
    if (!org.isMember(req.user._id)) {
      return res.status(403).json({ message: 'Not authorized for this project' })
    }

    const task = await Task.create({
      title: title.trim(),
      description: description?.trim() || '',
      status: status || 'Todo',
      priority: priority || 'P2',
      dueDate: dueDate || null,
      assignee: assigneeId || null,
      project: req.params.projectId,
      organization: project.organization,
      createdBy: req.user._id
    })

    await task.populate('assignee', 'name email avatar')
    await task.populate('createdBy', 'name email avatar')

    res.status(201).json({ task })
  } catch (err) {
    res.status(500).json({ message: 'Failed to create task', error: err.message })
  }
}

// @desc   Get all tasks for a project
// @route  GET /api/projects/:projectId/tasks
const getTasksByProject = async (req, res) => {
  try {
    const { status, priority } = req.query
    const filter = { project: req.params.projectId }
    if (status) filter.status = status
    if (priority) filter.priority = priority

    const tasks = await Task.find(filter)
      .populate('assignee', 'name email avatar')
      .populate('createdBy', 'name email avatar')
      .sort({ createdAt: -1 })

    res.json({ tasks })
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch tasks', error: err.message })
  }
}

// @desc   Get single task
// @route  GET /api/projects/:projectId/tasks/:taskId
const getTask = async (req, res) => {
  try {
    const task = await Task.findOne({
      _id: req.params.taskId,
      project: req.params.projectId
    })
      .populate('assignee', 'name email avatar')
      .populate('createdBy', 'name email avatar')

    if (!task) return res.status(404).json({ message: 'Task not found' })
    res.json({ task })
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch task', error: err.message })
  }
}

// @desc   Update a task (status, priority, assignee, dueDate, title, description)
// @route  PUT /api/projects/:projectId/tasks/:taskId
const updateTask = async (req, res) => {
  try {
    const { title, description, status, priority, dueDate, assigneeId } = req.body
    const updates = {}
    if (title) updates.title = title.trim()
    if (description !== undefined) updates.description = description.trim()
    if (status) updates.status = status
    if (priority) updates.priority = priority
    if (dueDate !== undefined) updates.dueDate = dueDate || null
    if (assigneeId !== undefined) updates.assignee = assigneeId || null

    const task = await Task.findOneAndUpdate(
      { _id: req.params.taskId, project: req.params.projectId },
      updates,
      { new: true, runValidators: true }
    )
      .populate('assignee', 'name email avatar')
      .populate('createdBy', 'name email avatar')

    if (!task) return res.status(404).json({ message: 'Task not found' })
    res.json({ task })
  } catch (err) {
    res.status(500).json({ message: 'Failed to update task', error: err.message })
  }
}

// @desc   Delete a task
// @route  DELETE /api/projects/:projectId/tasks/:taskId
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({
      _id: req.params.taskId,
      project: req.params.projectId
    })
    if (!task) return res.status(404).json({ message: 'Task not found' })
    res.json({ message: 'Task deleted' })
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete task', error: err.message })
  }
}

// @desc   Get all tasks assigned to logged-in user (across all orgs)
// @route  GET /api/tasks/my-tasks
const getMyTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ assignee: req.user._id })
      .populate('project', 'name color organization')
      .populate('assignee', 'name email avatar')
      .populate('organization', 'name')
      .sort({ dueDate: 1 })

    res.json({ tasks })
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch your tasks', error: err.message })
  }
}

// @desc   Get dashboard stats for an org
// @route  GET /api/tasks/stats?orgId=xxx
const getDashboardStats = async (req, res) => {
  try {
    const { orgId } = req.query
    if (!orgId) return res.status(400).json({ message: 'orgId is required' })

    const [totalProjects, taskStats] = await Promise.all([
      Project.countDocuments({ organization: orgId }),
      Task.aggregate([
        { $match: { organization: require('mongoose').Types.ObjectId.createFromHexString(orgId) } },
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ])
    ])

    const stats = { totalProjects, totalTasks: 0, Todo: 0, 'In Progress': 0, Done: 0 }
    taskStats.forEach(({ _id, count }) => {
      stats[_id] = count
      stats.totalTasks += count
    })

    // Overdue tasks count
    const overdue = await Task.countDocuments({
      organization: orgId,
      status: { $ne: 'Done' },
      dueDate: { $lt: new Date() }
    })
    stats.overdue = overdue

    res.json({ stats })
  } catch (err) {
    res.status(500).json({ message: 'Failed to get stats', error: err.message })
  }
}

// @desc   Get recent active tasks for an org (for Dashboard)
// @route  GET /api/tasks/recent?orgId=xxx
const getRecentTasks = async (req, res) => {
  try {
    const { orgId } = req.query
    if (!orgId) return res.status(400).json({ message: 'orgId is required' })

    const tasks = await Task.find({
      organization: orgId,
      status: { $ne: 'Done' }
    })
      .populate('project', 'name color')
      .populate('assignee', 'name email avatar')
      .sort({ dueDate: 1 })
      .limit(8)

    res.json({ tasks })
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch recent tasks', error: err.message })
  }
}

module.exports = { createTask, getTasksByProject, getTask, updateTask, deleteTask, getMyTasks, getDashboardStats, getRecentTasks }
