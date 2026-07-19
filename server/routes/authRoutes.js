const express = require('express')
const router = express.Router()
const { register, login, getMe, updateMe, changePassword } = require('../controllers/authController')
const { protect } = require('../middleware/authMiddleware')

router.post('/register', register)
router.post('/login', login)
router.post('/logout', (req, res) => res.json({ message: 'Logged out' }))

router.get('/me', protect, getMe)
router.put('/me', protect, updateMe)
router.put('/change-password', protect, changePassword)

module.exports = router
