const express = require('express');
const { exec } = require('child_process');
const path = require('path');

const app = express();
const port = 3000;

// Utility function to execute shell commands
function runCommand(command) {
    return new Promise((resolve, reject) => {
        exec(command, (error, stdout, stderr) => {
            if (error) {
                reject(stderr);
            } else {
                resolve(stdout.trim());
            }
        });
    });
}

// Start browser with a specific URL
app.get('/start', async (req, res) => {
    const { browser, url } = req.query;

    try {
        let command;
        if (browser === 'chrome') {
            command = `start chrome "${url}"`;
        } else if (browser === 'firefox') {
            command = `start firefox "${url}"`;
        } else {
            return res.status(400).send('Unsupported browser');
        }

        await runCommand(command);
        res.send(`Started ${browser} with URL ${url}`);
    } catch (error) {
        res.status(500).send(error);
    }
});

// Stop browser
app.get('/stop', async (req, res) => {
    const { browser } = req.query;

    try {
        let command;
        if (browser === 'chrome') {
            command = 'taskkill /F /IM chrome.exe';
        } else if (browser === 'firefox') {
            command = 'taskkill /F /IM firefox.exe';
        } else {
            return res.status(400).send('Unsupported browser');
        }

        await runCommand(command);
        res.send(`Stopped ${browser}`);
    } catch (error) {
        res.status(500).send(error);
    }
});

// Cleanup browser session
app.get('/cleanup', async (req, res) => {
    const { browser } = req.query;

    try {
        let command;
        if (browser === 'chrome') {
            command = `rmdir /s /q "%LOCALAPPDATA%\\Google\\Chrome\\User Data"`;
        } else if (browser === 'firefox') {
            command = `rmdir /s /q "%APPDATA%\\Mozilla\\Firefox\\Profiles"`;
        } else {
            return res.status(400).send('Unsupported browser');
        }

        await runCommand(command);
        res.send(`Cleaned up ${browser}`);
    } catch (error) {
        res.status(500).send(error);
    }
});

// Get the current active tab's URL (placeholder implementation)
app.get('/geturl', async (req, res) => {
    const { browser } = req.query;

    try {
        let command;
        let browserSuffix;

        if (browser === 'chrome') {
            command = `powershell -command "Get-Process chrome | Select-Object MainWindowTitle"`;
            browserSuffix = "Google Chrome";
        } else if (browser === 'firefox') {
            command = `powershell -command "Get-Process firefox | Select-Object MainWindowTitle"`;
            browserSuffix = "Mozilla Firefox";
        } else {
            return res.status(400).send('Unsupported browser');
        }

        const output = await runCommand(command);
        const titleLines = output.split('\n');
        let activeTabTitle = titleLines[titleLines.length - 1].trim();

        // Remove the browser suffix from the title
        if (activeTabTitle.endsWith(browserSuffix)) {
            activeTabTitle = activeTabTitle.substring(0, activeTabTitle.length - browserSuffix.length);
        }

        res.send(`Current active tab in ${browserSuffix}: ${activeTabTitle}`);
    } catch (error) {
        res.status(500).send(error);
    }
});


// Start the server
app.listen(port, () => {
    console.log(`Web service listening at http://localhost:${port}`);
});
