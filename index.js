import express from "express";
import cors from "cors";
import { MongoClient, ObjectId, ServerApiVersion } from "mongodb";
const uri =
  "mongodb+srv://simpleDbUser:vwVQUHe35oGdvGg1@cluster0.dnjrxcz.mongodb.net/?appName=Cluster0";
import admin from "firebase-admin";
const serviceAccount = "./TheBookHaven.json";
const app = express();

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

//middleware
app.use(cors());
app.use(express.json());
const PORT = process.env.PORT || 5050;
//

//firebase middleware with fireBase token
const fireBaseVerifyToken = async (req, res, next) => {
  const authorization = req.headers.authorization;
  if (!authorization) {
    return res
      .status(401)
      .json({ status: false, message: "UnAuthorized User" });
  }
  console.log(authorization);
  const token = authorization.split(" ")[1];


  try {
    const decoded = await admin.auth().verifyIdToken(token);
      console.log("inside token",decoded);
      req.token_email =decoded.email
    next();
  } catch (error) {
    
  }
};

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    await client.connect();

    const db = client.db("bookvibes");
    const userCollection = db.collection("users");
    const booksCollection = db.collection("books");

     app.post("/users", async (req, res) => {
       const reqBody = req.body;
       const email = reqBody.email;
       const existUser = await userCollection.findOne({ email: email });
       if (existUser) {
         return res.json({ status: false, message: "User Exist" });
       }
       const result = await userCollection.insertOne(reqBody);
       res
         .status(200)
         .json({ status: true, result, message: "User Created SuccessFull" });
     });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    /*    await client.close(); */
  }
}
run().catch(console.dir);

app.listen(PORT, () => {
  console.log(`app is running in ${PORT} port`);
});
