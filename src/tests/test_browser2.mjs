import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();

  console.log("Navigating to http://localhost:5173...");
  
  try {
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle0', timeout: 15000 });
    await new Promise(r => setTimeout(r, 4000));
    
    const titles = await page.evaluate(() => {
        const cards = document.querySelectorAll('.group.cursor-pointer');
        return Array.from(cards).map(card => {
            const h3 = card.querySelector('h3');
            return h3 ? h3.innerText : 'NO H3';
        });
    });
    
    console.log("Card titles:", JSON.stringify(titles, null, 2));
  } catch (err) {
    console.log("Navigation error:", err.message);
  } finally {
    await browser.close();
  }
})();
