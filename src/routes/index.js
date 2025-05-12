// Import express
const express = require("express");

// Create router
const Router = express.Router();

const UserAuthRoutes = require("./User/UserAuthentication");
const AdminAuthRoutes = require("./Admin/AdminAuthhentication");
const MediaRoutes = require("./Media");
const UserRoutes = require("./User/User");
const AdminRoutes = require("./Admin/Admin");

// Use routers
Router.use("/userAuth", UserAuthRoutes);
Router.use("/adminAuth", AdminAuthRoutes);
Router.use("/media", MediaRoutes);
Router.use("/user", UserRoutes);
Router.use("/admin", AdminRoutes);

// Export routers
module.exports = Router;
