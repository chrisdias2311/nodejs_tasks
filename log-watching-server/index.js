const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const path = require('path');
const Watcher = require('./watcher');

//app.use(express.static(path.join(__dirname, '/index.html')))



let watcher = new Watcher("test.log");      // A new instance of the Watcher class is created, initialized with the log file test.log.

watcher.start();       //The start method is called on the watcher instance, which likely begins the process of monitoring the log file for changes.


// to serve the index.html file
app.get('/log', (req, res) => {
    console.log("request received");
    var options = {
        root: path.join(__dirname)
    };

    var fileName = 'index.html';
    res.sendFile(fileName, options, function (err) {
        if (err) {
            next(err);
        } else {
            console.log('Sent:', fileName);
        }
    });
})


io.on('connection', function (socket) {
    // console.log(socket);
    console.log("new connection established:" + socket.id);

    watcher.on("logs-updated", function process(data) {
        socket.emit("update-log", data);
    });
    let data = watcher.getLogs();
    socket.emit("init", data);
});

http.listen(3000, function () {
    console.log('listening on localhost:3000');
});