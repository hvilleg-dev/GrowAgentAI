# 🔍 AUDIT COMPLETO: ENDPOINTS Y FUNCIONALIDADES FALTANTES

## Fecha: 2026-11-07
## Status: ANÁLISIS PREELIMINAR - Identificar TODO antes de rebuild

---

## 📊 RESUMEN EJECUTIVO

| Página | Estado | Funcionalidades | Endpoints Faltantes |
|--------|--------|-----------------|---------------------|
| **Login** | ✅ Funciona | POST /auth/login | (existente) |
| **Register** | ✅ Funciona | POST /auth/register | (existente) |
| **Chat** | ⚠️ Parcial | - Crear sesión ✅ <br> - Listar sesiones ✅ <br> - Enviar mensaje ✅ <br> - Ver historial 🔶 | GET /chat/{sessionId} ✅ (creado) |
| **Goals** | ⚠️ Parcial | - Crear goal 🔶 <br> - Listar goals ✅ <br> - Editar goal ❌ <br> - Eliminar goal ❌ | POST /goals ⚠️ (problema), GET/PUT/DELETE goal endpoints |
| **Settings** | ❌ ROTO | - Cambiar tema ❌ <br> - Cambiar idioma ❌ <br> - Cambiar contraseña ❌ <br> - 2FA ❌ | PUT /auth/theme, PUT /auth/language, PUT /auth/password, PUT /auth/2fa |

---

## 🔴 PÁGINAS DETALLADAS

### 1. **LoginPage** ✅ FUNCIONA
**Frontend:**
- Form con email/password → Redux authSlice.login() ✅

**Backend:**
- ✅ POST /auth/login
- ✅ Valida email/password
- ✅ Retorna token + user data

**Acciones:** Ninguna

---

### 2. **RegisterPage** ✅ FUNCIONA
**Frontend:**
- Form con name/email/password/confirmPassword → Redux authSlice.register() ✅

**Backend:**
- ✅ POST /auth/register
- ✅ Crea usuario
- ✅ Retorna token + user data

**Acciones:** Ninguna

---

### 3. **ChatPage** ⚠️ PARCIALMENTE FUNCIONA
**Frontend:**
- Sidebar: Listar sesiones (useSessions hook)
- Sidebar: "+ New Session" button
- Main: Ver mensajes de chat
- Main: Input para enviar mensaje

**Backend Endpoints Existentes:**
- ✅ POST /sessions - crear sesión
- ✅ GET /sessions/usuario/:usuarioId - listar sesiones
- ✅ POST /chat - enviar mensaje
- ✅ GET /chat/:sessionId - ver historial (NUEVO - agregado en última sesión)

**Funcionalidades:**
- ✅ Crear nueva sesión
- ✅ Listar sesiones del usuario
- ✅ Seleccionar sesión
- ✅ Enviar mensaje
- ✅ Ver historial de chat (requiere prueba)

**Problemas Identificados:**
- Backend rebuild falló (exit code 1)
- No se sabe si GET /chat/:sessionId funciona realmente
- El useChat hook puede tener issues con el fetch

**Acciones Necesarias:**
- 🔧 Debuggear por qué falló el rebuild
- ✅ GET /chat/:sessionId endpoint ya está (agregado)

---

### 4. **GoalsPage** ⚠️ PARCIALMENTE FUNCIONA
**Frontend:**
- Form con campos: description, goal, reality, option1/2/3, will
- Listar goals del usuario
- Editar goal (botón visible pero sin handler)
- Eliminar goal (botón visible pero sin handler)

**Backend Endpoints Existentes:**
- ✅ POST /goals - crear goal
- ✅ GET /goals/usuario/:usuarioId - listar goals
- ✅ GET /goals/:goalId - obtener 1 goal
- ✅ PUT /goals/:goalId - actualizar goal
- ✅ DELETE /goals/:goalId - eliminar goal

**Frontend Hooks:**
- useQuery para listar goals (GET /goals/usuario/:userId) ✅
- useMutation para crear goal (POST /goals) - pero tiene bug

**Problemas Identificados:**
- 🐛 **CRÍTICO**: Goals no se graban. Form "Something went wrong" error
- Backend tiene Goal entity pero los datos no persisten
- Frontend GoalForm.tsx no tiene manejo correcto de onSubmit

**Acciones Necesarias:**
- 🔧 Revisar por qué POST /goals no funciona
- 🔧 Verificar Goal entity schema en BD
- 🔧 Verificar GoalForm está llamando endpoint correctamente

---

### 5. **SettingsPage** ❌ COMPLETAMENTE ROTO

**Frontend Problemas:**
```tsx
// PROBLEMA 1: Theme change solo localStorage, sin backend
handleThemeChange = (newTheme) => {
  dispatch(setTheme(newTheme))  // Redux local
  document.documentElement.classList.add('dark')  // DOM local
  // ❌ NO LLAMA AL BACKEND
}

// PROBLEMA 2: Language change solo localStorage, sin backend
handleLanguageChange = (newLang) => {
  dispatch(setLanguage(newLang))  // Redux local
  // ❌ NO LLAMA AL BACKEND
}

// PROBLEMA 3: Botones sin handlers
- Change Password: onClick={() => {}} (vacío)
- Two-Factor Auth: onClick={() => {}} (vacío)
- Privacy Policy: onClick={() => {}} (vacío)
```

**Backend Endpoints Existentes:**
- 🟡 PUT /auth/theme - existe pero es stub (solo retorna el valor)
- ❌ PUT /auth/language - NO existe
- 🟡 POST /auth/change-password - existe pero es stub
- ❌ POST /auth/2fa - NO existe

**Usuario Entity:**
- Tiene campo `idioma` (es/en) pero no `tema`
- Tiene `passwordHash` pero no historico de passwords
- No tiene `twoFactorEnabled` ni `twoFactorSecret`

**Acciones Necesarias:**
- ❌ Crear PUT /auth/language
- ❌ Crear POST /auth/update-password (mejorar change-password stub)
- ❌ Crear POST /auth/enable-2fa
- ❌ Crear POST /auth/disable-2fa
- ❌ Agregar `tema` a Usuario entity
- ❌ Conectar frontend handlers a estos endpoints
- ❌ Implementar Privacy Policy modal

---

## 📋 LISTA DE ACCIONES REQUERIDAS

### **FASE 1: CRITICAL (Sin estos, nada funciona)**
- [ ] P1.1 - Debuggear backend rebuild (salió exit code 1)
- [ ] P1.2 - Verificar POST /goals funciona (goals no se graban)
- [ ] P1.3 - Testear GET /chat/:sessionId funciona

### **FASE 2: SETTINGS ENDPOINTS (Toda la página está rota)**
- [ ] P2.1 - Crear PUT /auth/language endpoint
- [ ] P2.2 - Mejorar POST /auth/change-password (agregar validación)
- [ ] P2.3 - Crear POST /auth/enable-2fa endpoint
- [ ] P2.4 - Crear POST /auth/disable-2fa endpoint
- [ ] P2.5 - Actualizar Usuario entity: agregar `tema` field

### **FASE 3: SETTINGS FRONTEND (Conectar a backend)**
- [ ] P3.1 - handleThemeChange llamar a PUT /auth/theme
- [ ] P3.2 - handleLanguageChange llamar a PUT /auth/language
- [ ] P3.3 - handlePasswordChange llamar a POST /auth/update-password
- [ ] P3.4 - handleEnable2FA llamar a POST /auth/enable-2fa
- [ ] P3.5 - Implementar Privacy Policy modal

### **FASE 4: GOALS FRONTEND**
- [ ] P4.1 - Agregar handler para botón Edit goal
- [ ] P4.2 - Agregar handler para botón Delete goal
- [ ] P4.3 - Crear GoalDetail page (para editar)

### **FASE 5: GENERAL**
- [ ] P5.1 - Agregar error handling consistency en todos endpoints
- [ ] P5.2 - Agregar validación en todos PUT/POST endpoints

---

## 🚀 PLAN DE ACCIÓN RECOMENDADO

### **Step 1: Fix Critical Issues** (30 min)
1. Revisar logs del backend rebuild fallido
2. Testtear POST /goals manual con curl
3. Testtear GET /chat/:sessionId con curl
4. Hacer rebuild limpie si es necesario

### **Step 2: Implement Settings Endpoints** (45 min)
1. Actualizar Usuario entity (agregar `tema`)
2. Crear PUT /auth/language
3. Crear POST /auth/update-password
4. Crear POST /auth/2fa endpoints
5. Test manual de cada endpoint

### **Step 3: Connect Frontend to Settings** (30 min)
1. Actualizar SettingsPage handlers
2. Agregar React Query mutations
3. Test UI en navegador

### **Step 4: Goals Editing** (20 min)
1. Agregar onClick handlers
2. Crear GoalDetail page
3. Test Edit/Delete functionality

### **Step 5: Full Integration Test** (15 min)
1. Test cada página completa
2. Rebuild final
3. Verificar todo funciona end-to-end

---

## 📝 NOTAS IMPORTANTES

1. **Backend rebuild falló** - Necesita investigación antes de continuar
2. **Goals persist** - POST /goals endpoint existe pero frontend dice error
3. **Settings completamente roto** - Múltiples endpoints y handlers faltantes
4. **Patrón identificado** - Frontend tiene botones pero sin handlers (placeholder UI)

---

**Próximo paso:** Investigar error del backend rebuild antes de hacer cambios
