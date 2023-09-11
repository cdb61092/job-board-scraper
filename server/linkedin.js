import playwright from 'playwright';
import WebSocket from 'ws';

export const scrapeLinkedIn = async (wss, filters) => {
    const launchOptions = {
        headless: false,
    }
    const browser = await playwright['chromium'].launch(launchOptions);
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.goto("https://www.indeed.com");

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
            console.log(`Getting title: ${title}`);

            // Click on the job title to activate the card
            await waitRandomBeforeClick(jobTitleAnchorTag);

            const jobDetails = await page.waitForSelector('.jobsearch-RightPane');

            // Attempt to find salary
            const salary = await jobDetails.$$('#salaryInfoAndJobType>span').then(async (elements) => {
                for (const element of elements) {
                    const text = await element.textContent();
                    if (text.startsWith('$')) {
                        return text;
                    }
                }
                return 'Not listed.'
            })
            console.log(`Getting salary: ${salary}`);

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
                    client.send(JSON.stringify({ title, description, salary }));
                }
            })
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




