import express from 'express';
import cors from 'cors';
import playwright from 'playwright';
import * as http from 'http';

import WebSocket, { WebSocketServer } from 'ws';
import { scrapeLinkedIn } from './linkedin.js';

const app = express();
app.use(cors());
app.use(express.json()); // Parse incoming JSON payloads
const server = http.createServer(app);
export const wss = new WebSocketServer({ server });

wss.on('connection', (ws) => {
    console.log('client connected!');
    ws.on('message', (message) => {
        console.log(`received message ${message}`);
    });
    // ws.send('Websocket initialized');
});

app.get('/', (req, res) => {

    res.send('Hello World!');
});

app.post('/scrape', ({ body: { filters } }, res) => {
    scrapeLinkedIn(wss, filters);
    res.send('scraping initiated');
});

const port = 8080;  // Make sure to define the port
server.listen(port, () => console.log(`Server listening on port ${port}`));  // Changed from app.listen to server.listen




