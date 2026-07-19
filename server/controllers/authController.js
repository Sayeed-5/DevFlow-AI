const User = require('../models/User')
const { generateJWT } = require('../utils/generateToken')

// @desc   Register new user
// @route  POST /api/auth/register
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' })
    }

    const existingUser = await User.findOne({ email: email.toLowerCase().trim() })
    if (existingUser) {
      return res.status(409).json({ message: 'An account with this email already exists' })
    }

    const user = await User.create({ name: name.trim(), email, password })
    const token = generateJWT(user._id)

    res.status(201).json({ user, token })
  } catch (err) {
    res.status(500).json({ message: 'Registration failed', error: err.message })
  }
}

// @desc   Login user
// @route  POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' })
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password')
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' })
    }

    const token = generateJWT(user._id)

    // Remove password from response
    const { password: _, ...userObj } = user.toObject()
    res.json({ user: userObj, token })
  } catch (err) {
    res.status(500).json({ message: 'Login failed', error: err.message })
  }
}

// @desc   Get current user profile
// @route  GET /api/auth/me
const getMe = async (req, res) => {
  res.json({ user: req.user })
}

// @desc   Update profile (name, avatar)
// @route  PUT /api/auth/me
const updateMe = async (req, res) => {
  try {
    const { name, avatar } = req.body
    const updates = {}
    if (name) updates.name = name.trim()
    if (avatar) updates.avatar = avatar

    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true })
    res.json({ user })
  } catch (err) {
    res.status(500).json({ message: 'Update failed', error: err.message })
  }
}

// @desc   Change password
// @route  PUT /api/auth/change-password
const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body
    if (!oldPassword || !newPassword) {
      return res.status(400).json({ message: 'Both old and new passwords are required' })
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters' })
    }

    const user = await User.findById(req.user._id).select('+password')
    if (!(await user.matchPassword(oldPassword))) {
      return res.status(401).json({ message: 'Old password is incorrect' })
    }

    user.password = newPassword
    await user.save()
    res.json({ message: 'Password changed successfully' })
  } catch (err) {
    res.status(500).json({ message: 'Password change failed', error: err.message })
  }
}

module.exports = { register, login, getMe, updateMe, changePassword }
