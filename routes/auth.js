/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: authentication endpoints
 */

const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/user');
const router = express.Router();
const utils = require('../utils');
const logger = require('../logger');
const transporter = utils.transporter;
const jwtSecret = utils.jwtSecret;
// ... other routes

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Log in a user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: The user's username
 *               password:
 *                 type: string
 *                 description: The user's password
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   description: JWT token for authentication
 *       400:
 *         description: Validation
*/

router.post('/login', [
  body('username').notEmpty().withMessage('Username is required'),
  body('password').notEmpty().withMessage('Password is required'),
], 
  async (req, res) => {
  const { name, password } = req.body;
  const user = await User.findOne({ name });
  if (!user) {
    logger.error('Invalid user details');
    return res.status(401).json({ error: 'Invalid user details' });
  }
  const isMatch = await bcrypt.compare(password, user.password);
  if (password !== user.password) {
    logger.error('Incorrect password');
    return res.status(401).json({ error: 'Incorrect password' });
  }
  const token = jwt.sign({ userId: user._id, role: user.role }, jwtSecret);
  res.json({ token });
});


/**
 * @swagger
 * /api/auth/protected:
 *   get:
 *     summary: Access a protected route
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully accessed the protected route
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Confirmation message
 *       401:
 *         description: Unauthorized access
 *       403:
 *         description: Forbidden access
 */
router.get('/protected', authenticateToken, (req, res) => {
  res.json({ message: 'Protected route' });
});

/**
 * @swagger
 * /api/auth/admin/create-user:
 *   post:
 *     summary: Create a new user (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: The user's name
 *               firstName:
 *                 type: string
 *                 description: The user's first name
 *               email:
 *                 type: string
 *                 description: The user's email
 *               country:
 *                 type: string
 *                 description: The user's country
 *               password:
 *                 type: string
 *                 description: The user's password
 *     responses:
 *       200:
 *         description: User successfully created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Confirmation message
 *       400:
 *         description: Missing required fields
 *       403:
 *         description: Forbidden - Admin role required
 *       500:
 *         description: Internal server error
 */
router.post('/admin/create-user', authenticateToken, isAdmin, async (req, res) => {
  // ... create a new user
  try {
    //check if user exists
    const existingAdmin = await User.findOne({ role: 'admin' });
    if (!existingAdmin) {
      logger.error('Admin user not found');
      return res.status(403).json({ error: 'Unauthorized role' });
    }

    //check if body has required fields
    const { name, email, password, firstName, country} = req.body;
    if (!name || !firstName || !country ||!email || !password) {
      logger.error('All fields are required');
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Create user
    const user = new User(req.body);
    await user.save();
    res.json({ message: 'User created' });
  } catch (err) {
    logger.error(err);
    res.status(400).json({ error: err.message });
  }
});

// Middleware to authenticate token
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.sendStatus(401);

  jwt.verify(token, jwtSecret, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

// Middleware to check admin role
function isAdmin(req, res, next) {
  if (req.user.role !== 'admin') {
    return res.sendStatus(403);
  }
  next();
}

module.exports = router;