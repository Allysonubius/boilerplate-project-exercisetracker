const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()

// import mongoose
const mongoose = require('mongoose');
//import body-parser
const bodyParser = require('body-parser');
// Definition Schema
const { Schema } = mongoose;

app.use(cors())

app.use(express.static('public'))

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/views/index.html')
});

const listener = app.listen(process.env.PORT || 3000, () => {
    console.log('Your app is listening on port ' + listener.address().port)
})

// Connection MongoDB 
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

console.log("STATUS: " + mongoose.connection.readyState)

// body-parser
app.use(bodyParser.urlencoded({
    extended: false
}))
app.use(bodyParser.json());

// Schema Mongo
const personSchema = new Schema({
    username: String
});
const Person = mongoose.model('Person', personSchema);

// Create new user
app.post('/api/exercise/new-user', (req, res) => {
    const newPerson = new Person({
        username: req.body.username
    })
    newPerson.save((err, data) => {
        res.json({
            "username": data.username,
            "_id": data.id
        })
    })
})