const express = require('express');
const app = express();
const http = require('http');
const path = require('path');

const { Server } = require("socket.io");


const server = http.createServer(app);

app.use(express.static(path.resolve('./public')));

const io = new Server(server);

// Use io i.e. socket.io instance to listen to socket connections
io.on('connection', (client) => {               // whenever the connection is established the callback function is called in which the client object is passed
    console.log('A user has connneted', client.id);
    client.on('message', (msg) => {
        console.log('message: ' + msg);
        io.emit('message', msg);
    }   
    );
    client.on('disconnect', () => {
        console.log('user disconnected');
    });
});


// use app i.e. express instance to serve HTTP requests
app.get('/', (req, res) => {  
    res.sendFile('/public/index.html');
});

server.listen(5000, () => {
    console.log('Server is running on port 5000');
});