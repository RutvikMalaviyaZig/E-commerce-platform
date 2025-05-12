// Import express
const express = require("express");

// Create router
const Router = express.Router();

const UserAuthRoutes = require("./User/UserAuthenticationRoutes");
const AdminAuthRoutes = require("./Admin/AdminAuthhenticationRoutes");
const MediaRoutes = require("./MediaRoutes");
const UserRoutes = require("./User/UserRoutes");
const AdminRoutes = require("./Admin/AdminRoutes");
const CategoriesRoutes = require("./Admin/CategoriesRoutes")

// Use routers
Router.use("/userAuth", UserAuthRoutes);
Router.use("/adminAuth", AdminAuthRoutes);
Router.use("/media", MediaRoutes);
Router.use("/user", UserRoutes);
Router.use("/admin", AdminRoutes);
Router.use('/category', CategoriesRoutes)

// Export routers
module.exports = Router;
