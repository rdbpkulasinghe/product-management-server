const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const ProductModel = require('./models/product')
var morgan = require('morgan')
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const app = express()
app.use(cors())
app.use(express.json())
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(morgan('tiny'))

// Multer setup
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

if (!fs.existsSync('uploads')) {
    fs.mkdirSync('uploads');
}

mongoose.connect("mongodb://127.0.0.1:27017/product_crud").then(()=>{
    console.log('connected to database')
}).catch(err=>{
    console.log(err)
})

app.get('/',(req,res)=>{
    ProductModel.find({})
    .then(products =>  res.status(200).json(products))
    .catch( err =>  res.status(500).json(err))
})



app.get('/getProduct/:id',(req,res)=>{
    const id = req.params.id;
    ProductModel.findById({_id:id})
    .then(products => res.status(200).json(products))
    .catch( err =>  res.status(500).json(err))
})

app.post("/productcreate", upload.single('image'),(req,res)=>{
    const newProduct = new ProductModel({
        productName: req.body.productName,
        description: req.body.description,
        price: req.body.price,
        quantity: req.body.quantity,
        category: req.body.category,
        sku: req.body.sku,
        image: req.file ? req.file.path : null
    });

    newProduct.save(req.body)
    .then(products => {
        res.status(201).json(newProduct)})
    .catch( err =>  {
        console.log(err)
        res.status(500).json(err)})
})

app.put('/productupdate/:id', upload.single('image'), (req,res) =>{
    const id = req.params.id;
    let image = req.body.image;

    if (req.file) {
        image = req.file.path;
    }

    ProductModel.findByIdAndUpdate(id, {
        productName: req.body.productName,
        description: req.body.description,
        price: req.body.price,
        quantity: req.body.quantity,
        category: req.body.category,
        sku: req.body.sku,
        image: image
    })
    .then(products => res.status(200).json(products))
    .catch( err => {
        console.log(err)
        res.status(500).json(err)
    }
    )
})
    

app.delete('/deleteProduct/:id',(req,res) =>{
    const id = req.params.id;
    ProductModel.findById(id)
      .then(product => {
        if (!product) {
          return res.status(404).json({ error: "Product not found" });
        }
          const imagePath = path.join(__dirname, '/', product.image);
          console.log(imagePath)
      fs.unlink(imagePath, (err) => {
        if (err) {
          console.log(`Failed to delete image file: ${err}`);
        } else {
          console.log('Image file deleted successfully');
        }
      });
      return ProductModel.findByIdAndDelete(id);
    })
    .then(deletedProduct => {
      if (deletedProduct) {
        res.json({ message: "Product successfully", product: deletedProduct });
      } else {
        res.status(404).json({ error: "Product not found after image deletion" });
      }
    })
    .catch(err => {
      res.status(500).json({ error: "An error occurred while deleting the product and image" });
    });
});

app.listen(3001,() =>{
    console.log("Server is Running")
})