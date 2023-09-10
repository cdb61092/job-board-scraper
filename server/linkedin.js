import playwright from 'playwright';
import {wss} from "./index.js";
import WebSocket from 'ws';

export const scrapeLinkedIn = async (wss) => {
    console.log('scraping linkedin');

    const launchOptions = {
        headless: false,
    }
    const browser = await playwright['chromium'].launch(launchOptions)
    const context = await browser.newContext()
    const page = await context.newPage()
    await page.goto("https://www.indeed.com")
    await page.waitForSelector('#text-input-what');
    await page.fill('#text-input-what', 'Software Engineer');
    await page.press('#text-input-what', 'Enter');

    const jobs = [];

    while (true) {
        // Wait for the job titles to load
        await page.waitForSelector('.jobTitle');
        console.log('in loop');

        const jobTitles = await page.$$('.jobTitle');

        for (const jobTitle of jobTitles) {
            // Get the job title anchor so we can click on it to produce the description
            const anchor = await jobTitle.$('a');

            // Get the job title text
            let title = await anchor.innerText();


            await page.waitForTimeout(getRandomTimeMilliseconds());

            // Click on the job title
            await waitRandomBeforeClick(anchor);

            // Wait for the job description to load
            await page.waitForSelector('#jobDescriptionText');

            // Grab the job description element
            const descriptionElement = await page.$('#jobDescriptionText');

            // Get the job description text
            const description = await descriptionElement.textContent();

            jobs.push({ title, description });

            console.log(title);

            wss.clients.forEach((client) => {
                console.log(client)
                console.log(client.readyState)
                if (client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify({ title, description }));
                }
            })
        }

        const nextButton = await page.$('a[data-testid="pagination-page-next"]');

        if (nextButton) {
            await nextButton.click();

            // Wassup Cloudflare?
            await page.waitForTimeout(getRandomTimeMilliseconds());
        } else {
            break;
        }
    }
    console.log(jobs);
    await browser.close();

    // Please, Cloudflare, this is definitely not a bot
    async function waitRandomBeforeClick(selector) {
        await page.waitForTimeout(getRandomTimeMilliseconds());
        await selector.click();
    }

    function getRandomTimeMilliseconds() {
        return Math.floor(Math.random() * (5000 - 2000 + 1)) + 2000;
    }
}




