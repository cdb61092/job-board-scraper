import express from 'express';
import cors from 'cors';
import * as http from 'http';
import { PrismaClient } from '@prisma/client';
import { WebSocket, WebSocketServer } from 'ws';
import { scrapeIndeed } from './indeed';

export const prisma = new PrismaClient();

async function main() {
    const app = express();
    app.use(cors());
    app.use(express.json()); // Parse incoming JSON payloads
    const server = http.createServer(app);
    const wss = new WebSocketServer({ server });

    const clients: WebSocket[] = [];

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

    app.post('/scrape', (req, res) => {
        console.log('in scrape');
        const filters = req.body;
        scrapeIndeed(filters);
        res.send('scraping initiated');
    });

    app.get('/jobs', async (req, res) => {
        console.log('fetching jobs');
        const jobs = await prisma.job.findMany();
        res.json(jobs);
    });

    const port = 8080;
    server.listen(port, () => console.log(`Server listening on port ${port}`));
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })





