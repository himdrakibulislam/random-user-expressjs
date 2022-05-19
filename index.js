const express = require('express');
require('dotenv').config();
const { MongoClient, ServerApiVersion } = require('mongodb');
const cors = require('cors');
const ObjectId = require('mongodb').ObjectId;
const app = express();
const { initializeApp } = require('firebase-admin/app');
var admin = require("firebase-admin");
const cloudinary = require('cloudinary');
var serviceAccount = require("./drone-arial-firebase-adminsdk.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});
const port = process.env.PORT || 5000;
app.use(cors())
app.use(express.json())
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.znysc.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
app.get('/',(req,res)=>{
    res.send('drone arial server is running');
})
async function verifyToken(req,res,next){
  if(req.headers?.authorization?.startsWith('Bearer ')){
    const token = req.headers.authorization.split(' ')[1]
    const decodedUser = await admin.auth().verifyIdToken(token);
    req.decodedEmail = decodedUser.email;
  }
  next();
}
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
   api_key: process.env.API_KEY,
   api_secret: process.env.API_SECRET
})
async function run() {
    try {
      // Connect the client to the server
      await client.connect();
      const database = client.db("DRONE_ARIAL");
      const productCollection = database.collection("products");
      const orderCollection = database.collection("orders");
      const reviewCollection = database.collection("review");
      const usersCollection = database.collection("users");
      const cartCollection = database.collection("cart");
      // add products
      app.post('/addProduct',async(req,res)=>{
        const productInfo = req.body;
        const result = await productCollection.insertOne(productInfo);
        res.json(result);
      });
      // product
      app.get('/products',async(req,res)=>{
        const manage = productCollection.find({})
        const result = await manage.limit(6).toArray()
        res.send(result)
      });
      // all products
      app.get('/allProducts',async(req,res)=>{
        const manage = productCollection.find({})
        const result = await manage.toArray()
        res.send(result);
      });
      // all users 
      app.get('/allusers/:email',verifyToken,async(req,res)=>{
        const email = req.params.email;
        const query = {email:email};
        const adminCheck = await usersCollection.findOne(query); 
        const logedInEmail = req.decodedEmail;
        if(logedInEmail && adminCheck?.role === 'admin'){
        const users = usersCollection.find({});
        const result = await users.toArray();
        res.send(result);
        }
      })
      // place order
      app.get('/placeorder/:productId', async(req,res)=>{
        const productId = req.params.productId
        const query  = {_id:ObjectId(productId)}
        const result = await productCollection.findOne(query)
        res.send(result);
      })
      // submit order
      app.post('/placeorder',async(req,res)=>{
        const orderInfo = req.body;
        const result = await orderCollection.insertOne(orderInfo);
        res.send(result);
      })
      // users orders
      app.get('/userorders/:email',async(req,res)=>{
        const email = req.params.email;
        
          const query = {email:email}
        const userorders = orderCollection.find(query);
        const result = await userorders.toArray();
        res.send(result);
       
      });
      // delete order
      app.delete('/userorders/:deletingId',async(req,res)=>{
        const id = req.params.deletingId;
        const query = {_id:ObjectId(id)};
        const result = await orderCollection.deleteOne(query);
        res.json(result);
      });
      // delete product 
      app.delete('/deleteProduct/:id',async(req,res)=>{
        const id = req.params.id;
        const query ={_id: ObjectId(id)}
        const result = await productCollection.deleteOne(query);
        res.json(result);
      })
      // delete order 
      app.delete('/deleteorder/:id',async(req,res)=>{
        const id  = req.params.id;
        const query = {_id:ObjectId(id)};
        const result = await orderCollection.deleteOne(query);
        res.json(result);
      })
      // delete image from cloudinary
      app.delete('/deleteimage/:imageId',async(req,res)=>{
        const id = req.params.imageId;
         await cloudinary.uploader.destroy(id,(result)=>{res.json(result)})
      })
      // review 
      app.post('/review',async(req,res)=>{
        const reviewDetails = req.body;
        const result = await reviewCollection.insertOne(reviewDetails);
        res.json(result);
      })
      // all Reviews
      app.get('/allreviews',async(req,res)=>{
        const allreviews = reviewCollection.find({});
        const result = await allreviews.toArray();
        res.send(result);
      })
      // user 
      app.post('/user',async(req,res)=>{
        const user = req.body;
         const userInfo = {
           name:user.name,
           email:user.email
         }
         const result = await usersCollection.insertOne(userInfo);
         res.json(result);
      });
      // upsert user
      app.put('/user',async(req,res)=>{
        const user = req.body;
        const filter = {email:user.email};
        const options = { upsert: true };
        const updateDocument ={
          $set:user
        }
        const result = usersCollection.updateOne(filter,updateDocument,options)
        res.send(result);
      });
      // update product 
      app.put('/updateproduct/:id',async(req,res)=>{
        const id = req.params.id;
        const query = {_id:ObjectId(id)}
        const updateProduct = {
          $set: req.body
        }
        const result = await productCollection.updateOne(query,updateProduct);
        res.json(result);
      })
      // user admin 
      app.put('/user/admin',verifyToken,async(req,res)=>{
        const email = req.body.adminEmail;
        const logedInEmail = req.decodedEmail;
        if(logedInEmail){
          const logedInEmailAccount = await usersCollection.findOne({email:logedInEmail})
          if(logedInEmailAccount.role === 'admin'){
            const filter = {email:email}
            const updateDoc = {$set:{role:'admin'}}
            const result = usersCollection.updateOne(filter,updateDoc);
          }
        }else{
          res.status(401).json({message:'You do not have access to admin'});
        }
      });
      // admin check
      app.get('/user/:email',async(req,res)=>{
        const email = req.params.email;
        const query = {email:email};
        const checkAdmin = await usersCollection.findOne(query);
        let isAdmin = false;
        if(checkAdmin?.role === 'admin'){
          isAdmin = true;
        }
        res.json({admin:isAdmin})
      });
      //manage all orders
      app.get('/manageallorders',verifyToken,async(req,res)=>{
        const loginUser = req.decodedEmail
        if(loginUser){
          const loginUserAccount = await usersCollection.findOne({email:loginUser})
          if(loginUserAccount.role === 'admin'){
            const manageAllOrders = orderCollection.find({})
              const result = await manageAllOrders.toArray()
              res.send(result);
          }
        }
        
      });
      // cart 
      app.post('/cart',async(req,res)=>{
        const cart = req.body;
        const result = await cartCollection.insertOne(cart);
        res.json(result);
      });
      // get cart
      app.get('/cart/:email',async(req,res)=>{
        const email = req.params.email;
        const query = {email:email};
        const cart =  cartCollection.find(query);
        const result = await cart.toArray();
        res.send(result);
      });
      // deleet cart items
      app.delete('/cartdelete/:id',async(req,res)=>{
        const id = req.params.id;
        const query = {_id:ObjectId(id)};
        const result = await cartCollection.deleteOne(query);
        res.json(result);
      });
      // delete 
      app.delete('/clearCart/:email',async(req,res)=>{
        const email = req.params.email;
        const query = {email: email};
        const result = await cartCollection.deleteMany(query);
        res.json(result);
      })
    } finally {
      // Ensures that the client will close when you finish/error
    //   await client.close();
    }
  }
  run().catch(console.dir);
app.listen(port,()=>{
    console.log('running port',port)
})


