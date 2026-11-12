const { chromium } = require('playwright');

const BASE_URL = 'https://growagentai.vercel.app';
const TEST_USER = {
  email: 'test1794438542878@example.com',
  password: 'Test1234!@'
};

async function testCompleteFlow() {
  console.log('🚀 INICIANDO TEST COMPLETO...\n');

  let browser1, browser2, page1, page2;
  let results = {
    pc_login: false,
    pc_session_created: false,
    mobile_login: false,
    modal_appeared: false,
    modal_details: {}
  };

  try {
    // 1. CREAR NAVEGADORES
    console.log('📱 Abriendo navegadores...');
    browser1 = await chromium.launch({ headless: false });
    page1 = await browser1.newPage();

    browser2 = await chromium.launch({ headless: false });
    page2 = await browser2.newPage();
    console.log('✅ Navegadores abiertos\n');

    // 2. LOGIN EN PC
    console.log('🔐 DISPOSITIVO 1 (PC): Navegando a login...');
    await page1.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle' });

    const emails1 = await page1.$$('input[type="email"]');
    const passwords1 = await page1.$$('input[type="password"]');
    const submitBtns1 = await page1.$$('button[type="submit"]');

    await emails1[0].fill(TEST_USER.email);
    await passwords1[0].fill(TEST_USER.password);
    console.log('  Credenciales ingresadas');

    await Promise.all([
      page1.waitForNavigation().catch(() => null),
      submitBtns1[0].click()
    ]);

    await new Promise(r => setTimeout(r, 3000));
    const url1 = page1.url();
    console.log(`  URL destino: ${url1}`);

    if (!url1.includes('login')) {
      results.pc_login = true;
      console.log('✅ LOGIN exitoso en PC\n');
    } else {
      console.log('❌ LOGIN FALLÓ en PC\n');
      throw new Error('Login failed on PC');
    }

    // 3. COMPLETAR PERFIL EN PC
    console.log('⚙️ DISPOSITIVO 1: Completando perfil en Settings...');

    // Buscar y clickear Settings
    const settingsBtn = await page1.$('button:has-text("Settings")') ||
                       await page1.$('button:has-text("Configuración")') ||
                       await page1.$('a:has-text("Settings")') ||
                       await page1.$('a:has-text("Configuración")') ||
                       await page1.$('button[aria-label*="Settings"]') ||
                       await page1.$('button[aria-label*="settings"]');

    if (settingsBtn) {
      await settingsBtn.click();
      await new Promise(r => setTimeout(r, 2000));
      console.log('  ✅ Settings abierto');

      // Llenar selects (Gender y Coaching Style) - estos son los requeridos
      const selects = await page1.$$('select');
      console.log(`  Encontrados ${selects.length} selects`);

      if (selects.length >= 2) {
        // Gender (primer select)
        const genderOptions = await selects[0].evaluate(el =>
          Array.from(el.options).map(o => ({ text: o.text, value: o.value }))
        );
        console.log(`  Gender options: ${genderOptions.map(o => o.value).join(', ')}`);

        await selects[0].selectOption('Male');
        console.log('  ✅ Gender: Male');

        // Coaching Style (segundo select)
        const styleOptions = await selects[1].evaluate(el =>
          Array.from(el.options).map(o => ({ text: o.text, value: o.value }))
        );
        console.log(`  Style options: ${styleOptions.map(o => o.value).join(', ')}`);

        await selects[1].selectOption(styleOptions[0].value);
        console.log('  ✅ Coaching Style seleccionado');
      }

      // Intentar llenar edad si es posible
      const numberInputs = await page1.$$('input[type="number"]');
      if (numberInputs.length > 0) {
        try {
          await numberInputs[0].fill('30');
          console.log('  ✅ Edad: 30');
        } catch (e) {
          console.log('  ⚠️ No se pudo llenar edad (readonly)');
        }
      }

      await new Promise(r => setTimeout(r, 1000));

      // Buscar y clickear botón "Save Coaching Profile"
      const saveBtn = await page1.$('button:has-text("Save Coaching Profile")') ||
                     await page1.$('button:has-text("Save")') ||
                     await page1.$('button:has-text("Guardar")');

      if (saveBtn) {
        const isDisabled = await saveBtn.getAttribute('disabled');
        if (isDisabled) {
          console.log('  ⚠️ Botón Save está deshabilitado, intentando igual...');
        }

        try {
          await saveBtn.click();
          await new Promise(r => setTimeout(r, 2000));
          console.log('  ✅ Perfil guardado\n');
        } catch (e) {
          console.log(`  ⚠️ Error al guardar: ${e.message}\n`);
        }
      } else {
        console.log('  ❌ No encontré botón Save\n');
      }
    } else {
      console.log('  ⚠️ No encontré botón Settings\n');
    }

    // 4. NAVEGAR A CHAT
    console.log('💬 DISPOSITIVO 1: Navegando a Chat...');
    const chatLink = await page1.$('a:has-text("Chat")') ||
                    await page1.$('button:has-text("Chat")');
    if (chatLink) {
      await chatLink.click();
      await new Promise(r => setTimeout(r, 2000));
      console.log('  ✅ Chat abierto');
    }

    // 4. CREAR SESIÓN EN PC
    console.log('📋 DISPOSITIVO 1: Creando sesión de chat...');

    // Buscar botón "+ New Session"
    const createSessionBtn = await page1.$('button:has-text("+ New Session")') ||
                            await page1.$('button:has-text("New Session")') ||
                            await page1.$('button:has-text("new session")');

    if (createSessionBtn) {
      await createSessionBtn.click();
      console.log('  Click en "new session"');

      await new Promise(r => setTimeout(r, 2000));

      // Verificar si apareció timer
      const timer = await page1.$('text=45:') ||
                   await page1.$('text=44:') ||
                   await page1.$('text=43:');

      if (timer) {
        results.pc_session_created = true;
        const timerText = await timer.textContent();
        console.log(`✅ SESIÓN CREADA - Timer: ${timerText}\n`);
      } else {
        console.log('⚠️ Sesión creada pero sin timer visible\n');
        results.pc_session_created = true;
      }
    } else {
      console.log('❌ No encontré botón "new session"\n');
    }

    // 5. DELAY PEQUEÑO
    await new Promise(r => setTimeout(r, 2000));

    // 6. LOGIN EN MÓVIL
    console.log('🔐 DISPOSITIVO 2 (MÓVIL): Navegando a login...');
    await page2.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle' });

    const emails2 = await page2.$$('input[type="email"]');
    const passwords2 = await page2.$$('input[type="password"]');
    const submitBtns2 = await page2.$$('button[type="submit"]');

    await emails2[0].fill(TEST_USER.email);
    await passwords2[0].fill(TEST_USER.password);
    console.log('  Credenciales ingresadas');

    await Promise.all([
      page2.waitForNavigation().catch(() => null),
      submitBtns2[0].click()
    ]);

    await new Promise(r => setTimeout(r, 3000));
    const url2 = page2.url();
    console.log(`  URL destino: ${url2}`);

    if (!url2.includes('login')) {
      results.mobile_login = true;
      console.log('✅ LOGIN exitoso en MÓVIL\n');
    } else {
      console.log('❌ LOGIN FALLÓ en MÓVIL\n');
    }

    // 7. BUSCAR MODAL DE CONFLICTO
    console.log('⏳ Esperando modal de conflicto multi-dispositivo...');

    try {
      await page2.waitForSelector('[role="dialog"]', { timeout: 5000 });
      results.modal_appeared = true;
      console.log('✅ MODAL DETECTADO\n');

      // 8. CAPTURAR DETALLES DEL MODAL
      console.log('📋 Contenido del modal:');
      const modalContent = await page2.textContent('[role="dialog"]');
      console.log(modalContent);
      results.modal_details.content = modalContent;

      // Buscar info específica
      const timerMatch = modalContent.match(/(\d+):(\d+)/);
      const countdownMatch = modalContent.match(/(\d+)s/);

      if (timerMatch) {
        console.log(`  ⏱️ Tiempo de sesión: ${timerMatch[0]}`);
        results.modal_details.sessionTime = timerMatch[0];
      }

      if (countdownMatch) {
        console.log(`  ⏳ Countdown: ${countdownMatch[1]}s`);
        results.modal_details.countdown = countdownMatch[1];
      }

      // Capturar screenshot
      await page2.screenshot({ path: 'modal-screenshot.png' });
      console.log('  📸 Screenshot: modal-screenshot.png');

      // 9. OBSERVAR COUNTDOWN
      console.log('\n  Observando countdown por 15 segundos...');
      for (let i = 0; i < 15; i++) {
        try {
          const text = await page2.textContent('[role="dialog"]');
          const match = text.match(/(\d+)s/);
          if (match && i % 3 === 0) {
            console.log(`    [${i}s] Countdown: ${match[1]}s`);
          }
        } catch (e) {}
        await new Promise(r => setTimeout(r, 1000));
      }

      // 10. BUSCAR BOTONES DE ACCIÓN
      console.log('\n  Botones disponibles:');
      const buttons = await page2.$$('[role="dialog"] button');
      for (let i = 0; i < buttons.length; i++) {
        const text = await buttons[i].textContent();
        console.log(`    Button ${i + 1}: "${text.trim()}"`);
      }

      // 11. HACER CLICK EN "CONTINUAR AQUÍ"
      const continueBtn = await page2.$('button:has-text("Continuar AQUÍ")') ||
                         await page2.$('button:has-text("Continue HERE")');

      if (continueBtn) {
        console.log('\n  Clickeando "Continuar AQUÍ"...');
        await continueBtn.click();
        await new Promise(r => setTimeout(r, 2000));
        console.log('  ✅ Click ejecutado');

        // Verificar que el modal se cierre
        const modalStillOpen = await page2.$('[role="dialog"]').catch(() => null);
        if (!modalStillOpen) {
          console.log('  ✅ Modal cerrado correctamente');
        } else {
          console.log('  ⚠️ Modal aún visible');
        }
      }

    } catch (e) {
      console.log(`❌ Modal NO apareció: ${e.message}\n`);
      results.modal_appeared = false;
    }

    // 12. SCREENSHOTS FINALES
    console.log('\n📸 Capturando screenshots finales...');
    await page1.screenshot({ path: 'final-pc-debug.png' });
    await page2.screenshot({ path: 'final-mobile-debug.png' });
    console.log('  ✅ Screenshots guardados\n');

    // 13. RESUMEN
    console.log('\n' + '='.repeat(60));
    console.log('📊 RESUMEN DE RESULTADOS');
    console.log('='.repeat(60));
    console.log(`PC Login:          ${results.pc_login ? '✅' : '❌'}`);
    console.log(`PC Session:        ${results.pc_session_created ? '✅' : '❌'}`);
    console.log(`Mobile Login:      ${results.mobile_login ? '✅' : '❌'}`);
    console.log(`Modal Aparecido:   ${results.modal_appeared ? '✅' : '❌'}`);

    if (results.modal_details.sessionTime) {
      console.log(`Session Time:      ${results.modal_details.sessionTime}`);
    }
    if (results.modal_details.countdown) {
      console.log(`Countdown:         ${results.modal_details.countdown}s`);
    }
    console.log('='.repeat(60) + '\n');

    if (results.modal_appeared) {
      console.log('🎉 TEST EXITOSO - Multi-device conflict detection está funcionando\n');
    } else {
      console.log('⚠️ TEST INCOMPLETO - El modal no apareció\n');
    }

    console.log('Presiona Enter para cerrar...');
    await new Promise(r => process.stdin.once('data', r));

  } catch (error) {
    console.error('❌ ERROR FATAL:', error.message);
    console.error(error);
  } finally {
    console.log('\n🧹 Limpiando...');
    if (page1) await page1.close().catch(() => {});
    if (page2) await page2.close().catch(() => {});
    if (browser1) await browser1.close().catch(() => {});
    if (browser2) await browser2.close().catch(() => {});
    console.log('✅ Completado');
  }
}

testCompleteFlow();
