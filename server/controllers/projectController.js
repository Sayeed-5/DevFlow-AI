const Project = require('../models/Project')
const Task = require('../models/Task')

// @desc   Create project inside an org
// @route  POST /api/organizations/:orgId/projects
const createProject = async (req, res) => {
  try {
    const { name, description, color, teamSize } = req.body
    if (!name) return res.status(400).json({ message: 'Project name is required' })

    // Members default to all org members
    const orgMemberIds = req.org.members.map(m => m.user._id || m.user)

    const project = await Project.create({
      name: name.trim(),
      description: description?.trim() || '',
      color: color || '#10b981',
      teamSize: teamSize || 'Solo',
      organization: req.params.orgId,
      createdBy: req.user._id,
      members: orgMemberIds
    })

    await project.populate('members', 'name email avatar')
    await project.populate('createdBy', 'name email avatar')

    res.status(201).json({ project })
  } catch (err) {
    res.status(500).json({ message: 'Failed to create project', error: err.message })
  }
}

// @desc   List all projects in an org
// @route  GET /api/organizations/:orgId/projects
const getProjects = async (req, res) => {
  try {
    const projects = await Project.find({
      organization: req.params.orgId,
      status: { $ne: 'archived' }
    })
      .populate('members', 'name email avatar')
      .populate('createdBy', 'name email avatar')
      .sort({ createdAt: -1 })

    // Attach task stats to each project
    const projectsWithStats = await Promise.all(projects.map(async (proj) => {
      const taskCounts = await Task.aggregate([
        { $match: { project: proj._id } },
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ])

      const stats = { total: 0, Todo: 0, 'In Progress': 0, Done: 0 }
      taskCounts.forEach(({ _id, count }) => {
        stats[_id] = count
        stats.total += count
      })

      return { ...proj.toObject(), taskStats: stats }
    }))

    res.json({ projects: projectsWithStats })
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch projects', error: err.message })
  }
}

// @desc   Get single project
// @route  GET /api/organizations/:orgId/projects/:projectId
const getProject = async (req, res) => {
  try {
    const project = await Project.findOne({
      _id: req.params.projectId,
      organization: req.params.orgId
    })
      .populate('members', 'name email avatar')
      .populate('createdBy', 'name email avatar')

    if (!project) return res.status(404).json({ message: 'Project not found' })

    const tasks = await Task.find({ project: project._id })
      .populate('assignee', 'name email avatar')
      .populate('createdBy', 'name email avatar')
      .sort({ createdAt: -1 })

    res.json({ project, tasks })
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch project', error: err.message })
  }
}

// @desc   Update project
// @route  PUT /api/organizations/:orgId/projects/:projectId
const updateProject = async (req, res) => {
  try {
    const { name, description, color, teamSize, status } = req.body
    const updates = {}
    if (name) updates.name = name.trim()
    if (description !== undefined) updates.description = description.trim()
    if (color) updates.color = color
    if (teamSize) updates.teamSize = teamSize
    if (status) updates.status = status

    const project = await Project.findOneAndUpdate(
      { _id: req.params.projectId, organization: req.params.orgId },
      updates,
      { new: true, runValidators: true }
    ).populate('members', 'name email avatar')

    if (!project) return res.status(404).json({ message: 'Project not found' })
    res.json({ project })
  } catch (err) {
    res.status(500).json({ message: 'Failed to update project', error: err.message })
  }
}

// @desc   Delete project and all its tasks
// @route  DELETE /api/organizations/:orgId/projects/:projectId
const deleteProject = async (req, res) => {
  try {
    const project = await Project.findOne({
      _id: req.params.projectId,
      organization: req.params.orgId
    })
    if (!project) return res.status(404).json({ message: 'Project not found' })

    await Task.deleteMany({ project: project._id })
    await project.deleteOne()

    res.json({ message: 'Project and all its tasks deleted' })
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete project', error: err.message })
  }
}

module.exports = { createProject, getProjects, getProject, updateProject, deleteProject }
