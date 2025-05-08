// Import express
const express = require('express');

// Create router
const Router = express.Router();

const UserAuthRoutes = require('./User/UserAuthentication');

// Use routers

Router.use('/user', UserAuthRoutes);

// Export routers
module.exports = Router;
