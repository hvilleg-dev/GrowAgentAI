const { chromium } = require('playwright');

const BASE_URL = 'https://growagentai.vercel.app';

async function debugLogin() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  try {
    console.log('Navegando a login...');
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle' });

    // Ver qué campos están disponibles
    console.log('\n📋 Elementos en la página:');
    const inputs = await page.$$('input');
    for (let i = 0; i < inputs.length; i++) {
      const type = await inputs[i].getAttribute('type');
      const name = await inputs[i].getAttribute('name');
      const id = await inputs[i].getAttribute('id');
      console.log(`  Input ${i}: type=${type}, name=${name}, id=${id}`);
    }

    const buttons = await page.$$('button');
    console.log(`\nBotones encontrados: ${buttons.length}`);
    for (let i = 0; i < buttons.length; i++) {
      const text = await buttons[i].textContent();
      const type = await buttons[i].getAttribute('type');
      console.log(`  Button ${i}: "${text.trim()}" (type=${type})`);
    }

    // Intentar llenar el formulario
    console.log('\nIntentando llenar formulario...');
    const emailInputs = await page.$$('input[type="email"]');
    if (emailInputs.length > 0) {
      await emailInputs[0].fill('test@example.com');
      console.log('✅ Email ingresado');
    } else {
      console.log('❌ No encontré input de email');
    }

    const passwordInputs = await page.$$('input[type="password"]');
    if (passwordInputs.length > 0) {
      await passwordInputs[0].fill('Test1234!@');
      console.log('✅ Password ingresado');
    } else {
      console.log('❌ No encontré input de password');
    }

    // Screenshot
    await page.screenshot({ path: 'debug-login.png' });
    console.log('\n📸 Screenshot guardado: debug-login.png');

    console.log('\n⏳ Presiona Enter para continuar...');
    await new Promise(r => process.stdin.once('data', r));

  } finally {
    await browser.close();
  }
}

debugLogin();
