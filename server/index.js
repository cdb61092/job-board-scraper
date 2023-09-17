"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const http = __importStar(require("http"));
const client_1 = require("@prisma/client");
const ws_1 = require("ws");
const indeed_1 = require("./indeed");
exports.prisma = new client_1.PrismaClient();
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        const app = (0, express_1.default)();
        app.use((0, cors_1.default)());
        app.use(express_1.default.json()); // Parse incoming JSON payloads
        const server = http.createServer(app);
        const wss = new ws_1.WebSocketServer({ server });
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
        app.post('/scrape', (req, res) => {
            console.log('in scrape');
            const filters = req.body;
            (0, indeed_1.scrapeIndeed)(filters);
            res.send('scraping initiated');
        });
        app.get('/jobs', (req, res) => __awaiter(this, void 0, void 0, function* () {
            console.log('fetching jobs');
            const jobs = yield exports.prisma.job.findMany();
            res.json(jobs);
        }));
        const port = 8080;
        server.listen(port, () => console.log(`Server listening on port ${port}`));
    });
}
main()
    .then(() => __awaiter(void 0, void 0, void 0, function* () {
    yield exports.prisma.$disconnect();
}))
    .catch((e) => __awaiter(void 0, void 0, void 0, function* () {
    console.error(e);
    yield exports.prisma.$disconnect();
    process.exit(1);
}));
