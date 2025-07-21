const express = require("express");

// Routes
const router = express.Router();

// Controllers
const ProductController = require("../../controllers/Admin/ProductController");

// middleware for check user
const { isAdmin } = require("../../middlewares/AdminTokenCheck");

// routes
router.post("/create", isAdmin, ProductController.createProduct);
router.put("/update", isAdmin, ProductController.updateProduct);
router.delete("/delete", isAdmin, ProductController.deleteProduct);
router.get("/list", isAdmin, ProductController.listProduct);

module.exports = router;
