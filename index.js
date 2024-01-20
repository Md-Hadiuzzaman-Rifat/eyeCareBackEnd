const express = require("express");
const app = express();
const { MongoClient, ServerApiVersion } = require("mongodb");
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

app.get("/", (req, res) => {
  res.send("Listening");
});

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
      const result = await products.toArray()
      res.json(result)

    } catch (err) {
      console.log("failed to find");
    }
  }
  run();
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
