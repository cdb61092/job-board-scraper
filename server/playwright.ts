import playwright, { Browser, Page } from 'playwright';

type BrowserMode = 'chromium' | 'firefox' | 'webkit';

interface Options {
    headless: boolean;
    browserMode?: BrowserMode;
}

export const configureScraper = async ({ headless, browserMode }: Options): Promise<[Page, Browser]> => {
    const launchOptions = {
        headless: headless,
    }
    const browser = await playwright[browserMode || 'chromium'].launch(launchOptions);
    const context = await browser.newContext();
    const page = await context.newPage();

    // Look like a real person
    await page.setExtraHTTPHeaders({
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9'
    });

    return [page, browser];
}