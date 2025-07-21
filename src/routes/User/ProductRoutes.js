const express = require("express");

// Routes
const router = express.Router();

// Controllers
const ProductController = require("../../controllers/User/ProductController");

// middleware for check user
const { isUser } = require("../../middlewares/UserTokenCheck");

// Routes for controllers
router.get("/listProduct", ProductController.listProduct);
router.get("/:productId", ProductController.getProductById);
router.post("/likeProduct", isUser, ProductController.likeProduct);
router.get("/likedProductList", isUser, ProductController.listLikedProduct);
router.post("/addToCart", isUser, ProductController.addToCartProduct);
router.get("/cartProductList", isUser, ProductController.listCartProduct);
router.post("/createReview", isUser, ProductController.reviewProduct);

// Export routes
module.exports = router;
