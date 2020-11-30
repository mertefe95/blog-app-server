const express = require('express');
const mongoose = require('mongoose');
const postRouter = require('./routes/Post');
const userRouter = require('./routes/User');


const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());
app.use('/api', postRouter);
app.use('/api', userRouter);

const uri = "mongodb+srv://efemert95:efemert95@blog.go3nn.mongodb.net/blog?retryWrites=true&w=majority"

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



app.listen(PORT, () => {
    console.log(`Server ${PORT} is running`)
})

