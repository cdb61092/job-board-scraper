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
Object.defineProperty(exports, "__esModule", { value: true });
exports.scrapeIndeed = void 0;
const keywords_1 = require("./keywords");
const playwright_1 = require("./playwright");
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const scrapeIndeed = (filters) => __awaiter(void 0, void 0, void 0, function* () {
    const [page, browser] = yield (0, playwright_1.configureScraper)({ headless: false });
    yield page.goto("https://www.indeed.com");
    yield page.waitForTimeout(getRandomTimeMilliseconds(2000, 5000));
    // Enter search term into the 'what' field
    yield page.fill('#text-input-what', filters.searchTerm);
    // Enter location into the 'where' field
    yield page.fill('#text-input-where', filters.where);
    // Execute the search
    yield page.press('#text-input-what', 'Enter');
    if (filters.remote.enabled) {
        // Click on the remote filter
        yield page.waitForSelector(filters.remote.selector);
        yield page.click(filters.remote.selector);
    }
    // Loop through all the pages of results
    while (true) {
        // Wait for job cards to load and then grab them
        const jobCards = yield page.waitForSelector('.jobCard_mainContent').then(() => page.$$('.jobCard_mainContent'));
        for (const jobCard of jobCards) {
            const title = yield getJobTitle(jobCard);
            // Grab company name from the job card
            const company = yield getCompanyName(jobCard);
            // Grab company location from the job card
            const location = yield getCompanyLocation(jobCard);
            // Grab the salary from the job description
            const salary = yield getSalaryFromDescription(page);
            yield page.waitForTimeout(getRandomTimeMilliseconds(2000, 5000));
            // Get the job description text
            const description = yield getJobDescription(page);
            console.log(description);
            const foundKeywords = getKeywords(description);
            const job = { title, description, salary, company, foundKeywords, location };
            yield prisma.job.create({
                data: {
                    title: job.title,
                    description: job.description,
                    salary: job.salary,
                    company: job.company,
                    location: job.location,
                    keywords: job.foundKeywords,
                    source: client_1.Source.Indeed,
                }
            }).catch((error) => console.error(error));
        }
        //  Button to go to the next page
        const nextButton = yield page.$('a[data-testid="pagination-page-next"]');
        if (nextButton) {
            // We aren't at the end of the results, so click the next button
            yield nextButton.click();
            // Dodge Cloudflare
            yield page.waitForTimeout(getRandomTimeMilliseconds(2000, 5000));
        }
        else {
            break;
        }
    }
    yield browser.close();
});
exports.scrapeIndeed = scrapeIndeed;
function getJobTitle(element) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        const jobTitleAnchorTag = yield element.$('a');
        let title = '';
        // Get the job title text
        if (jobTitleAnchorTag) {
            const jobTitleSpanElement = yield jobTitleAnchorTag.$('span');
            if (jobTitleSpanElement) {
                title = (_a = yield jobTitleSpanElement.textContent()) !== null && _a !== void 0 ? _a : 'Not found';
            }
            yield jobTitleAnchorTag.click();
        }
        return title;
    });
}
// Gets the job description text from the right-side job pane that appears when clicking a job card
function getJobDescription(page) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield page.waitForSelector('#jobDescriptionText')
            .then((descriptionElement) => descriptionElement.textContent())
            .then((text) => text !== null && text !== void 0 ? text : 'Not found');
    });
}
function getSalaryFromDescription(page) {
    return __awaiter(this, void 0, void 0, function* () {
        const jobDetails = yield page.waitForSelector('.jobsearch-RightPane');
        // Attempt to find salary
        return yield jobDetails.$$('#salaryInfoAndJobType>span').then((elements) => __awaiter(this, void 0, void 0, function* () {
            for (const element of elements) {
                const text = yield element.textContent();
                if (text === null || text === void 0 ? void 0 : text.startsWith('$')) {
                    return text;
                }
            }
            return 'Not listed.';
        }));
    });
}
function getKeywords(description) {
    // Turn description lowercase, split words into an array, and then filter out
    // any words that aren't in the keywords array
    return Array.from(new Set(description.toLowerCase().split(' ').filter((word) => keywords_1.keywords.includes(word))));
}
function getCompanyLocation(jobCard) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        let companyLocation = '';
        const companyLocationElement = yield jobCard.$('.companyLocation');
        if (companyLocationElement) {
            return (_a = yield companyLocationElement.textContent()) !== null && _a !== void 0 ? _a : 'Not found';
        }
        return companyLocation;
    });
}
function getCompanyName(jobCard) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        const companyNameElement = yield jobCard.$('.companyName');
        if (companyNameElement) {
            return (_a = yield companyNameElement.textContent()) !== null && _a !== void 0 ? _a : 'Not found';
        }
        return 'Not found';
    });
}
function getRandomTimeMilliseconds(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
