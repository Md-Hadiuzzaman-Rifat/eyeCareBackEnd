const express = require("express");
require('dotenv').config()
const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri = process.env.MONGODB_URL;
const  admin = require("firebase-admin");
const  serviceAccount = require("./firebaseSDKEnvironment.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
})

const cors = require("cors");
const port = 2020;
app.use(cors());
app.use(express.json());

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

// database and collection name
const database = client.db("eye-care");
const productList = database.collection("productList");
const userList= database.collection("userList")
const orderList = database.collection("orderList")

app.get("/", (req, res) => {
  res.send("Listening");
});


// create logged in users collection
app.post("/addUser", async(req, res)=>{
  try{
    const user= req.body 
    const filter= {email:user.email}
    const option={upsert:true}
    const updateDoc= {$set: user}
    const result = await userList.updateOne(filter, updateDoc, option)
    res.json(result)
  }catch{
    console.log("Failed to insert user.");
  }
})

// get logged users collection
app.get("/getUser", async(req, res)=>{
  try{
    const users = await userList.find({})
    const result = await users.toArray()
    res.send(result)
  }catch(err){
    console.log("Failed to find users collection");
  }
})
// get logged users collection
app.put("/editUser", async(req, res)=>{
  try{
    const {email, role}= req?.body || {}
    const filter = { email: email };
    const options= { upsert: true };
    const updateDoc = {
      $set: {
        role: role
      },
    };
    const result = await userList.updateOne(filter, updateDoc, options)
    res.send(result)
  }catch(err){
    console.log("Failed to find users collection");
  }
})

app.post("/uploadProduct", (req, res) => {
  async function run() {
    try {
      const product = req.body;
      const result = await productList.insertOne(product);
      res.json(result);
    } catch (err) {
      console.log("failed to write user");
    }
  }
  run();
});

app.get("/getProducts", (req, res) => {
  async function run() {
    try {
      const products = await productList.find({});
      const result = await products.toArray();
      res.json(result);
    } catch (err) {
      console.log("failed to find");
    }
  }
  run();
});

app.delete("/getProducts/:id", (req, res) => {
  async function run() {
    try {
      const id = new ObjectId(req.params.id);
      const result = await productList.deleteOne({ _id: id });
      res.json(result);
    } catch (err) {
      res.send("Failed to upload");
    }
  }
  run();
});

app.put("/editProduct/:id", (req, res) => {
  async function run() {
    try {
      const id = new ObjectId(req.params.id);
      const filter = { _id: id };
      const result = await productList.replaceOne(filter, req.body);
      res.json(result);
    } catch (err) {}
  }
  run();
});

app.post("/getSelectedProduct",async(req,res)=>{
  try{
    const data= req.body
    const objectId= data.map(d=>new ObjectId(d))
    // console.log(objectId);
    const query= {_id:{$in:objectId}}
    const result =await productList.find(query).toArray()
    // console.log(result);
    res.send(result)
  }catch{
    console.log("Failed");
  }
})

app.get("/getProduct/:id", (req, res) => {
  async function run() {
    try {
      const id = new ObjectId(req.params.id);
      const result = await productList.findOne({ _id: id });
      res.json(result);
    } catch (err) {
      console.log("failed to find");
    }
  }
  run();
});

// confirm order
app.post('/confirmOrder',(req,res)=>{
  async function run() {
    try {
      const details = req.body;
      const result = await orderList.insertOne(details);
      res.json(result);
    } catch (err) {
      console.log("failed to Confirmed order");
    }
  }
  run();
})

// Find ordered product from database 
app.get("/orderedProduct" ,async(req,res)=>{
  try{
    const products = orderList.find({});
    const result = await products.toArray();
    res.json(result);
  }catch(err){
    console.log("Failed to load ordered product.");
  }
})

// Find single order product
app.get("/singleOrder/:orderId",async(req,res)=>{
  try{
    const id = new ObjectId(req.params.orderId);
    const result = await orderList.findOne({ _id: id });
    res.json(result);
  }catch(err){
    console.log("Failed to load single Ordered product.");
  }
})

// verify id token middleware
async function verifyIdToken(req, res, next){
  if(req.headers?.authorization?.startsWith("Bearer ")){
    const idToken= req.headers.authorization.split("Bearer ")[1]
    try{
      const decodedUser= await admin?.auth()?.verifyIdToken(idToken)
      req.email = decodedUser.email
    }catch(err){
      console.log("Error from Verify middleware");
    }
  }
  next()
}

// Find User`s Old Orders
app.get("/myOrders", verifyIdToken,async(req, res)=>{
  try {
    const {email}= req.query || {}
    if(email===req?.email){
      const orders = orderList.find({email});
    const result = await orders.toArray();
    res.json(result);
    }
  } catch (err) {
    res.status(401).json({message:"User Not Authorized"})
  }
})

// This is for customer order status change
app.put('/singleOrder',async(req, res)=>{
    
})


app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
