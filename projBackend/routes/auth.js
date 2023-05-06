var express = require("express");
var router = express.Router();
const { signout, signup, signin, isSignedIn } = require("../controllers/auth");
const { check } = require('express-validator');

router.post('/signup', [
    check("name", "Name should be atleast 3 characters").isLength({ min: 3 }),
    check("email", "Email is required").isEmail(),
    check("password", "Password should be atleast 6 characters").isLength({ min: 6 })
], signup);

router.post('/signin', [
    check("email", "Email is required").isEmail(),
    check("password", "Password is required").isLength({ min: 6 })
], signin);

router.get('/signout', signout);

router.get('/test', isSignedIn, (req, res) => {
    res.json(req.auth);
});


module.exports = router;