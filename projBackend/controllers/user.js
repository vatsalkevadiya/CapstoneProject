const User = require("../models/user"); 
const Order = require("../models/order");

exports.getUserById = (req, res, next, id) => {
    User.findById(id).exec((err, user) => {
        if(err || !user) {
            return res.status(400).json({
                error: "No User found in DB"
            }); 
        }

        req.profile = user;
        next();
    });

};

exports.getUser = (req, res) => {

    req.profile.salt = undefined;
    req.profile.encry_password = undefined;
    req.profile.createdAt = undefined;
    req.profile.updatedAt = undefined;

    return res.json(req.profile);
};

exports.updateUser = (req, res) => {

    User.findByIdAndUpdate(
        {_id: req.profile._id},
        {$set: req.body},
        {new: true, useFindAndModify: false},
        (err, user) => {
            if(err) {
                return res.status(400).json({
                    error: "You are not allowed to update this user"
                });
            }

            user.salt = undefined;
            user.encry_password = undefined;
            user.createdAt = undefined;
            user.updatedAt = undefined;

            return res.json(user);
        }
    )
}

exports.userPurchaseList = (req, res) => {
    Order.find({user: req.profile._id})
    .populate("user", "_id name")
    .exec((err, order) => {
        if(err) {
            return res.status(400).json({
                error: "No order available for this user"
            })
        }

        return res.json(order);
    })
}

exports.pushOrderInPurchaseList = (req, res, next) => {

    let purchases = [];
    req.body.order.products.forEach(prod => {
        purchases.push({
            _id: prod._id,
            name: prod.name,
            description: prod.description,
            category: prod.category,
            quantity: prod.qauntity,
            amount: req.body.order.amount,
            transaction_id: req.body.order.transaction_id
        })
    });

    User.findOneAndUpdate(
        {_id: req.profile._id},
        {$push: {purchases: purchases}},
        {new: true},
        (err, purchases) => {
            if(err) {
                return res.status(400).json({
                    error: "Unable to save purchase list"
                });
            }
            next();
        }
    )

}