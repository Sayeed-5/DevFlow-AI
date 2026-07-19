const jwt = require('jsonwebtoken')
const User = require('../models/User')

/**
 * protect — verify JWT, attach req.user
 */
const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Not authorized, no token' })
    }

    const token = authHeader.split(' ')[1]
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    req.user = await User.findById(decoded.id)
    if (!req.user) {
      return res.status(401).json({ message: 'User not found' })
    }

    next()
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired, please login again' })
    }
    return res.status(401).json({ message: 'Not authorized, invalid token' })
  }
}

module.exports = { protect }
