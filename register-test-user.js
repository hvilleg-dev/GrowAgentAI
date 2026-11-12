const { chromium } = require('playwright');

const BASE_URL = 'https://growagentai.vercel.app';
const TEST_USER = {
  email: `test${Date.now()}@example.com`,
  password: 'Test1234!@'
};

async function registerTestUser() {
  console.log('🚀 Registrando usuario de prueba...\n');
  console.log(`Email: ${TEST_USER.email}`);
  console.log(`Password: ${TEST_USER.password}\n`);

  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  try {
    // Ir a register
    await page.goto(`${BASE_URL}/register`, { waitUntil: 'networkidle' });
    console.log('📄 Página de registro cargada');

    // Llenar formulario
    const inputs = await page.$$('input');
    if (inputs.length < 4) {
      throw new Error(`No se encontraron suficientes inputs (encontrados: ${inputs.length})`);
    }

    const fullName = `TestUser${Date.now()}`;
    await inputs[0].fill(fullName); // Full Name
    console.log(`✅ Full Name ingresado: ${fullName}`);

    await inputs[1].fill(TEST_USER.email); // Email
    console.log('✅ Email ingresado');

    await inputs[2].fill(TEST_USER.password); // Password
    console.log('✅ Password ingresado');

    await inputs[3].fill(TEST_USER.password); // Confirm password
    console.log('✅ Password confirmado');

    // Buscar y clickear botón submit
    const buttons = await page.$$('button[type="submit"]');
    if (buttons.length === 0) {
      throw new Error('No se encontró botón submit');
    }

    console.log('\n📤 Enviando formulario...');
    await Promise.all([
      page.waitForNavigation().catch(() => null),
      buttons[0].click()
    ]);

    await new Promise(r => setTimeout(r, 3000));

    const finalUrl = page.url();
    console.log(`\n✅ Formulario enviado`);
    console.log(`   URL final: ${finalUrl}`);

    // Screenshot
    await page.screenshot({ path: 'register-result.png' });
    console.log('📸 Screenshot: register-result.png');

    // Guardar credenciales para usar después
    console.log('\n💾 Credenciales para usar en test:\n');
    console.log(`const TEST_USER = {
  email: '${TEST_USER.email}',
  password: '${TEST_USER.password}'
};`);

    console.log('\n⏳ Presiona Enter para cerrar...');
    await new Promise(r => process.stdin.once('data', r));

  } catch (error) {
    console.error('❌ ERROR:', error.message);
  } finally {
    await browser.close();
  }
}

registerTestUser();
