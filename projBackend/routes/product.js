const express = require("express");
const router = express.Router();

const { getProductById, createProduct, getProduct, photo, removeProduct, updateProduct, getAllProducts, getAllUniqueCategories , getAllFeaturedProducts ,getProductByCategory, getProductByName } = require("../controllers/product");
const { isSignedIn, isAuthenticated, isAdmin } = require("../controllers/auth");
const { getUserById } = require("../controllers/user");

//all of params
router.param("userId", getUserById);
router.param("productId", getProductById);

//all of actual routes

//create routes
router.post("/product/create/:userId", isSignedIn, isAuthenticated, isAdmin, createProduct);

//read routes
router.get("/product/:productId", getProduct);
router.get("/product/search/:productName", getProductByName);
router.get("/product/photo/:productId", photo);
router.get("/products", getAllProducts);
router.get("/products/featured", getAllFeaturedProducts);
router.get("/products/categories", getAllUniqueCategories);
router.get("/products/categories", getAllUniqueCategories);
router.get("/products/categories/:category", getProductByCategory);


//delete routes
router.delete("/product/:productId/:userId", isSignedIn, isAuthenticated, isAdmin, removeProduct);

//update routes
router.put("/product/:productId/:userId", isSignedIn, isAuthenticated, isAdmin, updateProduct);

module.exports = router;