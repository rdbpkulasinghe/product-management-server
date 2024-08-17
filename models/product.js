const mongoose = require("mongoose")
const ProductSchema = new mongoose.Schema({
    productName: {
        type:String,
        
    },
    description: {
        type:String,
        
    },
    price: {
        type:Number,
        
    },
    quantity: {
        type:Number,
        
    },
    category: {
        type:String,
        
    },
    sku: {
        type:String,
        
    },
    image: {
        type:String,
        
    },
    

})

const ProductModel = mongoose.model("product",ProductSchema)
module.exports = ProductModel