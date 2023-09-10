import playwright from 'playwright';
import {wss} from "./index.js";
import WebSocket from 'ws';

export const scrapeLinkedIn = async (wss, filters) => {
    const launchOptions = {
        headless: false,
    }
    const browser = await playwright['chromium'].launch(launchOptions)
    const context = await browser.newContext()
    const page = await context.newPage()
    await page.goto("https://www.indeed.com")
    await page.waitForSelector('#text-input-what');
    await page.fill('#text-input-what', filters.searchTerm);
    await page.fill('#text-input-where', filters.where);

    // Search jobs
    await page.press('#text-input-what', 'Enter');

    if (filters.remote.enabled) {
        console.log('waiting for remote selector...');
        // Click on the remote filter
        await page.waitForSelector(filters.remote.selector);
        await page.click(filters.remote.selector);
    }

    while (true) {
        // Wait for job cards to load and then grab them
        const jobCards =  await page.waitForSelector('.jobCard_mainContent').then(() => page.$$('.jobCard_mainContent'));

        console.log(`jobCards: ${jobCards}`)

        for (const jobCard of jobCards) {
            // Get the job title anchor so we can click on it to produce the description
            const jobTitleAnchorTag = await jobCard.$('a');

            // Click on the job title to activate the card
            await waitRandomBeforeClick(jobTitleAnchorTag);

            // Get the job title text
            let title = await jobTitleAnchorTag.$('span').then((element) => element.textContent());
            console.log(`Getting title: ${title}`);

            await page.waitForTimeout(getRandomTimeMilliseconds(2000, 5000));

            // Wait for the job description to load
            await page.waitForSelector('#jobDescriptionText');

            // Grab the job description element
            const descriptionElement = await page.$('#jobDescriptionText');

            // Get the job description text
            const description = await descriptionElement.textContent();
            console.log(`Getting description: ${description}`);

            wss.clients.forEach((client) => {
                if (client.readyState === WebSocket.OPEN) {
                    // Send the job to the client
                    client.send(JSON.stringify({ title, description }));
                }
            })
        }

        const nextButton = await page.$('a[data-testid="pagination-page-next"]');

        if (nextButton) {
            await nextButton.click();
            // Dodge Cloudflare
            await page.waitForTimeout(getRandomTimeMilliseconds(2000, 5000));
        } else {
            break;
        }
    }
    await browser.close();

    // Please, Cloudflare, this is definitely not a bot
    async function waitRandomBeforeClick(selector) {
        setTimeout(async () => {
            await selector.click();
        }, getRandomTimeMilliseconds(2000, 3000))
    }

    function getRandomTimeMilliseconds(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
}




