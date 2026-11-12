# 🔍 ANÁLISIS - Lógica de Chat, Botones y Temporizador

## 📋 ARCHIVOS ANALIZADOS
- `ChatPage.tsx` - Página principal del chat
- `useSessionTimer.ts` - Hook del temporizador

---

## 🎯 RESUMEN EJECUTIVO

**El sistema está bien diseñado pero tiene CONDICIONES DE ACTIVACIÓN que deben cumplirse.**

---

## 1️⃣ BOTÓN "+ NEW SESSION" - Lógica de Habilitación

### Ubicación en el Código
**ChatPage.tsx línea 223-235** (desktop) y **línea 383-395** (mobile)

### Condiciones para que esté HABILITADO ✅
El botón está DESHABILITADO cuando ANY de esto es verdadero:
```javascript
disabled={
  isCreating ||                                              // 1. Ya se está creando
  (profileStatus && !profileStatus.isComplete) ||           // 2. Perfil INCOMPLETO
  !canCreateNewSession ||                                   // 3. Timer aún corriendo
  sessions.some(s => s.status === 'ACTIVE' || 
                     s.status === 'PAUSED' || 
                     !s.status)                              // 4. Ya hay sesión ACTIVE/PAUSED
}
```

### Desglose de Condiciones:

| # | Condición | Estado Actual | Solución |
|---|-----------|---------------|----------|
| 1 | `isCreating` | ❌ Mientras se crea | Esperar a que termine |
| 2 | `!profileStatus.isComplete` | ✅ DEBE estar completo | **Complete Age + Gender + Coaching Style** |
| 3 | `!canCreateNewSession` | ❌ Si timer corre | **Envíe primer mensaje para iniciar timer** |
| 4 | Sesión ACTIVE/PAUSED existe | ❌ Si existe | **Finalice sesión actual** |

### Estado por Pantalla:
```
DESKTOP (línea 225):  Mostrar botón si todas pasan
MOBILE  (línea 385):  Misma lógica
```

---

## 2️⃣ BOTÓN "SEND" - Lógica de Habilitación

### Ubicación en el Código
**ChatPage.tsx línea 481-489**

### Condiciones para que esté HABILITADO ✅
```javascript
disabled={
  !sessionId ||                                       // 1. NO hay sesión
  isChatLoading ||                                    // 2. Cargando chat
  !inputText.trim() ||                                // 3. Input vacío
  (profileStatus && !profileStatus.isComplete) ||     // 4. Perfil INCOMPLETO
  currentSession?.status === 'CLOSED'                 // 5. Sesión CERRADA
}
```

### Desglose:

| # | Condición | Cuándo se activa | Solución |
|---|-----------|------------------|----------|
| 1 | `!sessionId` | No hay sesión activa | Crear nueva sesión primero |
| 2 | `isChatLoading` | Esperando respuesta IA | Esperar |
| 3 | `!inputText.trim()` | Campo vacío | Escribir mensaje |
| 4 | Perfil incompleto | Missing Age/Gender/Style | Completar perfil |
| 5 | Status = CLOSED | Sesión terminada | Crear nueva sesión |

---

## 3️⃣ TEMPORIZADOR - Lógica Completa

### Tipo: Dual Timeout System

```
┌─────────────────────────────────────────────────────────┐
│ TIMER = MIN(duración, inactividad)                     │
│ • Duración:    45 minutos desde PRIMER mensaje          │
│ • Inactividad: 15 minutos sin enviar mensaje            │
│ • Quién expire primero = tiempo restante mostrado      │
└─────────────────────────────────────────────────────────┘
```

### Línea de Tiempo (useSessionTimer.ts línea 7-10):
```typescript
SESSION_DURATION = 45 min      // Max duración
INACTIVITY_TIMEOUT = 15 min    // Sin actividad
WARNING_TIME = 2 min           // Alerta antes de expirar
TIMER_INTERVAL = 100ms         // Actualización cada 100ms
```

### Estado del Timer - Cuándo Corre:

| Condición | Timer Corre | Estado |
|-----------|-------------|--------|
| Sesión creada (sin mensajes) | ❌ NO | `isTimerRunning = false` |
| **Primer mensaje enviado** | ✅ **SÍ** | `isTimerRunning = true` |
| Siguientes mensajes | ✅ SÍ | Se resetea `lastActivityAt` |
| 15 min sin mensajes | ❌ CUIDADO | Timer sigue contando |
| 45 min total | ❌ CIERRA | Status = 'CLOSED' |

### Visualización del Timer en Pantalla:
```javascript
// ChatPage.tsx línea 349-358
Si isTimerRunning = true:
  └─ Mostrar en VERDE: "45:00" → "00:00"
  
Si isTimerRunning = false pero currentSession existe:
  └─ Mostrar en AZUL: "45:00" (estático)
```

---

## 4️⃣ FLUJO COMPLETO DE UNA SESIÓN

```
1. USER ABRE CHAT
   └─ ¿Sesión existe?
      ├─ NO  → Mostrar "Crea una sesión"
      └─ SÍ  → Cargar sesión

2. USER CLICA "+ NEW SESSION"
   ├─ ¿Perfil completo?
   │  └─ NO  → Botón DESHABILITADO ❌
   ├─ ¿Hay sesión ACTIVE/PAUSED?
   │  └─ SÍ  → Botón DESHABILITADO ❌
   └─ ¿Timer corre?
      └─ SÍ  → Botón DESHABILITADO ❌

3. USER ESCRIBE PRIMER MENSAJE
   └─ handleSendMessage() (línea 110)
      ├─ startTimer()           ← INICIA TIMER AQUÍ
      ├─ updateActivity()
      └─ sendMessage()

4. TIMER CORRE 45 MIN
   ├─ Si sin mensaje > 15 min → CIERRA
   ├─ Si llegó a 45 min → CIERRA
   ├─ Si < 2 min restante → NOTIFICACIÓN
   └─ Status → 'CLOSED'

5. USER INTENTA ENVIAR DESPUÉS
   └─ Button SEND DESHABILITADO ❌
      (currentSession?.status === 'CLOSED')
```

---

## 5️⃣ VARIABLE CLAVE: `isTimerRunning`

### Dónde se set:
```
setIsTimerRunning(true)   → startTimer() [línea 95]
setIsTimerRunning(false)  → Duration/Inactivity timeout [línea 150, 166]
```

### Dónde se usa:
```
ChatPage:
  ├─ Mostrar timer (línea 349)
  ├─ Deshabilitar "+ New Session" (línea 225)
  └─ Determinar canCreateNewSession (línea 201)

Header:
  ├─ Si true → Timer en VERDE
  └─ Si false → Timer en AZUL (estático)
```

---

## 6️⃣ PROBLEMA IDENTIFICADO EN TESTING

### ❌ El Botón "+ New Session" Está DESHABILITADO Porque:

**Revisando las 4 condiciones:**

```javascript
1. isCreating:
   └─ ¿Falso? Sí → ✅ PASA

2. !profileStatus.isComplete:
   └─ ¿Incompleto? SÍ → ❌ FALLA AQUÍ
   └─ SOLUCIÓN: Completar Age + Gender + Coaching Style

3. !canCreateNewSession:
   └─ canCreateNewSession = !isTimerRunning (línea 201)
   └─ ¿Timer corriendo? Depende...
      Si NO HAS ENVIADO PRIMER MENSAJE:
         isTimerRunning = false → canCreateNewSession = true ✅
      Si YAS ENVIASTE MENSAJE:
         isTimerRunning = true → canCreateNewSession = false ❌

4. Sesión ACTIVE/PAUSED existe:
   └─ ¿Hay sesión creada? Sí → ❌ FALLA
   └─ SOLUCIÓN: No crear nueva si ya existe
```

### ⚠️ LA RAZÓN PROBABLE:
El botón está deshabilitado porque **`profileStatus.isComplete = false`**

---

## 7️⃣ CHECKLIST DE SOLUCIÓN

### Antes de Testear:

```
[ ] 1. Completar perfil en Settings:
        - Age: ✅
        - Gender: ✅
        - Coaching Style: ✅
        
[ ] 2. Verificar profileStatus.isComplete = true
        - ¿Botón "+ New Session" ahora está HABILITADO?
        
[ ] 3. Clickear "+ New Session"
        - Crea sesión con deviceId
        
[ ] 4. Escribir PRIMER mensaje
        - Timer se inicia (startTimer)
        - isTimerRunning = true
        - Timer muestra en VERDE: 45:00
        
[ ] 5. Esperar o escribir siguientes mensajes
        - updateActivity() se ejecuta
        - lastActivityAt se resetea
        
[ ] 6. Monitorear Timer:
        - ¿Decrementa cada segundo?
        - ¿Alerta en 2 minutos?
        - ¿Se cierra en 45 minutos?
```

---

## 8️⃣ LÓGICA DE MULTI-DISPOSITIVO (RELACIONADA)

### Cuándo Detectar Conflicto:
**En login de segundo dispositivo:**
- Backend: `/api/sessions/active-device/{userId}`
- Si `hasActiveSession = true` Y `deviceId !== currentDeviceId`
  - ✅ Modal aparece
  
### El Timer NO se ve en el Modal porque:
- Modal data viene del backend: `timeRemainingSeconds`
- Calcula en base a: `expiresAt - now`
- El Modal muestra este tiempo (43:25)
- El Countdown (30s) es independiente

---

## 📊 DIAGRAMA DE ESTADOS

```
┌─────────────────────────────────────────────────────────────────┐
│                      CHAT BUTTON STATES                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  "+ NEW SESSION"                    "SEND"                     │
│  ┌──────────────────────┐          ┌──────────────────────┐   │
│  │ DISABLED (❌)        │          │ DISABLED (❌)        │   │
│  │ • No profile        │          │ • No session        │   │
│  │ • Session exists    │          │ • No text           │   │
│  │ • Timer running     │          │ • No profile        │   │
│  │ • Still creating    │          │ • Session CLOSED    │   │
│  │                     │          │                     │   │
│  │ ENABLED (✅)        │          │ ENABLED (✅)        │   │
│  │ • Profile complete  │          │ • Session exists    │   │
│  │ • No sessions       │          │ • Text entered      │   │
│  │ • Timer NOT running │          │ • Profile complete  │   │
│  │ • Create finished   │          │ • Not loading       │   │
│  └──────────────────────┘          │ • Session ACTIVE   │   │
│                                    └──────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🎯 CONCLUSIÓN

**La lógica está correctamente implementada.**

### El flujo esperado es:
1. **Perfil COMPLETO** → "+ New Session" habilitado
2. **Crear sesión** → Timer en estado "no corriendo" (AZUL)
3. **Primer mensaje** → Timer inicia (VERDE 45:00)
4. **Timer decrementa** → 45 min o 15 min sin actividad
5. **Expiración** → Sesión CLOSED, no enviar más

### Por qué el botón está deshabilitado:
- **Perfil no está completo** ← Principal razón
- Si hay sesión ACTIVE/PAUSED → Botón también deshabilitado
- Si timer está corriendo → Botón también deshabilitado
