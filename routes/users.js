/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management endpoints
 */

const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/user');
const utils = require('../utils');

const router = express.Router();
const transporter = utils.transporter;
const jwtSecret = utils.jwtSecret;

/**
 * @swagger
 * /api/users/signup:
 *   post:
 *     summary: Register a new user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               firstName:
 *                 type: string
 *               email:
 *                 type: string
 *               country:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Validation error or duplicate email
 */
router.post(
  '/signup',
  // Validate user input
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('firstName').notEmpty().withMessage('First name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('country').notEmpty().withMessage('Country is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be 6+ chars'),
    body('role').isIn(['user', 'admin']).withMessage('Invalid role'),
  ],
  // Handle user registration
  async (req, res) => {
    const errors = validationResult(req);
    // Return validation errors if any
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const { name, firstName, email, country, password, role} = req.body;
      if (role === 'admin') return res.status(403).json({ error: 'Unauthorized role' });

      // Check for existing user
      const existingUser = await User.findOne({ email });
      if (existingUser) return res.status(400).json({ error: 'Email already in use' });

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user
      const user = new User({ name, firstName, email, country, password: hashedPassword });
      await user.save();

      // Send verification token
      const verificationToken = jwt.sign({ email }, jwtSecret, { expiresIn: '1d' });
      const verificationLink = `http://localhost:3000/api/users/verify?token=${verificationToken}`;
      await transporter.sendMail({
        to: email,
        subject: 'Email Verification',
        html: `<p>Click <a href="${verificationLink}">here</a> to verify your email.</p>`,
      });

      res.status(201).json({ message: 'User registered. Verify your email.' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Registration failed' });
    }
  }
);

/**
 * @swagger
 * /api/users/verify:
 *   get:
 *     summary: Verify a user's email
 *     tags: [Users]
 *     parameters:
 *       - in: query
 *         name: token
 *         schema:
 *           type: string
 *         required: true
 *         description: Email verification token
 *     responses:
 *       200:
 *         description: Email verified successfully
 *       400:
 *         description: Invalid or expired token
 */
router.get('/verify', async (req, res) => {
  const { token } = req.query;

  try {
    const { email } = jwt.verify(token, jwtSecret);
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: 'User not found' });

    user.verified = true;
    await user.save();
    res.status(200).json({ message: 'Email verified successfully' });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: 'Invalid or expired token' });
  }
});

module.exports = router;