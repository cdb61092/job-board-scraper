"use strict";
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
exports.configureScraper = void 0;
const playwright_1 = __importDefault(require("playwright"));
const configureScraper = ({ headless, browserMode }) => __awaiter(void 0, void 0, void 0, function* () {
    const launchOptions = {
        headless: headless,
    };
    const browser = yield playwright_1.default[browserMode || 'chromium'].launch(launchOptions);
    const context = yield browser.newContext();
    const page = yield context.newPage();
    // Look like a real person
    yield page.setExtraHTTPHeaders({
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9'
    });
    return [page, browser];
});
exports.configureScraper = configureScraper;