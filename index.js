const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const express = require('express');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.clwxeiy.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

// jwt
const verifyJWT =(req, res, next)=>{
  console.log('hitting verify jwt');
  console.log(req.headers.authorization);
  const authorization = req.headers.authorization;
  if(!authorization){
    return res.status(401).send({error: true, message: 'Un Authorized Access'})
  }
  const token = authorization.split(' ')[1];
  console.log('token inside verify JWT ', token);
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (error, decoded) => {
    if(error){
      return res.status(401).send({error: true, message: 'Un Authorized Access'})
    }
    req.decoded = decoded;
    next();
  })
}

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const serviceCollection = client.db('carDoctor').collection('services');
    const bookingCollection = client.db('carDoctor').collection('bookings');

    //jwt 
    app.post('/jwt', (req, res)=>{
      const user = req.body;
      console.log(user);
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET,{
        expiresIn: '1hr' });
      res.send({token});
    })


    // get all service data to db server routes 
    app.get('/services', async(req, res)=>{
      const sort = req.query.sort;
      const search = req.query.search;
      console.log(search);
      // const query = { price: {$gte: 50, $lte: 150} };
      const query = { title: { $regex: search, $options: 'i'}}
      const options = {
        sort: {
          "price": sort === 'asc' ?  1 : -1
        }
      }
        const cursor = serviceCollection.find(query, options);
        const result = await cursor.toArray();
        res.send(result);
    })

    // get id 
    app.get('/services/:id', async(req, res)=>{
        const id = req.params.id;
        const query = {_id: new ObjectId(id)};

        const options = {
            sort: { "imdb.rating": -1 },
            // Include only the `title` and `imdb` fields in the returned document
            projection: { title: 1, price: 1, service_id: 1, img: 1 },
          };

        const result = await serviceCollection.findOne(query, options);
        res.send(result);
    })

    
    //bookings   set data to database 
    app.post('/bookings', async(req, res)=>{
      const booking = req.body;
      console.log(booking);
      const result = await bookingCollection.insertOne(booking);
      res.send(result);
    })

    // get Bookings data  booking routes
    app.get('/bookings',verifyJWT, async(req, res)=>{
      const decoded = req.decoded;
      console.log('come back after verify', decoded);
      if(decoded.email !== req.query.email){
        return res.status(403).send({error: 1, message: 'forbidden access'})
      }
      let query ={};
      if(req.query?.email){
        query = { email: req.query.email };
      }
      const result = await bookingCollection.find(query).toArray();
      res.send(result);
    })

    // update data 
    app.patch('/bookings/:id', async(req, res)=>{
      const id = req.params.id;
      const filter = { _id: new ObjectId(id)};
      const updateBooking = req.body;
      console.log(updateBooking);
      const updateDoc = {
        $set: {
          status: updateBooking.status
        },
      };
      const result = await bookingCollection.updateOne(filter, updateDoc);
      res.send(result);
    })

    // delete data 
    app.delete('/bookings/:id', async(req, res)=>{
      const id = req.params.id;
      const query = {_id: new ObjectId(id)}
      const result = await bookingCollection.deleteOne(query);
      res.send(result);
    })


    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);




app.get('/', (req, res)=>{
    res.send('Car Doctor is running')
})

app.listen(port, ()=>{
    console.log(`doctor is running port: ${port}`);
})