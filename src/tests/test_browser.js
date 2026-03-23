import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();

  page.on('console', msg => {
    console.log(`PAGE LOG [${msg.type()}]:`, msg.text());
  });

  page.on('pageerror', error => {
    console.log('PAGE ERROR:', error.message);
  });

  console.log("Navigating to http://localhost:5173...");
  
  try {
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle0', timeout: 15000 });
    console.log("Page loaded successfully.");
    
    // Wait an extra 3 seconds just to let the failsafe or fetch resolve
    await new Promise(r => setTimeout(r, 3000));
    
    // Evaluate the DOM to count elements
    const counts = await page.evaluate(() => {
        const h2s = Array.from(document.querySelectorAll('h2')).map(h => h.innerText);
        const articles = document.querySelectorAll('article').length;
        const cards = document.querySelectorAll('.group.cursor-pointer').length; // specific to News component
        return { h2s, articles, cards };
    });
    
    console.log("DOM Snapshot counts:", JSON.stringify(counts, null, 2));

  } catch (err) {
    console.log("Navigation error:", err.message);
  } finally {
    await browser.close();
  }
})();
