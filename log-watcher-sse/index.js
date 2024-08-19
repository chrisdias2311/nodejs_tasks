const express = require('express');
const path = require('path');
const Watcher = require('./Watcher'); // Assuming Watcher is a custom module

const app = express();
const PORT = 5000;
const LOG_FILE = 'test.log';

// Create a new instance of the Watcher class
const watcher = new Watcher(LOG_FILE);

// Start the watcher
watcher.start();

// Serve the index.html file
app.get('/log', (req, res, next) => {
    console.log("Request received for /log");

    const options = {
        root: path.join(__dirname)
    };

    const fileName = 'index.html';
    res.sendFile(fileName, options, (err) => {
        if (err) {
            console.error("Error sending file:", err);
            next(err);
        } else {
            console.log('Sent:', fileName);
        }
    });
});

// SSE endpoint
app.get('/events', (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    // res.setHeader('Cache-Control', 'no-cache');
    // res.setHeader('Connection', 'keep-alive');

    // Send initial logs
    const data = watcher.getLogs();
    res.write(`data: ${JSON.stringify(data)}\n\n`);      //\n\n This sequence tells the client that the message is complete and can be processed.

    // Send updates
    watcher.on("logs-updated", (data) => {
        res.write(`data: ${JSON.stringify(data)}\n\n`);
    });

    // Handle client disconnect
    req.on('close', () => {
        console.log('Client disconnected');
    });
});

// Start the HTTP server
app.listen(PORT, () => {
    console.log(`Listening on http://localhost:${PORT}`);
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error("Unhandled error:", err);
    res.status(500).send('Internal Server Error');
});