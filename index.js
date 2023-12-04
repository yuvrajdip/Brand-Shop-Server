const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const app = express()
const port = process.env.PORT || 5000 ;

//* middlewares 
app.use(cors())
app.use(express.json())

const uri = `mongodb+srv://${process.env.USER}:${process.env.PASS}@cluster0.otgz8q2.mongodb.net/?retryWrites=true&w=majority`;

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

    const database = client.db("brandProductsDB");
    const productsCollection = database.collection("products");
    const userCarts = database.collection("userCarts");


    //*********  Products related apis */

    //* get products based on brandNames 
    app.get('/products/:brandName', async(req,res)=>{
      const _ = req.params.brandName;
      const products = req.body;
      const query = { brandName : _ }
      const cursor = productsCollection.find(query);
      const result = await cursor.toArray();

      res.send(result);
    })

    
    //* get products details
    // app.get('/updateProduct/:id', async(req,res)=>{
    app.get('/productsBy/:id', async(req,res)=>{
      const id = req.params.id;
      const query = { _id : new ObjectId(id)};
      const result = await productsCollection.findOne(query);

      res.send(result);
    })

    // * post operation , creating brand products
    app.post('/products', async(req,res)=>{
      const _ = req.body;
      const result = await productsCollection.insertOne(_);
      // console.log(result);
      res.send( result );
    });

    //* update operation
    app.put('/products/:id',async(req,res)=>{
      const id = req.params.id ;
      const updatedProduct = req.body ;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert : true};
      const updateDoc = {
        // brandName , description, image, name, price, rating , typeOfProduct, _id
        $set: {
          brandName: updatedProduct.brandName ,
          description: updatedProduct.description ,
          image : updatedProduct.image ,  
          name : updatedProduct.name ,
          price : updatedProduct.price ,
          rating : updatedProduct.rating ,
          typeOfProduct : updatedProduct.typeOfProduct, 
        },
      };
      const result = await productsCollection.updateOne(filter, updateDoc, options);

      res.send(result);
    })


    //********  userCarts related api's  ***/

    app.get('/userCart/:email', async(req,res)=>{
      const userEmail = req.params.email ;
      // console.log(userEmail);
      const filter = { email : userEmail };
      const cursor = userCarts.find(filter);
      const result = await cursor.toArray();
      res.send(result);
    })

    app.post('/userCart',async(req,res)=>{
      const _ = req.body ;
      const result = await userCarts.insertOne(_);
      res.send(result);
    })

    app.delete('/userCart/:id',async(req,res)=>{
      const id = req.params.id ;
      const query = { _id : new ObjectId(id) };
      const result = await userCarts.deleteOne(query);
      res.send(result);
    })

    await client.connect();
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
  res.send('Hello Server')
})

app.listen(port, ()=>{
  console.log(`app listening on port ${port}`)
})