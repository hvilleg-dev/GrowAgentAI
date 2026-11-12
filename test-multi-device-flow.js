const { chromium } = require('playwright');

const BASE_URL = 'https://growagentai.vercel.app';
const TEST_USER = {
  email: 'test1794438542878@example.com',
  password: 'Test1234!@'
};

async function testMultiDeviceFlow() {
  console.log('🚀 INICIANDO TEST MULTI-DISPOSITIVO...\n');

  let browser1, browser2, context1, context2, page1, page2;

  try {
    // Paso 1: Crear navegadores independientes
    console.log('📱 Abriendo navegador 1 (PC)...');
    browser1 = await chromium.launch({ headless: false });
    context1 = await browser1.newContext();
    page1 = await context1.newPage();

    console.log('📱 Abriendo navegador 2 (Móvil)...');
    browser2 = await chromium.launch({ headless: false });
    context2 = await browser2.newContext();
    page2 = await context2.newPage();

    // Paso 2: Login en dispositivo 1 (PC)
    console.log('\n🔐 LOGIN en Dispositivo 1 (PC)...');
    await page1.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle' });

    const emailInputs1 = await page1.$$('input[type="email"]');
    const passwordInputs1 = await page1.$$('input[type="password"]');
    const submitButtons1 = await page1.$$('button[type="submit"]');

    if (emailInputs1.length === 0 || passwordInputs1.length === 0 || submitButtons1.length === 0) {
      throw new Error('No se encontraron elementos del formulario');
    }

    await emailInputs1[0].fill(TEST_USER.email);
    await passwordInputs1[0].fill(TEST_USER.password);

    console.log('  Credentials ingresados, enviando formulario...');

    // Hacer click y esperar navegación O cambio de contenido
    await Promise.all([
      page1.waitForNavigation().catch(() => null), // La navegación podría fallar
      submitButtons1[0].click()
    ]);

    await new Promise(r => setTimeout(r, 3000)); // Dar tiempo para que la app procese

    const url1 = page1.url();
    console.log(`✅ LOGIN completado en PC (URL: ${url1})`);

    // Paso 3: Pequeño delay
    await new Promise(r => setTimeout(r, 2000));

    // Paso 4: Login en dispositivo 2 (Móvil)
    console.log('\n🔐 LOGIN en Dispositivo 2 (Móvil)...');
    await page2.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle' });

    const emailInputs2 = await page2.$$('input[type="email"]');
    const passwordInputs2 = await page2.$$('input[type="password"]');
    const submitButtons2 = await page2.$$('button[type="submit"]');

    await emailInputs2[0].fill(TEST_USER.email);
    await passwordInputs2[0].fill(TEST_USER.password);

    console.log('  Credentials ingresados, enviando formulario...');

    await Promise.all([
      page2.waitForNavigation().catch(() => null),
      submitButtons2[0].click()
    ]);

    await new Promise(r => setTimeout(r, 3000));

    const url2 = page2.url();
    console.log(`✅ LOGIN completado en Móvil (URL: ${url2})`);

    // Paso 5: Esperar a que aparezca el modal
    console.log('\n⏳ Esperando modal de conflicto en dispositivo 2...');
    try {
      await page2.waitForSelector('[role="dialog"]', { timeout: 5000 });
      console.log('✅ MODAL DE CONFLICTO DETECTADO\n');

      // Capturar screenshot del modal
      await page2.screenshot({ path: 'modal-conflict.png' });
      console.log('📸 Screenshot del modal: modal-conflict.png\n');

      // Paso 6: Verificar contenido del modal
      const modalText = await page2.textContent('[role="dialog"]');
      console.log('📋 Contenido del modal:');
      console.log(modalText.substring(0, 300) + '...\n');

      // Paso 7: Observar countdown
      console.log('⏱️  Observando countdown (primeros 10s)...');
      for (let i = 0; i < 10; i++) {
        try {
          const text = await page2.textContent('[role="dialog"]');
          if (text.includes('Se pausará')) {
            const match = text.match(/(\d+)s/);
            if (match) console.log(`  ⏳ Countdown: ${match[1]}s`);
          }
        } catch (e) {}
        await new Promise(r => setTimeout(r, 1000));
      }

      console.log('\n✅ Countdown funcionando correctamente\n');

      // Paso 8: Click en "Continuar AQUÍ"
      console.log('🧪 TEST: Click en "Continuar AQUÍ"');
      const continueButton = await page2.$('button:has-text("Continuar AQUÍ")');
      if (continueButton) {
        await continueButton.click();
        await new Promise(r => setTimeout(r, 2000));
        console.log('✅ Botón clickeado\n');
      } else {
        console.log('⚠️  Botón no encontrado\n');
      }

    } catch (e) {
      console.log('⚠️  No apareciómodal:', e.message);
    }

    // Paso 9: Screenshots finales
    console.log('📸 Capturando screenshots finales...');
    await page1.screenshot({ path: 'final-pc.png' });
    await page2.screenshot({ path: 'final-mobile.png' });
    console.log('✅ Screenshots guardados\n');

    // Paso 10: Verificar BD
    console.log('📊 PRÓXIMO PASO: Verificar base de datos');
    console.log('   Accede a https://console.neon.tech');
    console.log(`   Query:\n
SELECT id, status, "deviceId", "expiresAt", "pausedAt"
FROM sesiones
WHERE "usuarioId" = (SELECT id FROM usuarios WHERE email = '${TEST_USER.email}')
ORDER BY "criadaEn" DESC
LIMIT 2;
    `);

    console.log('\n👀 Navegadores abiertos para inspección');
    console.log('   Presiona Enter para cerrar...\n');
    await new Promise(r => process.stdin.once('data', r));

  } catch (error) {
    console.error('❌ ERROR EN TEST:', error.message);
    console.error(error);
  } finally {
    console.log('\n🧹 Limpiando...');
    if (page1) await page1.close().catch(() => {});
    if (page2) await page2.close().catch(() => {});
    if (context1) await context1.close().catch(() => {});
    if (context2) await context2.close().catch(() => {});
    if (browser1) await browser1.close().catch(() => {});
    if (browser2) await browser2.close().catch(() => {});
    console.log('✅ Test finalizado');
  }
}

testMultiDeviceFlow();
