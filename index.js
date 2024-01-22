const express = require("express");
const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri =
  "mongodb+srv://shohagEyeCare:fbFw42qbbrzzwbVS@demoapp.yakyuav.mongodb.net/?retryWrites=true&w=majority";

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
      const products = productList.find({});
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

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
