import playwright from 'playwright';
import WebSocket from 'ws';
import { keywords } from './keywords.js';


export const scrapeLinkedIn = async (ws, filters) => {
    const launchOptions = {
        headless: false,
    }
    const browser = await playwright['chromium'].launch(launchOptions);
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.goto("https://www.indeed.com");

    await page.waitForTimeout(getRandomTimeMilliseconds(2000, 5000))
    // Enter search term into the 'what' field
    await page.fill('#text-input-what', filters.searchTerm);

    // Enter location into the 'where' field
    await page.fill('#text-input-where', filters.where);

    // Execute the search
    await page.press('#text-input-what', 'Enter');

    if (filters.remote.enabled) {
        // Click on the remote filter
        await page.waitForSelector(filters.remote.selector);
        await page.click(filters.remote.selector);
    }

    let continueScraping = true;

    ws.on('message',  (message) => {
        console.log(`message: ${message}`);
        if (message === 'STOP') {
            console.log('message is stop');
            continueScraping = false;
        }
    })

    // Loop through all the pages of results
    while (true) {
        if (!continueScraping) {
            break;
        }
        // Wait for job cards to load and then grab them
        const jobCards =  await page.waitForSelector('.jobCard_mainContent').then(() => page.$$('.jobCard_mainContent'));

        for (const jobCard of jobCards) {
            const jobTitleAnchorTag = await jobCard.$('a');

            // Get the job title text
            let title = await jobTitleAnchorTag.$('span').then((element) => element.textContent());
            console.log(`Getting title: ${title}`);

            // Grab company name from the job card
            const company = await getCompanyName(jobCard);

            // Grab company location from the job card
            const location = await getCompanyLocation(jobCard);

            // Click on the job title to activate the card
            await waitRandomBeforeClick(jobTitleAnchorTag);

            const jobDetails = await page.waitForSelector('.jobsearch-RightPane');

            const salary = getSalaryFromDescription(jobDetails);

            await page.waitForTimeout(getRandomTimeMilliseconds(2000, 5000));

            // Wait for the job description to load
            await page.waitForSelector('#jobDescriptionText');

            // Grab the job description element
            const descriptionElement = await page.$('#jobDescriptionText');

            // Get the job description text
            const description = await getJobDescription();

            const foundKeywords =  getKeywords(description);

            // Send the job to the client
            if (ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify({ title, description, salary, company, foundKeywords, location }));
            }
        }

        //  Button to go to the next page
        const nextButton = await page.$('a[data-testid="pagination-page-next"]');

        if (nextButton) {
            // We aren't at the end of the results, so click the next button
            await nextButton.click();
            // Dodge Cloudflare
            await page.waitForTimeout(getRandomTimeMilliseconds(2000, 5000));
        } else {
            break;
        }
    }
    await browser.close();
}

async function getJobDescription(page) {
    return await page.$('#jobDescriptionText').then((descriptionElement) => descriptionElement.textContent())
        .then((description) => console.log(`Getting description: ${description}`));
}

async function getSalaryFromDescription(description) {
    // Attempt to find salary
    return await description.$$('#salaryInfoAndJobType>span').then(async (elements) => {
        for (const element of elements) {
            const text = await element.textContent();
            if (text.startsWith('$')) {
                return text;
            }
        }
        return 'Not listed.'
    }).then((salary) => console.log(`Getting salary: ${salary}`));
}

function getKeywords(description) {
    // Turn description lowercase, split words into an array, and then filter out
    // any words that aren't in the keywords array
    console.log('Searching job description for keywords...');
    return Array.from(new Set(description.toLowerCase().split(' ').filter((word) => keywords.includes(word))));
}

async function getCompanyLocation(jobCard) {
    return await jobCard.$('.companyLocation').then((locationElement) => locationElement.textContent())
        .then((location) => console.log(`Getting location: ${location}`))
}

async function getCompanyName(jobCard){
    return await jobCard.$('.companyName').then((companyElement) => companyElement.textContent())
        .then((companyName) => console.log(`Getting company name: ${companyName}`))
}

// Please, Cloudflare, this is definitely not a bot
async function waitRandomBeforeClick(selector) {
    setTimeout(async () => {
        await selector.click();
    }, getRandomTimeMilliseconds(2000, 3000))
}

function getRandomTimeMilliseconds(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}




