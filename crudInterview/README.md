REST API with MongoDB and Node.js

This project is a RESTful API built with Node.js, Express.js, and MongoDB, featuring JWT-based authentication, role-based access control, Swagger documentation, and logging with log rotation.

Features

1. Authentication and Authorization

JWT Authentication: Secures API endpoints with JSON Web Tokens.

Role-Based Access Control: Differentiates between user and admin roles.

Protected Routes: Certain routes require authentication and/or admin privileges.

2. User Management

Sign-Up: Users can register with fields like name, firstName, email, country, and password.

Login: Users can log in to receive a JWT token.

Admin Privileges: Admins can create new users directly.

3. Post and Comment Management

Post CRUD: Users can create, update, and delete posts.

Comments: Users can add comments to posts.

4. Documentation

Swagger UI: API documentation available at /api/docs.

5. Logging

Winston Logger: Centralized logging for application events.

Log Rotation: Daily log files with retention policies.

6. Rate Limiting

Prevents abuse of API endpoints using express-rate-limit.

Project Structure

project-root/
├── models/               # Mongoose schemas for MongoDB
│   ├── user.js           # User schema
│   ├── post.js           # Post schema
│   └── comment.js        # Comment schema
├── routes/               # API route handlers
│   ├── auth.js           # Authentication and user routes
│   ├── posts.js          # Post routes
│   └── comments.js       # Comment routes
├── middleware/           # Custom middleware
│   └── auth.js           # Authentication and authorization middleware
├── logs/                 # Log files (auto-generated)
├── utils/                # Utility files
│   ├── logger.js         # Winston logger configuration
│   └── transporter.js    # Email transporter configuration
├── app.js                # Main application entry point
├── swagger.json          # Swagger documentation setup
├── .env                  # Environment variables
└── package.json          # Project metadata and dependencies

Setup Instructions

1. Prerequisites

Node.js (v14+ recommended)

MongoDB (local or MongoDB Atlas)

2. Install Dependencies

npm install

3. Configure Environment Variables

Create a .env file in the root directory with the following values:

PORT=3000
MONGO_URI=mongodb://localhost:27017/rest-api
JWT_SECRET=your_jwt_secret
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_password

4. Start the Server

npm start

The API will be accessible at http://localhost:3000.

Endpoints

Authentication

Method

Endpoint

Description

POST

/api/auth/signup

User registration

POST

/api/auth/login

User login

GET

/api/auth/protected

Access protected route

POST

/api/auth/admin/create-user

Create user (Admin only)

Posts

Method

Endpoint

Description

POST

/api/posts

Create a new post

PUT

/api/posts/:id

Update a post

DELETE

/api/posts/:id

Delete a post

Comments

Method

Endpoint

Description

POST

/api/posts/:id/comments

Add a comment to a post

Swagger Documentation

Access Swagger UI at: http://localhost:3000/api/docs

Detailed Features

1. JWT Authentication

Users receive a JWT token upon successful login.

The token is required to access protected routes.

Admin routes require both authentication and admin role.

2. Logging with Winston

Logs are stored in the logs/ directory.

Separate log files for general logs and error logs.

Daily rotation with retention for 14 days.

3. Swagger Documentation

Automatically generated API documentation using Swagger UI.

Includes request/response schemas and authentication details.

4. Rate Limiting

Limits requests to 100 per 15 minutes per IP.

Protects the API from abuse and denial-of-service attacks.

Testing the API

1. Using Postman

Import the following endpoints and test with valid payloads and headers.

Add the JWT token in the Authorization header for protected routes.

2. Automated Tests

Coming soon! Automated tests with Jest and Supertest can be added for API validation.

Deployment

1. Docker Deployment

Create a Dockerfile:

FROM node:18-alpine
WORKDIR /app
COPY package.json .
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm", "start"]

Create a docker-compose.yml:

version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - MONGO_URI=mongodb://mongodb:27017/rest-api
      - JWT_SECRET=your_jwt_secret
  mongodb:
    image: mongo
    ports:
      - "27017:27017"

Build and start the containers:

docker-compose up --build

2. Deploy to Heroku

Create a new Heroku app.

Add MongoDB Atlas for the database.

Set environment variables in Heroku config.

Deploy your code to Heroku.

Contributing

Fork the repository.

Create a feature branch.

Submit a pull request.

License

This project is licensed under the MIT License.

