const fs = require('fs');
const EventEmitter = require('events');

const TRAILING_LINES = 10; // Define the number of trailing lines to keep

class Watcher extends EventEmitter {
    constructor(file) {
        super();
        this.watchFile = file;
        this.store = [];
    }

    getLogs() {
        return this.store;
    }

    watch(curr, prev) {
        console.log("Watching file for changes");
        const watcher = this;

        fs.open(this.watchFile, 'r', (err, fd) => {
            if (err) {
                console.error("Error opening file:", err);
                return;
            }

            const buffer = Buffer.alloc(1024);
            fs.read(fd, buffer, 0, buffer.length, prev.size, (err, bytesRead) => {
                if (err) {
                    console.error("Error reading file:", err);
                    fs.close(fd, () => {});
                    return;
                }

                if (bytesRead > 0) {
                    const data = buffer.slice(0, bytesRead).toString();
                    const logs = data.split("\n").filter(line => line.trim() !== "");

                    logs.forEach((log) => {
                        this.store.push(log);
                        if (this.store.length > TRAILING_LINES) {
                            this.store = this.store.slice(-TRAILING_LINES);
                        }
                    });

                    watcher.emit("logs-updated", logs);
                }

                fs.close(fd, () => {});
            });
        });
    }

    start() {
        console.log("Starting to watch file:", this.watchFile);
        const watcher = this;

        fs.open(this.watchFile, 'r', (err, fd) => {
            if (err) {
                console.error("Error opening file:", err);
                return;
            }

            const buffer = Buffer.alloc(1024);
            fs.read(fd, buffer, 0, buffer.length, 0, (err, bytesRead) => {
                if (err) {
                    console.error("Error reading file:", err);
                    fs.close(fd, () => {});
                    return;
                }

                if (bytesRead > 0) {
                    const data = buffer.slice(0, bytesRead).toString();
                    const logs = data.split("\n").filter(line => line.trim() !== "");
                    this.store = logs.slice(-TRAILING_LINES);
                }

                fs.close(fd, () => {});
            });

            fs.watchFile(this.watchFile, { interval: 1000 }, (curr, prev) => {
                watcher.watch(curr, prev);
            });
        });
    }
}

module.exports = Watcher;