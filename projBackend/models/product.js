const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema;

const Schema = mongoose.Schema;

const productSchema = new Schema({
    name: {
        type: String,
        trim: true,
        required: true,
        maxlength: 32
    },
    description: {
        type: String,
        trim: true,
        required: true,
        maxlength: 2000
    },
    price: {
        type: Number,
        trim: true,
        required: true,
        maxlength: 32
    },
    category: {
        type: ObjectId,
        ref: "Category",
        required: true
    },
    stock: {
        type: Number,
    },
    sold: {
        type: Number,
        default: 0
    },
    photo: {
        data: Buffer,
        contentType: String
    },
    sizes: {
        type: Array,
        required:true
    },
    availableSizes: {
        type: Array,
        required:true
    },
    colors: {
        type: Array,
        required: true
    },
    featured: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

module.exports = mongoose.model("Product", productSchema);