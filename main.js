let express = require('express');
let app = express();
const mongo = require('mongodb');
const MongoClient = mongo.MongoClient;
const mongoUrl = "mongodb+srv://test:root@cluster0.fsqmx.mongodb.net/Edureka_internship_zomato_data?retryWrites=true&w=majority"
const dotenv = require('dotenv');
dotenv.config()
const bodyParser = require('body-parser')
const cors = require('cors')
let port = process.env.PORT || 8210;
var db;

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.use(cors())

// app.use(bodyParser.urlencoded({extended:true}))
// app.use(bodyParser.json())
// app.use(cors())

app.get('/', (req, res) => {
    res.send('welcome to my express app')
})

// location
app.get('/location', (req, res) => {
    db.collection('location').find().toArray((err, result) => {
        if (err) throw err;
        res.send(result)
    })
})




// restaurant as per location
// app.get('/restaurants/:id', (req, res) => {
//     let restId = Number(req.params.id)
//     console.log('>>>restId>>', restId)
//     db.collection('RestaurantsData').find({ state_id: restId }).toArray((err, result) => {
//         if (err) throw err;
//         res.send(result)
//     })
// })

app.get('/restaurants', (req, res) => {
    let stateId = Number(req.query.state_id);
    let mealId = Number(req.query.mealtype_id);
    let query = {}
    if (mealId && stateId) {
        query = { "mealTypes.mealtype_id": mealId, state_id: stateId }
    }
    else if (stateId) {
        query = { state_id: stateId }
    }
    else if (mealId) {
        query = { "mealTypes.mealtype_id": mealId }
    }
    console.log('>>RestId>>', stateId);
    db.collection('RestaurantsData').find(query).toArray((err, result) => {
        if (err) throw err;
        res.send(result)
    })
})


// filters


app.get('/filter/:mealId', (req, res)=>{
    let sort = { cost: 1 }
    let mealId = Number(req.params.mealId)
    let skip = 0;
    let limit = 100000000000000;
    let cuisineId = Number(req.query.cuisine)
    let lcost = Number(req.query.lcost)
    let hcost = Number(req.query.hcost)
    let query = {}
    if (req.query.sort) {
        sort = { cost: req.query.sort }
    }
    if (req.query.skip && req.query.limit) {
        skip = Number(req.query.skip);
        limit = Number(req.query.limit);
    }
    if (cuisineId & lcost & hcost) {
        query = {
            "cuisines.cuisine_id": cuisineId,
            "mealTypes.mealtype_id": mealId,
            $and: [{ cost: { $gt: lcost, $lt: hcost } }]
        }
    }
    else if (cuisineId) {
        query = {
            "cusines.cuisine_id": cuisineId,
            "mealTypes.mealtype_id": mealId
        }
    }
    else if(lcost&hcost){
        query={
            $and:[{cost:{$gt:lcost, $lt:hcost}}],
            "mealTypes.mealtype_id":mealId
        }
    }
    db.collection('RestaurantsData').find(query).sort(sort).skip(skip).limit(limit).toArray((err,result)=>{
        if(err) throw err;
        res.send(result)
    })
})

// quick search meal type
app.get('/mealType', (req, res) => {
    db.collection('MealType').find().toArray((err, result) => {
        if (err) throw err;
        res.send(result)
    })
})


// restaurants details
app.get('/details/:id',(req,res)=>{
    let restId=Number(req.params.id);
    db.collection('RestaurantsData').find({restaurant_id:restId}).toArray((err,result)=>{
        if(err) throw err;
        res.send(result)
    })
})

// menu with respect to restaurants
app.get('/menu/:id',(req,res)=>{
    let restId=Number(req.params.id)
    db.collection('RestaurantMenu').find({restaurant_id:restId}).toArray((err,result)=>{
        if(err) throw err;
        res.send(result)
    })
})


// menu on basis of user selection 

// get order
app.get('/orders',(req,res)=>{
    let email=req.query.email
    let query={}
    if(email){
        query={"email":email}
    }
    db.collection('orders').find(query).toArray((err,result)=>{
        if(err) throw err;
        res.send(result)
    })
})

// place order (post) methods
app.post('/placeOrder',(req,res)=>{
    // console.log(req.body)
    db.collection('orders').insert(req.body,(err,result)=>{
        if(err) throw err;
        res.send('OrderAdded')
    })
})

app.post('/menuItem',(req,res)=>{
    console.log(req.body)
    db.collection('RestaurantMenu').find({menu_id:{$in:req.body}}).toArray((err,result)=>{
        if(err) throw err;
        res.send(result)
    })
})

// delete order
app.delete('/deleteOrder',(req,res)=>{
    db.collection('orders').remove({},(err,result)=>{
        if(err) throw err;
        res.send(result)
    })
})

// updatae order

app.put('/updateOrder/:id',(req,res)=>{
    let oId=mongo.ObjectId(req.params.id)
    let status=req.query.status?req.query.status:'Pending'
    db.collection('orders').updateOne(
        {_id:oId},
        {$set:{
            "status":status,
            "bank_name":req.body.bank_name,
            "bank_status":req.body.bank_status
        }},
        (err,result)=>{
            if(err) throw err;
            res.send(`Status updated to ${status}`)
        })
})




console.log('hello world');

MongoClient.connect(mongoUrl, (err, client) => {
    if (err) console.log("Error While Connecting");
    db = client.db('Edureka_internship_zomato_data');
    app.listen(port, () => {
        console.log(`listening on port no ${port}`)
    });
})

