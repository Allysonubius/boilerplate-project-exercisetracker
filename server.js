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

// Exercise personSchema
const exerciseSchema = new Schema({
    userId: String,
    description: String,
    duration: Number,
    date: Date
})

// MongoDV ExerciseSchema
const Exercise = mongoose.model("Exercise", exerciseSchema)

app.use(cors())

app.use(express.static('public'))

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/views/index.html')
});

const listener = app.listen(process.env.PORT || 3000, () => {
    console.log('Success in PORT: localhost:' + listener.address().port)
})

//const MONGO_URI = "mongodb+srv://allyson:78451278@cluster0.n5kla.mongodb.net/teste_02?retryWrites=true&w=majority";
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
    username: { type: String, unique: true }
});
const Person = mongoose.model('Person', personSchema);

// Create new user
app.post('/api/exercise/new-user', (req, res) => {
    const newPerson = new Person({
        username: req.body.username
    })
    newPerson.save((err, data) => {
        if (err) {
            res.json("Username already taken")
        } else {
            res.json({
                "username": data.username,
                "_id": data.id
            })
        }
    });
})

app.post('/api/exercise/add', (req, res) => {
    const {
        userId,
        description,
        duration,
        date
    } = req.body;

    Person.findById(userId, (err, data) => {
        if (!data) {
            res.send("Unknown userId")
        } else {
            const username = data.username
            const newExercise = Exercise({
                userId,
                description,
                duration,
                date
            })
            newExercise.save((err, data) => {
                res.json({
                    userId,
                    username,
                    description,
                    duration,
                    date
                })
            })
        }
    })
})

app.get('/api/exercise/log', (req, res) => {
    const {
        userId,
        from,
        to,
        limit
    } = req.query;
    Person.findById(userId, (err, data) => {
        if (!data) {
            res.send("Unknown userId")
        } else {
            const username = data.username;
            Exercise.find({ userId }, {
                    date: { $gte: new Date(from), $lte: new Date(to) }
                }).select([
                    "id",
                    "description",
                    "duration",
                    "date"
                ]).limit(+limit)
                .exec((err, data) => {
                    let customData = data.map(exer => {
                        let dateFormatted = new Date(exer.date)
                            .toDateString();
                        return {
                            id: exer.id,
                            description: exer.description,
                            duration: exer.duration,
                            date: dateFormatted
                        }
                    })
                    if (!data) {
                        res.json({
                            "userId": userId,
                            "username": username,
                            "count": 0,
                            "log": []
                        })
                    } else {
                        res.json({
                            "userId": userId,
                            "username": username,
                            "count": data.length,
                            "log": customData
                        })
                    }
                })
        }
    })
})

app.get('/api/exercise/users', (req, res) => {
    Person.find({}, (err, data) => {
        if (!data) {
            res.send("No users")
        } else {
            res.json(data)
        }
    })
})