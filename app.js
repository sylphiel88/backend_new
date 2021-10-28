// Packages

const express = require('express');
const app = express();
require('dotenv').config();
const mongoose = require('mongoose');
const cors = require('cors');
const User = require('./models/user.model')


app.use(express.json());
app.use(cors());


        // Routes

        const menuR = require('./routes/menu.route');
        const userR = require('./routes/user.routes');
        const classesR = require('./routes/classes.routes')
        app.use('/api/v1/menu', menuR);
        app.use('/api/v1/user', userR);
        app.use('/api/v1/class', classesR);

        // DB Connect

        mongoose.connect(process.env.DB_URI, {
            dbName: 'kantine',
            useNewUrlParser: true,
            useUnifiedTopology: true
        }, err => err ? console.log(err) : console.log('Connected to database'));

        var watchMongodb = function () {
            const io = require('socket.io')
            var socket = io()
            const changeStream = User.watch();
            changeStream.on('change', next => {
                socket.emit("dbchange")
            });
        };

        mongoose.connection.on('connected', () => {
            console.log('Connected to mongo instance');
            watchMongodb();
        });

        // Server

        app.listen(5000);
        console.log("Server running on Port 5000");
