const { chromium } = require('playwright');

const BASE_URL = 'https://growagentai.vercel.app';
const TEST_USER = {
  email: 'test1794438542878@example.com',
  password: 'Test1234!@'
};

async function debugSettings() {
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

    // Ir a Settings
    console.log('⚙️ Abriendo Settings...');

    // Buscar link/botón a Settings
    const settingsElements = await page.evaluate(() => {
      const elements = [];
      document.querySelectorAll('a, button').forEach(el => {
        if (el.textContent.toLowerCase().includes('setting') ||
            el.textContent.toLowerCase().includes('configur') ||
            el.textContent.toLowerCase().includes('perfil')) {
          elements.push({
            tag: el.tagName,
            text: el.textContent.trim(),
            href: el.href,
            onclick: el.onclick?.toString()
          });
        }
      });
      return elements;
    });

    console.log('\nElementos Settings encontrados:');
    console.log(JSON.stringify(settingsElements, null, 2));

    // Clickear el primero que sea Settings
    const settingsLink = await page.$('a:has-text("Settings")') ||
                        await page.$('a:has-text("settings")') ||
                        await page.$('button:has-text("Settings")') ||
                        await page.$('button:has-text("settings")') ||
                        await page.$('a:has-text("Configuración")');

    if (settingsLink) {
      await settingsLink.click();
      await new Promise(r => setTimeout(r, 2000));
    }

    // Screenshot
    await page.screenshot({ path: 'settings-page.png' });
    console.log('\n📸 Screenshot: settings-page.png');

    // Inspeccionar formulario
    console.log('\n📋 Elementos del formulario:');
    const formElements = await page.evaluate(() => {
      const result = {
        inputs: [],
        selects: [],
        buttons: [],
        labels: []
      };

      // Inputs
      document.querySelectorAll('input').forEach((inp, i) => {
        result.inputs.push({
          index: i,
          type: inp.type,
          name: inp.name,
          id: inp.id,
          placeholder: inp.placeholder,
          value: inp.value,
          disabled: inp.disabled
        });
      });

      // Selects
      document.querySelectorAll('select').forEach((sel, i) => {
        result.selects.push({
          index: i,
          name: sel.name,
          id: sel.id,
          value: sel.value,
          disabled: sel.disabled,
          options: Array.from(sel.options).map(o => ({ text: o.text, value: o.value }))
        });
      });

      // Buttons
      document.querySelectorAll('button').forEach((btn, i) => {
        result.buttons.push({
          index: i,
          text: btn.textContent.trim(),
          type: btn.type,
          disabled: btn.disabled
        });
      });

      // Labels
      document.querySelectorAll('label').forEach((lbl, i) => {
        result.labels.push({
          index: i,
          text: lbl.textContent.trim(),
          htmlFor: lbl.htmlFor
        });
      });

      return result;
    });

    console.log(JSON.stringify(formElements, null, 2));

    console.log('\n👀 Navegador abierto. Inspecciona manualmente.');
    console.log('Presiona Enter para cerrar...');
    await new Promise(r => process.stdin.once('data', r));

  } finally {
    await browser.close();
  }
}

debugSettings();
