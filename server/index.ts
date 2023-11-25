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

    wss.on('connection', (ws) => {
        console.log('client connected!');

        setInterval(() => {
            ws.send('hello')
        }, 5000)

        ws.on('message', (message) => {
            console.log(`received message ${message}`);
        });

    });

    console.log('hiaas');



    app.post('/scrape', async (req, res) => {
        console.log('in scrape');
        const filters = req.body;
        console.log(filters);
        await scrapeIndeed(filters, wss);
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
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    });

process.on('exit', async () => {
    await prisma.$disconnect();
});





