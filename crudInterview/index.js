const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const {body, validationResult} = require('express-validator');
const nodemailer = require('nodemailer');
const expressrateLimit = require('express-rate-limit');
const seedAdmin = require('./seed');
const logger = require('./logger');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');

const app = express();
app.use(bodyParser.json());

const userRoutes = require('./routes/users');
app.use('/api/users', userRoutes);

const postRoutes = require('./routes/posts');
app.use('/api/posts', postRoutes);

const commentRoutes = require('./routes/comment');
const { router } = require('./routes/users');
app.use('/api/posts', commentRoutes);

const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

mongoose.connect('mongodb+srv://Tempah:Titanium12@crudinterview.qhu17.mongodb.net/?retryWrites=true&w=majority&appName=crudInterview')
.then(() => {
        logger.info('Connected to MongoDB...')
        seedAdmin();
        app.listen(3000, () => {
            logger.info('Server is running on port 3000');
        });
    })
.catch(err =>  console.error('Could not connect to MongoDB...', err));

// Rate limiter
const limiter = expressrateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: 'You have exceeded the 100 requests in 15 minutes limit!',
    headers: true,
});
app.use(limiter);

//auth middleware
const auth = (req, res, next) => {
    const token = req.header('x-auth-token');
    if (!token) return res.status(401).send('Access denied. No token provided.');

        jwt.verify(token, jwtSecret, (err, decoded) => {
            if (err)
                res.status(400).send('Invalid token.');
        next();
    })
};

//role-based authorization middleware
const authorizeRoles = (roles) => (req, res, next) => {
    if (!roles.includes(req.user.role)) {
        return res.status(403).send('You do not have permission to perform this action');
    }
    next();
}

// Swagger Configuration
const swaggerOptions = {
    definition: {
      openapi: '3.0.0',
      info: {
        title: 'CRUD API with MongoDB',
        version: '1.0.0',
        description: 'API documentation for Users, Posts, and Comments',
      },
      servers: [
        {
          url: 'http://localhost:3000', // Change to your production URL during deployment
        },
      ],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerAuth: 'jwt',
          },
        },
      },
      security: [{ bearerAuth: [] }], // Apply JWT globally
    },
    apis: ['./routes/*.js'], // Ensure this path matches your route files
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));
