const express = require('express');
require('dotenv').config();
const cors = require('cors');
const bp = require('body-parser');
const app = express();
const { json } = require('express');
const  DBConnect  = require('./utils/DBConnect');
const productsRouter = require('./routes/v1/products.route');
const usersRoute = require('./routes/v1/users.route');
const viewCount = require('./middleware/viewCount');
const limiter = require('./middleware/limiter');
const errorHandler = require('./middleware/errorHandler');
const port = process.env.PORT || 5000;
app.use(cors())
// app.use(express.json())
app.use(bp.json())
app.use(bp.urlencoded({ extended: true }))
//middleware to serve static file
app.use(express.static("public"));
// Apply the rate limiting middleware to all requests
app.use(limiter)
// middleware

//dbconnect 
const client = DBConnect();
// routes
app.use('/user',usersRoute);

// app routes
app.get('/',(req,res)=>{
    res.send('server is running');
})

  app.get('/home',(req,res)=>{
    // res.send("Products");
    // res.sendFile(__dirname+"/public/test.html");
    res.render("home.ejs",{id:5,user:{name:'rakib'}});

  });
  app.all('*',(req,res)=>{
    res.send("No Route Found");
  });
app.listen(port,()=>{
    console.log('running port',port)
})
// error handlerr
app.use(errorHandler);
// 
process.on("unhandleRejection",(error)=>{
  console.log(error.name,error.message);
  app.close(()=>{
    process.exit(1);
  });
})


