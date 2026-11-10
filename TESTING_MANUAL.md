# Manual Testing Guide - GrowAgentAI

## Setup Previo
1. Backend corriendo en `http://localhost:3000`
2. Frontend en `http://localhost:5173`
3. Usuario de prueba:
   - Email: `test@example.com`
   - Password: `password123`

---

## TEST 1: Sesión Lifecycle (45 min timer)

### 1.1 Crear Nueva Sesión
1. Login con usuario de prueba
2. Ir a **Chat** tab
3. Click "➕ Nueva Sesión"
4. Verifica:
   - ✅ Sesión aparece en sidebar izquierda
   - ✅ Punto verde (🟢) indica sesión ACTIVE
   - ✅ Timer en header muestra "45:00"
   - ✅ Timer en verde (color ACTIVE)

### 1.2 Inactivity Pause (10 minutos)
1. En la sesión abierta, **no hagas nada** por 10 minutos
2. Verifica después de 10 min:
   - ✅ Punto en sidebar cambia a amarillo (🟡) PAUSED
   - ✅ Timer cambia color a amarillo
   - ✅ Timer se congela (no cuenta hacia abajo)
   - ✅ Input de chat muestra: "⏸ Session paused due to inactivity"
   - ✅ Send button está deshabilitado (gris)

### 1.3 Resume on Activity
1. Mientras está paused, **escribe en el chat** o **click** en input
2. Verifica:
   - ✅ Toast notification: "Session resumed"
   - ✅ Punto vuelve a verde (🟢)
   - ✅ Timer vuelve a contar hacia abajo
   - ✅ Input activo nuevamente, Send button habilitado

### 1.4 Warning Notification (2 min antes de cierre)
1. Espera a que falten **2 minutos** para expiración (43:00 → 2:00)
2. Verifica:
   - ✅ Toast warning: "Session ending in 2:00"
   - ✅ Timer sigue contando en color rojo
   - ✅ Punto en sidebar sigue verde

### 1.5 Session Auto-Close (45:00 → 0:00)
1. Espera hasta que timer llegue a **0:00**
2. Verifica:
   - ✅ Punto en sidebar cambia a rojo (🔴) CLOSED
   - ✅ Timer en header muestra "Closed" en rojo
   - ✅ Input área muestra: "🔴 Session has ended. Create a new session to continue."
   - ✅ Send button deshabilitado
   - ✅ Sesión no se puede escribir

### 1.6 Multiple Sessions
1. Crea 2 nuevas sesiones
2. Verifica:
   - ✅ Solo la más reciente tiene punto verde (🟢)
   - ✅ Las anteriores tienen punto gris (anterior session) o rojo (closed)
   - ✅ Puedes cambiar entre sesiones
   - ✅ Cada sesión mantiene su propio timer

---

## TEST 2: Internacionalización (EN/ES)

### 2.1 Cambiar a Español
1. Ir a **Settings** → **Preferences** → **Language**
2. Seleccionar **Español**
3. Verifica que TODO cambie:

**Menu lateral debe mostrar:**
- ✅ 💬 Chat → 💬 Chat (EN) / 💬 Chat (ES)
- ✅ 🎯 Goals → 🎯 Metas
- ✅ ⚙️ Settings → ⚙️ Configuración
- ✅ 📖 Instructions → 📖 Instrucciones

**Goals page debe mostrar:**
- ✅ "Tus Metas" en lugar de "Your Goals"
- ✅ Estados: "No iniciado", "En Progreso", "Completado"
- ✅ "Sin metas aún" si no hay metas
- ✅ "Selecciona una meta para ver detalles"

**Instructions page debe mostrar:**
- ✅ Coaching styles en español:
  - Supportivo — Empático y alentador
  - Directivo — Directo, orientado a la acción y enfocado en resultados
  - Socrático — Preguntas profundas para guiar el autodescubrimiento
  - Colaborativo — Asociación, explorando juntos

**Chat page debe mostrar:**
- ✅ Todo el texto en español
- ✅ Placeholder de input en español
- ✅ Botones en español

### 2.2 Cambiar de vuelta a Inglés
1. Settings → Language → English
2. Verifica que TODO vuelva al inglés

---

## TEST 3: Two-Factor Authentication (2FA)

### 3.1 Habilitar 2FA
1. Ir a **Settings** → **Privacy & Security** → **Two-Factor Authentication**
2. Click "Add an extra layer of security"
3. Verifica:
   - ✅ Modal muestra QR code
   - ✅ Puedes escanear con Google Authenticator, Authy, Microsoft Authenticator
   - ✅ Se genera código secreto

### 3.2 Login CON 2FA Habilitado
1. **Logout** (ir a Settings y desconectarse)
2. Intenta **Login** con credenciales correctas
3. Verifica:
   - ✅ Después de email/password, aparece modal: "Two-Factor Authentication"
   - ✅ Pide 6-digit code
   - ✅ Input acepta solo números, máximo 6

4. Ingresa código de tu app authenticator
5. Verifica:
   - ✅ Si código correcto: login exitoso, redirige a home
   - ✅ Si código incorrecto: muestra error rojo "Invalid code"
   - ✅ Botón "Verify" se activa cuando ingresas 6 dígitos

### 3.3 2FA Edge Cases
- Test código con letras: ✅ Se ignoran, solo números
- Test código < 6 dígitos: ✅ Botón "Verify" deshabilitado
- Test código > 6 dígitos: ✅ Se limita a 6
- Test presionar Enter: ✅ Envía si son 6 dígitos
- Test Cancel: ✅ Vuelve a login

### 3.4 Disable 2FA
1. Settings → Two-Factor Authentication
2. Click "Disable 2FA"
3. Logout y login nuevamente
4. Verifica:
   - ✅ NO pide código 2FA
   - ✅ Login exitoso directamente

---

## TEST 4: Dark Mode Compatibility

### 4.1 Cambiar a Dark Mode
1. Settings → Preferences → Theme → Dark
2. Verifica en TODOS los elementos:
   - ✅ Chat: texto legible, timer visible
   - ✅ Goals: estados de sesión visibles (🟢🟡🔴)
   - ✅ Toast notifications: visible en esquina superior derecha
   - ✅ Modals (2FA, Goal details): legibles
   - ✅ Sidebar: contraste adecuado

### 4.2 Cambiar a Light Mode
1. Settings → Theme → Light
2. Verifica todos los elementos nuevamente

---

## TEST 5: Toast Notifications

### 5.1 Toast Pause
1. Crear sesión
2. Esperar 10 min sin actividad
3. Verifica:
   - ✅ Toast aparece en esquina superior derecha
   - ✅ Contiene mensajes claros
   - ✅ Desaparece automáticamente después de 5 seg

### 5.2 Toast Warning
1. En sesión activa, espera a 2 min antes de cierre
2. Verifica:
   - ✅ Toast amarillo/naranja aparece
   - ✅ Muestra tiempo restante
   - ✅ Auto-desaparece

### 5.3 Toast Resume
1. Desde sesión paused, escribe algo
2. Verifica:
   - ✅ Toast verde: "Session resumed"
   - ✅ Aparece y desaparece

---

## TEST 6: Profile Completion Banner

### 6.1 Incomplete Profile
1. Logout
2. Crear nuevo usuario sin llenar Profile
3. Ir a Chat
4. Verifica:
   - ✅ Banner amarillo arriba: "Complete Your Profile"
   - ✅ Muestra campos faltantes
   - ✅ Botón "Nueva Sesión" deshabilitado
   - ✅ Input de chat deshabilitado
   - ✅ Botón send deshabilitado

### 6.2 Complete Profile
1. Ir a Settings → Coaching Profile
2. Llenar todos los campos requeridos
3. Verifica:
   - ✅ Banner desaparece
   - ✅ Botón "Nueva Sesión" se habilita
   - ✅ Input de chat se habilita

---

## TEST 7: Responsive Design

### 7.1 Desktop (1920x1080)
- ✅ Timer visible en header
- ✅ Sidebar sin scroll
- ✅ Dots (🟢🟡🔴) claramente visibles

### 7.2 Tablet (768x1024)
- ✅ Layout se adapta
- ✅ Sidebar colapsable (si implementado)
- ✅ Timer aún legible

### 7.3 Mobile (375x667)
- ✅ Sidebar colapsable o en drawer
- ✅ Timer en header escalable
- ✅ Input de chat funcional
- ✅ Toasts no cubren contenido crítico

---

## TEST 8: Error Scenarios

### 8.1 Backend Desconectado
1. Detener backend
2. Intentar operación (crear sesión, enviar mensaje)
3. Verifica:
   - ✅ Error message amigable
   - ✅ No crash de app
   - ✅ Opción de reintentar

### 8.2 Red Lenta
1. Abrir DevTools → Network → Throttle a "Slow 3G"
2. Crear sesión, enviar mensaje
3. Verifica:
   - ✅ Loading states visibles
   - ✅ Spinners en botones
   - ✅ No se puede clickear múltiples veces

---

## CHECKLIST FINAL

- [ ] Session timer 45 min funciona correctamente
- [ ] Auto-pausa después de 10 min sin actividad
- [ ] Auto-resume al escribir/click
- [ ] Warning a 2 min antes de cierre
- [ ] Auto-cierre a 0:00
- [ ] Traducción EN/ES completa
- [ ] 2FA login flow funciona
- [ ] 2FA modal validación correcta
- [ ] Toast notifications aparecen/desaparecen
- [ ] Dark mode legible
- [ ] Profile banner bloquea acciones cuando incompleto
- [ ] Responsive en desktop/tablet/mobile
- [ ] Errores manejados gracefully

---

## REPORTE DE BUGS

Si encuentras un bug durante testing, reporta:

1. **Descripción**: ¿Qué ocurrió?
2. **Steps to reproduce**: Pasos exactos para reproducir
3. **Expected**: ¿Qué debería pasar?
4. **Actual**: ¿Qué pasó en lugar?
5. **Screenshots**: Si es aplicable
6. **Environment**: OS, Browser, Dark/Light mode

---

## ENVIRONMENT VARIABLES (Si necesitas testear algo específico)

Backend (.env):
```
SESSION_DURATION_MINUTES=45
INACTIVITY_THRESHOLD_MINUTES=10
WARNING_TIME_MINUTES=2
```

Frontend (.env):
```
VITE_API_URL=http://localhost:3000
```
