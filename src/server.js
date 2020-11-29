const express = require('express');
const mongoose = require('mongoose');
const postRouter = require('./routes/Post');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors())
app.use(express.json())
app.use('/api', postRouter)

const uri = process.env.ATLAS_URI


const connection = mongoose.connection
connection.once('open', () => {
    console.log('MongoDB connection has established.')
})

mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
})


const PORT = process.env.PORT || 8080;


if (process.env.NODE_ENV === "production") {
    app.use(express.static('../../client/build'))
}



app.listen(PORT, () => {
    console.log(`Server ${PORT} is running`)
})

