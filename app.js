// Packages

const express = require('express');
const app = express();
require('dotenv').config();
const mongoose = require('mongoose');
const cors = require('cors');

app.use(express.json());
app.use(cors());


// Routes

const menuR = require('./routes/menu.route');
const userR = require('./routes/user.routes');
app.use('/api/v1/menu', menuR);
app.use('/api/v1/user', userR);

// DB Connect

mongoose.connect(process.env.DB_URI, {
    useNewUrlParser: true
}, ()=>{
    console.log("Connected to DB.");
})

// Server

app.listen(5000);
console.log("Server running on Port 5000");
