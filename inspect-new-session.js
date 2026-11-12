const { chromium } = require('playwright');

const BASE_URL = 'https://growagentai.vercel.app';
const TEST_USER = {
  email: 'test1794438542878@example.com',
  password: 'Test1234!@'
};

async function inspectNewSession() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  try {
    // Login
    console.log('🔐 Haciendo login...');
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle' });
    await page.fill('input[type="email"]', TEST_USER.email);
    await page.fill('input[type="password"]', TEST_USER.password);
    await page.click('button[type="submit"]');
    await new Promise(r => setTimeout(r, 3000));

    // Ir a Chat
    console.log('💬 Abriendo Chat...');
    const chatLink = await page.$('a:has-text("Chat")') || await page.$('button:has-text("Chat")');
    if (chatLink) {
      await chatLink.click();
      await new Promise(r => setTimeout(r, 2000));
    }

    // Inspeccionar botones
    console.log('\n📋 TODOS LOS BOTONES EN LA PÁGINA:\n');
    const allButtons = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('button')).map((btn, i) => ({
        index: i,
        text: btn.textContent.trim().substring(0, 100),
        class: btn.className,
        disabled: btn.disabled,
        type: btn.type,
        id: btn.id,
        ariaLabel: btn.getAttribute('aria-label'),
        html: btn.outerHTML.substring(0, 200)
      }));
    });

    allButtons.forEach(btn => {
      console.log(`Button ${btn.index}:`);
      console.log(`  Text: "${btn.text}"`);
      console.log(`  Disabled: ${btn.disabled}`);
      console.log(`  Class: ${btn.class}`);
      console.log(`  Type: ${btn.type}`);
      console.log(`  ID: ${btn.id}`);
      console.log(`  Aria-Label: ${btn.ariaLabel}`);
      console.log('');
    });

    // Buscar específicamente "new session"
    console.log('\n🔍 BUSCANDO "new session":\n');
    const newSessionBtn = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const found = buttons.find(btn => btn.textContent.toLowerCase().includes('new session'));
      if (found) {
        return {
          found: true,
          text: found.textContent,
          disabled: found.disabled,
          class: found.className,
          html: found.outerHTML.substring(0, 500)
        };
      }
      return { found: false };
    });

    if (newSessionBtn.found) {
      console.log('✅ Botón encontrado:');
      console.log(JSON.stringify(newSessionBtn, null, 2));
    } else {
      console.log('❌ Botón "new session" NO encontrado');
      console.log('\nBuscando variantes...');
      const variants = await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        return buttons
          .filter(btn =>
            btn.textContent.toLowerCase().includes('session') ||
            btn.textContent.toLowerCase().includes('create') ||
            btn.textContent.toLowerCase().includes('new')
          )
          .map(btn => ({
            text: btn.textContent.trim(),
            disabled: btn.disabled
          }));
      });

      console.log('\nBotones relacionados encontrados:');
      variants.forEach(v => console.log(`  - "${v.text}" (disabled: ${v.disabled})`));
    }

    // Screenshot
    await page.screenshot({ path: 'inspect-chat-page.png' });
    console.log('\n📸 Screenshot: inspect-chat-page.png');

    console.log('\n👀 Presiona Enter para cerrar...');
    await new Promise(r => process.stdin.once('data', r));

  } finally {
    await browser.close();
  }
}

inspectNewSession();
