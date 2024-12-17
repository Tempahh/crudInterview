/**
 * @swagger
 * tags:
 *   name: Posts
 *   description: Post management endpoints
 */



const express = require('express');
const { body, validationResult } = require('express-validator');
const Post = require('../models/Post');
const router = express.Router();
const logger = require('../logger');

/**
 * @swagger
 * /api/posts:
 *   post:
 *     summary: Create a new post
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               body:
 *                 type: string
 *     responses:
 *       201:
 *         description: Post created successfully
 *       401:
 *         description: Unauthorized access
 */

router.post(
  '/',
  [
    body('title').notEmpty().withMessage('Title is required'),
    body('body').notEmpty().withMessage('Body is required'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const { title, body } = req.body;
      const post = new Post({ title, body, userId: req.body.userId.toString() });
      await post.save();
      logger.info(`Post created: ${post._id}`);
      res.status(201).json(post);
    } catch (err) {
        console.log(err);
      res.status(500).json({ error: 'Post creation failed' });
    }
  }
);

/**
 * @swagger
 * /api/posts:
 *   get:
 *     summary: Retrieve a list of posts
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of posts
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Post'
 *       401:
 *         description: Unauthorized access
 */
router.get('/', async (req, res) => {
  try {
    const posts = await Post.find();
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: 'Posts not found' });
  }
});

/**
 * @swagger
 * /api/posts/{id}:
 *   put:
 *     summary: Update a post by ID
 *     tags: [Posts]
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
 *               title:
 *                 type: string
 *               body:
 *                 type: string
 *     responses:
 *       200:
 *         description: Post updated successfully
 *       404:
 *         description: Post not found
 */
router.get('/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });
    res.json(post);
  } catch (err) {
    res.status(500).json({ error: 'Post not found' });
  }
});

/**
 * @swagger
 * /api/posts/{id}:
 *   put:
 *     summary: Update a post by ID
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               body:
 *                 type: string
 *     responses:
 *       200:
 *         description: Post updated successfully
 *       404:
 *         description: Post not found
 */

router.put('/:id', async (req, res) => {
  try {
    const post = await Post.findByIdAndUpdate(req.params.id)
    if (!post) return res.status(404).json({ error: 'Post not found' });
    post.title = req.body.title;
    post.body = req.body.body;
    await post.save();
    res.json(post);
    logger.info(`Post updated: ${post._id}`);
  } catch (err) {
    res.status(500).json({ error: 'Post update failed' });
  }
});

/**
 * @swagger
 * /api/posts/{id}:
 *   delete:
 *     summary: Delete a post by ID
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Post ID
 *     responses:
 *       200:
 *         description: Post deleted successfully
 *       404:
 *         description: Post not found
 */

router.delete('/:id', async (req, res) => {
  try {
    const post = await Post.findByIdAndDelete(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });
    res.json({ message: 'Post deleted' })
    logger.info(`Post deleted: ${post._id}`);
  } catch (err) {
    res.status(500).json({ error: 'Post deletion failed' });
  }
});

module.exports = router;
