/**
 * @swagger
 * tags:
 *   name: Comments
 *   description: Comment management endpoints
 */



const express = require('express');
const { body, validationResult } = require('express-validator');
const Comment = require('../models/comment');
const logger = require('../logger');
const router = express.Router();

/**
 * @swagger
 * /api/posts/{id}/comments:
 *   post:
 *     summary: Add a comment to a post
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Post ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               body:
 *                 type: string
 *     responses:
 *       201:
 *         description: Comment added successfully
 *       404:
 *         description: Post not found
 *       401:
 *         description: Unauthorized access
 */

router.post(
  '/:postId/comments',
  [
    body('body').notEmpty().withMessage('Comment body is required'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const { body } = req.body;
      const { postId } = req.params;

      const comment = new Comment({ body, postId, userId: req.user.id });
      await comment.save();
      res.status(201).json(comment);
    } catch (err) {
      logger.error(err);
      res.status(500).json({ error: 'Comment creation failed' });
    }
  }
);

module.exports = router;
