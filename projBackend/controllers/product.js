const Product = require("../models/product");
const formidable = require("formidable");
const _ = require("lodash");
const fs = require("fs");

exports.getProductById = (req, res, next, id) => {
    Product.findById(id)
        .populate("category")
        .exec((err, product) => {
            if(err) {
                return res.status(400).json({
                    error: "Product not found"
                });
            }
            req.product = product;
            next();
    })
} 

exports.createProduct = (req, res) => {

    let form = new formidable.IncomingForm();
    form.keepExtensions = true;

    form.parse(req, (err, fields, file) => {
        if(err) {
            return res.status(400).json({
                error: "Problem with image!"
            })
        }

        const { name, description, price, category, stock, photo, sizes, availableSizes, colors, featured } = fields;
        if(!name || !description || !price || !category || !stock || !sizes || !colors) {
            return res.status(400).json({
                error: "Please include all fields"
            })
        }
        if(sizes && colors){
            fields.sizes = sizes.split(',');
            if(availableSizes) fields.availableSizes = availableSizes.split(',');
            fields.colors = colors.split(',');
        }
        let product = new Product(fields);

        if(file.photo) {
            if(file.photo.size > 3000000) {
                return res.status(400).json({
                    error: "File size too big!"
                })
            }

            product.photo.data = fs.readFileSync(file.photo.path);
            product.photo.contentType = file.photo.type;
        }

        //save to DB
        product.save((err, product) => {
            if(err) {
                return res.status(400).json({
                    error: "Saving product in DB failed"
                })
            }

            res.json(product);
        })
    })
}

exports.getProduct = (req, res) => {
    req.product.photo = undefined;
    return res.json(req.product);
}

//middleware
exports.photo = (req, res, next) => {
    if(req.product.photo.data) {
        res.set("Content-Type", req.product.photo.contentType);
        return res.send(req.product.photo.data);       
    }    

    next();
}

exports.removeProduct = (req, res) => {
    const product = req.product;

    product.remove((err, deletedProduct) => {
        if(err) {
            return res.status(400).json({
                error: "Failed to delete the product" + product.name
            })
        }

        return res.json({
            message: `Product successfully deleted`,
            deletedProduct
        });
    })
}

exports.updateProduct = (req, res) => {
    let form = new formidable.IncomingForm();
    form.keepExtensions = true;

    form.parse(req, (err, fields, file) => {
        if(err) {
            return res.status(400).json({
                error: "Problem with image!"
            })
        }
        if(fields.sizes)fields.sizes = fields.sizes.split(',');
        if(fields.colors)fields.colors = fields.colors.split(',');
        if(fields.availableSizes) fields.availableSizes = fields.availableSizes.split(',');
        //updation code
        let product = req.product;
        product = _.extend(product, fields)

        if(file.photo) {
            if(file.photo.size > 3000000) {
                return res.status(400).json({
                    error: "File size too big!"
                })
            }

            product.photo.data = fs.readFileSync(file.photo.path);
            product.photo.contentType = file.photo.type;
        }

        //save to DB
        product.save((err, product) => {
            if(err) {
                return res.status(400).json({
                    error: "Updating product in DB failed" 
                })
            }

            res.json(product);
        })
    })
}

exports.getAllProducts = (req, res) => {
    let limit =  req.query.limit ? parseInt(req.query.limit) : 8;
    let sortBy = req.query.sortBy ? req.query.sortBy : "_id";

    Product.find()
        .select("-photo")
        .populate("category")
        .sort([[sortBy, "asc"]])
        .limit(limit)
        .exec((err, products) => {
            if(err) {
                return res.status(400).json({
                    error: "No Product found"
                })
            }

            res.json(products);
        })
}
exports.getAllFeaturedProducts = (req, res) => {
    let limit =  req.query.limit ? parseInt(req.query.limit) : 8;
    let sortBy = req.query.sortBy ? req.query.sortBy : "_id";

    Product.find({featured:true})
        .select("-photo")
        .populate("category")
        .sort([[sortBy, "asc"]])
        .limit(limit)
        .exec((err, products) => {
            if(err) {
                return res.status(400).json({
                    error: "No Product found"
                })
            }
            res.json(products);
        })
}

exports.getProductByCategory = (req, res) => {
    let limit =  req.query.limit ? parseInt(req.query.limit) : 8;
    let sortBy = req.query.sortBy ? req.query.sortBy : "_id";

    Product.find()
        .select("-photo")
        .populate({
            path: 'category',
            match: {
              name: req.params.category
            }
          })
        .sort([[sortBy, "asc"]])
        .limit(limit)
        .exec((err, products) => {
            if(err) {
                return res.status(400).json({
                    error: err
                })
            }
            res.json(products.filter(e=>e.category));
        })
}

exports.getProductByName = (req, res) => {
    let limit =  req.query.limit ? parseInt(req.query.limit) : 8;
    let sortBy = req.query.sortBy ? req.query.sortBy : "_id";

    Product.find({name: {'$regex': req.params.productName, '$options' : 'i'}})
    .select("-photo")
    .populate("category")
    .sort([[sortBy, "asc"]])
    .limit(limit)
    .exec((err, products) => {
        if(err) {
            return res.status(400).json({
                error: "No Product found"
            })
        }

        res.json(products);
    })
}

exports.getAllUniqueCategories = (req, res) => {
    Product.distinct("category", {}, (err, categories) => {
        if(err) {
            return res.status(400).json({
                error: "No category found"
            })
        }

        res.json(categories);
    })
}

exports.updateStock = (req, res, next) => {
    let myOperations = req.body.order.products.map(product => {
        return {
            updateOne: {
                filter: {_id: product._id},
                update: {$inc: {stock: -prod.count, sold: +prod.count}}
            }
        }
    })

    Product.bulkWrite(myOperations, {}, (err, products) => {
        
        if(err) {
            return res.status(400).json({
                error: "Bulk Operations Failed"
            })       
        }

        next();
    })
}