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

    // Look like a real person
    await page.setExtraHTTPHeaders({
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9'
    });

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

    // Loop through all the pages of results
    while (true) {
        // Wait for job cards to load and then grab them
        const jobCards =  await page.waitForSelector('.jobCard_mainContent').then(() => page.$$('.jobCard_mainContent'));

        for (const jobCard of jobCards) {
            const jobTitleAnchorTag = await jobCard.$('a');

            // Get the job title text
            let title = await jobTitleAnchorTag.$('span').then((element) => element.textContent());
            // console.log(`Getting title: ${title}`);

            // Grab company name from the job card
            const company = await getCompanyName(jobCard);

            // Grab company location from the job card
            const location = await getCompanyLocation(jobCard);

            // Click on the job title to activate the card
            await waitRandomBeforeClick(jobTitleAnchorTag);

            const salary = await getSalaryFromDescription(page);

            await page.waitForTimeout(getRandomTimeMilliseconds(2000, 5000));

            // Wait for the job description to load
            await page.waitForSelector('#jobDescriptionText');

            // Get the job description text
            const description = await getJobDescription(page);

            // console.log(`description: ${description}`);

            const foundKeywords= getKeywords(description);

            // Send the job to the client
            if (ws.readyState === WebSocket.OPEN) {
                const job = { title, description, salary, company, foundKeywords, location };
                console.log(job);
                ws.send(JSON.stringify(job));
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

// Gets the job description text from the right-side job pane that appears when clicking a job card
async function getJobDescription(page) {
    return await page.waitForSelector('#jobDescriptionText').then((descriptionElement) => descriptionElement.textContent());
}

async function getSalaryFromDescription(page) {
    const jobDetails = await page.waitForSelector('.jobsearch-RightPane');
    // Attempt to find salary
    return await jobDetails.$$('#salaryInfoAndJobType>span').then(async (elements) => {
        for (const element of elements) {
            const text = await element.textContent();
            if (text.startsWith('$')) {
                return text;
            }
        }
        return 'Not listed.'
    });
}

function getKeywords(description) {
    // Turn description lowercase, split words into an array, and then filter out
    // any words that aren't in the keywords array
    return Array.from(new Set(description.toLowerCase().split(' ').filter((word) => keywords.includes(word))));
}

async function getCompanyLocation(jobCard) {
    return await jobCard.$('.companyLocation').then((locationElement) => locationElement.textContent());
}

async function getCompanyName(jobCard){
    return await jobCard.$('.companyName').then((companyElement) => companyElement.textContent());
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




