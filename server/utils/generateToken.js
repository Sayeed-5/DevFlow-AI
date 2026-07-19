const jwt = require('jsonwebtoken')
const crypto = require('crypto')

/**
 * Generate JWT for authenticated user
 */
const generateJWT = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  )
}

/**
 * Generate a secure random token for invitations
 * Returns a 64-char hex string
 */
const generateInviteToken = () => {
  return crypto.randomBytes(32).toString('hex')
}

module.exports = { generateJWT, generateInviteToken }
