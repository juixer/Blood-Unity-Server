const express = require("express");
require("dotenv").config();
const app = express();
const cors = require("cors");
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

app.use(express.json());
app.use(cors());

///////////////// MONGODB CONFIG//////////////////////

const uri = process.env.MONGO_URI;

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
    //////////////////////DB Collections////////////
    const database = client.db("bloodUnity");
    const users = database.collection("users");
    const donations = database.collection("donations");

    ///////////////////////// USER COLLECTION////////////////////////

    // insert user to database
    app.post("/users", async (req, res) => {
      try {
        const userinfo = req.body;
        const query = { email: req.body.email };
        const isUserExist = await users.findOne(query);
        if (isUserExist) {
          return;
        }
        const result = await users.insertOne(userinfo);
        res.send(result);
      } catch (err) {
        console.log(err);
      }
    });

    ////////////////////////Donation collection////////////////////

    // get all donation request from database

    app.get("/donations", async (req, res) => {
      try {
        const result = await donations.find().toArray();
        res.send(result);
      } catch (err) {
        console.log(err);
      }
    });

    // get single donation details from database
    app.get("/donation/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const result = await donations.findOne(query);
        res.send(result);
      } catch (err) {
        console.log(err);
      }
    });

    // get last 3 user by user email
    app.get("/donations/:email", async (req, res) => {
      try {
        const email = req.params.email;
        const query = { requester_email: email };
        const option = {
          sort: { _id: -1 },
        };
        const result = await donations.find(query, option).limit(3).toArray();
        res.send(result);
      } catch (err) {
        console.log(err);
      }
    });

    // insert donation request to database
    app.post("/donations", async (req, res) => {
      try {
        const donation = req.body;
        const result = await donations.insertOne(donation);
        res.send(result);
      } catch (err) {
        console.log(err);
      }
    });

    // update DOnation
    app.patch("/updateDonation/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const updateDonation = req.body;
        const query = { _id: new ObjectId(id) };
        const updateDoc = {
          $set: {
            recipient_name: updateDonation.recipient_name,
            bloodType: updateDonation.bloodType,
            district: updateDonation.district,
            hospital_name: updateDonation.hospital_name,
            full_address: updateDonation.full_address,
            donation_time: updateDonation.donation_time,
            donation_date: updateDonation.donation_date,
            donation_time_format: updateDonation.donation_time_format,
            message: updateDonation.message,
          },
        };
        const result = await donations.updateOne(query, updateDoc);
        res.send(result);
      } catch (err) {
        console.log(err);
      }
    });

    // Delete Donation request from database
    app.delete("/donation/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const result = await donations.deleteOne(query);
        res.send(result);
      } catch (err) {
        console.log(err);
      }
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
  }
}
run().catch(console.dir);

//////////////////////// NORMAL ROUTES/////////////////
app.get("/", (req, res) => {
  res.send({ message: "Welcome to Blood Unity" });
});

app.all("*", (req, res, next) => {
  const error = new Error(`The Requested URL is invalid: ${req.url}`);
  error.status = 404;
  next(error);
});

app.use((err, req, res, next) => {
  res.status(err.status || 500).json({ message: err.message });
});

app.listen(port, () => {
  console.log(`listening on ${port}`);
});
