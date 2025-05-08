// Import express
const express = require('express');

// Create router
const Router = express.Router();

const UserAuthRoutes = require('./User/UserAuthentication');
const AdminAuthRoutes = require('./Admin/AdminAuthhentication');

// Use routers

Router.use('/user', UserAuthRoutes);
Router.use('/admin', AdminAuthRoutes);

// Export routers
module.exports = Router;
