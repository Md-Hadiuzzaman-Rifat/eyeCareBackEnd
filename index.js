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

const database = client.db("sample_restaurants");
const movies = database.collection("restaurants");

app.get("/", (req, res) => {
  async function run() {
    try {
      console.log(
        "Pinged your deployment. You successfully connected to MongoDB!"
      );
      const result = await movies.findOne({ name: "Riviera Caterer" });
      res.send("Ami kuddus " + result?.name);
    } catch (err) {
      console.log(err);
    }
  }
  run();
});


app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
