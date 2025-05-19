const express = require("express");

// Routes
const router = express.Router();

// Controllers
const ProductController = require("../../controllers/User/ProductController");

// middleware for check user
const { isUser } = require("../../middlewares/UserTokenCheck");

// Routes for controllers
router.get("/listProduct", ProductController.listProduct);
router.post("/likeProduct", isUser, ProductController.likeProduct);
router.get("/likedProductList", isUser, ProductController.listLikedProduct);

// Export routes
module.exports = router;
