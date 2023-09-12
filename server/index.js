import express from 'express';
import cors from 'cors';
import * as http from 'http';

import { WebSocketServer } from 'ws';
import { scrapeLinkedIn } from './linkedin.js';

const app = express();
app.use(cors());
app.use(express.json()); // Parse incoming JSON payloads
const server = http.createServer(app);
export const wss = new WebSocketServer({ server });

const clients = [];

wss.on('connection', (ws) => {
    clients.push(ws);
    console.log('client connected!');
    ws.on('message', (message) => {
        console.log(`received message ${message}`);
    });

    ws.on('close', () => {
        // Remove the client from the array when the connection is closed
        const index = clients.indexOf(ws);
        if (index > -1) {
            clients.splice(index, 1);
        }
    });
});

app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.post('/scrape', (req, res) => {
    const filters = req.body;

    // Retrieve a connected WebSocket client (e.g., the first one)
    const ws = clients[0];

    if (ws) {
        scrapeLinkedIn(ws, filters);
        res.send('scraping initiated');
    } else {
        res.status(400).send('No connected WebSocket clients');
    }
});

const port = 8080;  // Make sure to define the port
server.listen(port, () => console.log(`Server listening on port ${port}`));  // Changed from app.listen to server.listen




