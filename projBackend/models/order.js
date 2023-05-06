const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema;

const Schema = mongoose.Schema;

const productCartSchema = new Schema({
    product: {
        type: ObjectId,
        ref: "Product"
    },
    name: String,
    count: Number,
    price: Number
});

const ProductCart = mongoose.model("ProductCart", productCartSchema);

const orderSchema = new Schema({
    products: [productCartSchema],
    transaction_id: {},
    amount: { type: Number },
    address: { type: String },
    status: {
        type: String,
        default: "Received",
        enum: ["Cancelled", "Delivered", "Shipped", "Processing", "Received"]
    },
    updated: Date,
    user: {
        type: ObjectId,
        ref: "User"
    }
}, { timestamps: true });

const Order = mongoose.model("Order", orderSchema);

module.exports = { Order, ProductCart };