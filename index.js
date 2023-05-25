const express = require('express');
const cors = require('cors');
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');


const app = express();
const port = process.env.PORT || 4000;

app.use(express.json());
app.use(cors());

// const corsOptions ={
//   origin:'*', 
//   credentials:true,
//   optionSuccessStatus:200,
// }

// app.use(cors(corsOptions))

const user = process.env.DB_USER
const password = process.env.DB_PASS


const uri = `mongodb+srv://${user}:${password}@cluster0.5j7d2x6.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();
    client.connect();
    const toyCollection = client.db('xtremeWheelz').collection('toys');
    app.get('/allToys', async(req,res)=>{
        const result = await toyCollection.find().limit(20).toArray();
        res.send(result)
    })
   
    app.get('/toy/:id', async(req,res)=>{
        const id = req.params.id;
        const query = { _id: new ObjectId(id)}
        const result = await toyCollection.findOne(query);
        res.send(result)
    })
    app.get('/allToys/:subCategory', async(req,res)=>{
        const subCategory = req.params.subCategory;
        const query = { subcategory: subCategory}
        const result = await toyCollection.find(query).toArray();
        // console.log(result)
        res.send(result)
    })
     app.get("/myToys/:email", async (req, res) => {
      // console.log(req.params.id);
      const email = req.params.email
      const query = { seller_email: email}
      let sortQuery = { }
      if(req.query?.priceSort){
        sortQuery = {
          price : req.query?.priceSort
        }
        
        const sortedToys = await toyCollection.find(query).sort(sortQuery).toArray();
        return res.send(sortedToys)
      }

      const result = await toyCollection.find(query).toArray();
      res.send(result);
    });
    // app.get("/myToys/ascending", async (req, res) => {
    //   const query = { price : 1 }
    //   const result = await toyCollection.find({}).sort(query).toArray();
    //   res.send(result);
    // });
    // app.get("/myToys/descending", async (req, res) => {
    //   const query = { price : -1 }
    //   const result = await toyCollection.find({}).sort(query).toArray();
    //   res.send(result);
    // });
    
    app.post('/addAToy', async (req, res) => {
      const toy = req.body;
      const result = await toyCollection.insertOne(toy);
      res.send(result)
    })
    app.patch('/upDateToy/:id', async(req,res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) }
      const updatedToy = req.body;
      const updateDoc = {
        $set: {
              price: updatedToy.price,
              quantity: updatedToy.quantity,
              description: updatedToy.description
        }
      }
      const result = await toyCollection.updateOne(filter, updateDoc)
      res.send(result)
    })
     app.delete('/deleteToy/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await toyCollection.deleteOne(query);
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


app.get('/', (req,res)=>{
    res.send("Xtreme Wheelz server is running");
})

app.listen(port, ()=> {
    console.log(`Xtreme Wheelz server is running on Port ${port}`)
})

