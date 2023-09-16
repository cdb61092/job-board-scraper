import { keywords } from './keywords';
import { configureScraper } from "./playwright";
import { prisma } from './index';
import WebSocket from 'ws';
import {ElementHandle, Page } from "playwright";
import { Source } from '@prisma/client';

interface Filters {
    searchTerm: string;
    where: string;
    remote: {
        enabled: boolean;
        selector: string;
    }
}

export const scrapeLinkedIn = async (ws: WebSocket, filters: Filters) => {
   const [page, browser] = await configureScraper({ headless: false });

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
            const title = await getJobTitle(jobCard);

            // Grab company name from the job card
            const company = await getCompanyName(jobCard);

            // Grab company location from the job card
            const location = await getCompanyLocation(jobCard);

            // Grab the salary from the job description
            const salary = await getSalaryFromDescription(page);

            await page.waitForTimeout(getRandomTimeMilliseconds(2000, 5000));

            // Get the job description text
            const description = await getJobDescription(page);

            const foundKeywords = getKeywords(description);

            // Send the job to the client
            if (ws.readyState === WebSocket.OPEN) {
                const job = { title, description, salary, company, foundKeywords, location };
                console.log(job);
                ws.send(JSON.stringify(job));
                prisma.job.create({
                    data: {
                        title: job.title,
                        description: job.description,
                        salary: job.salary,
                        company: job.company,
                        location: job.location,
                        keywords: job.foundKeywords,
                        source: Source.Indeed,
                    }
                })

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

async function getJobTitle(element: ElementHandle)
{
    const jobTitleAnchorTag = await element.$('a');
    let title = '';
    // Get the job title text
    if (jobTitleAnchorTag) {
        const jobTitleSpanElement = await jobTitleAnchorTag.$('span');
        if (jobTitleSpanElement) {
            title = await jobTitleSpanElement.textContent() ?? 'Not found';
        }
        await jobTitleAnchorTag.click();
    }

    return title;
}

// Gets the job description text from the right-side job pane that appears when clicking a job card
async function getJobDescription(page: Page) {
    return await page.waitForSelector('#jobDescriptionText')
        .then((descriptionElement) => descriptionElement.textContent())
        .then((text) => text ?? 'Not found');}

async function getSalaryFromDescription(page: Page) {
    const jobDetails = await page.waitForSelector('.jobsearch-RightPane');
    // Attempt to find salary
    return await jobDetails.$$('#salaryInfoAndJobType>span').then(async (elements) => {
        for (const element of elements) {
            const text = await element.textContent();
            if (text?.startsWith('$')) {
                return text;
            }
        }
        return 'Not listed.'
    });
}

function getKeywords(description: string) {
    // Turn description lowercase, split words into an array, and then filter out
    // any words that aren't in the keywords array
    return Array.from(new Set(description.toLowerCase().split(' ').filter((word) => keywords.includes(word))));
}

async function getCompanyLocation(jobCard: ElementHandle) {
    let companyLocation = '';
    const companyLocationElement = await jobCard.$('.companyLocation');
    if (companyLocationElement) {
        return await companyLocationElement.textContent() ?? 'Not found'
    }
    return companyLocation;
}

async function getCompanyName(jobCard : ElementHandle){
    const companyNameElement = await jobCard.$('.companyName');
    if (companyNameElement) {
        return await companyNameElement.textContent() ?? 'Not found';
    }
    return 'Not found';
}

function getRandomTimeMilliseconds(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}




