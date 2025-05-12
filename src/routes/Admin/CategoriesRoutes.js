const express = require("express");

// Routes
const router = express.Router();

// Controllers
const CategoryController = require("../../controllers/Admin/CategoriesController");

// middleware for check user
const { isAdmin } = require("../../middlewares/AdminTokenCheck");

// routes
router.post("/create",isAdmin, CategoryController.createCategories);
router.put("/update",isAdmin, CategoryController.updateCategories);
router.delete("/delete",isAdmin, CategoryController.deleteCategories);
router.get("/list",isAdmin, CategoryController.listCategories);

module.exports = router;
