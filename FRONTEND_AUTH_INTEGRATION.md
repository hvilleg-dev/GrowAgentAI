# Integración Frontend con JWT Authentication

**Fecha:** 2026-11-07  
**Backend:** ✅ JWT Middleware implementado  
**Frontend:** Requiere actualización para usar tokens JWT  

## Problema a Resolver

El frontend envía un token pero el backend no lo validaba. Ahora backend REQUIERE token JWT válido en todas las rutas protegidas.

## Solución Requerida en Frontend

### 1. Guardar Token Después de Login/Register

```typescript
// services/auth.service.ts
async function login(email: string, password: string) {
  const response = await fetch(`${API_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });

  const data = await response.json();
  
  if (response.ok && data.token) {
    // ✅ GUARDAR TOKEN EN localStorage
    localStorage.setItem('auth_token', data.token);
    return data.user;
  }
  
  throw new Error(data.error);
}
```

### 2. Incluir Token en TODAS las Peticiones a `/api/*`

```typescript
// services/api.ts
export async function apiCall(
  endpoint: string,
  options: RequestInit = {}
): Promise<any> {
  const token = localStorage.getItem('auth_token');
  
  const headers: HeadersInit = {
    ...options.headers,
    'Content-Type': 'application/json',
  };

  // ✅ INCLUIR TOKEN SI EXISTE
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers
  });

  // ✅ MANEJAR 401 - Token inválido/expirado
  if (response.status === 401) {
    const error = await response.json();
    
    // Token inválido, expirado o falta
    localStorage.removeItem('auth_token');
    window.location.href = '/login';
    
    throw new Error(error.code || 'Authentication required');
  }

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'API Error');
  }

  return response.json();
}
```

### 3. Usar en Todas las Llamadas a API

```typescript
// ✅ Chat messages
POST /api/chat/:sessionId/message
Authorization: Bearer <token>

// ✅ Get sessions
GET /api/sessions/usuario/:userId
Authorization: Bearer <token>

// ✅ Get goals
GET /api/goals/usuario/:userId
Authorization: Bearer <token>

// ✅ Update settings
PUT /api/auth/language
Authorization: Bearer <token>
```

## Checklist de Integración

### Phase 1: Verificación
- [ ] Verificar que login devuelve `{ token: "eyJ..." }`
- [ ] Verificar que localStorage guarda token después de login
- [ ] Verificar que cada petición incluye `Authorization: Bearer <token>`

### Phase 2: Pruebas Manual
- [ ] Login → Token guardado ✅
- [ ] Petición Chat sin token → 401 MISSING_AUTH ✅
- [ ] Petición Chat con token → ✅ Funciona
- [ ] Settings cambio idioma → ✅ No hace logout
- [ ] Esperar 24h → Token expira → 401 TOKEN_EXPIRED ✅
- [ ] Logout → localStorage vacío → Próximo login nuevo token ✅

### Phase 3: Despliegue
- [ ] Rebuild frontend
- [ ] Test en staging
- [ ] Deploy a Vercel
- [ ] Validar en producción

## Errores Esperados y Cómo Manejarlos

### 401 MISSING_AUTH
```json
{
  "error": "Missing authorization header",
  "code": "MISSING_AUTH"
}
```
**Causa:** No hay header `Authorization: Bearer <token>`  
**Acción:** Incluir token en headers

### 401 TOKEN_EXPIRED
```json
{
  "error": "Token expired",
  "code": "TOKEN_EXPIRED"
}
```
**Causa:** Token expiró (24h)  
**Acción:** Redirigir a login, pedir nuevo token

### 401 INVALID_TOKEN
```json
{
  "error": "Invalid token",
  "code": "INVALID_TOKEN"
}
```
**Causa:** Token corrupto, falsificado o modificado  
**Acción:** Redirigir a login, pedir nuevo token

### 401 INVALID_AUTH_FORMAT
```json
{
  "error": "Invalid authorization header format. Expected: Bearer <token>",
  "code": "INVALID_AUTH_FORMAT"
}
```
**Causa:** Header no sigue formato `Bearer <token>`  
**Acción:** Verificar que header es exactamente `Authorization: Bearer eyJ...`

## Implementación Paso a Paso

### 1. Actualizar `services/api.ts` o equivalente

```typescript
// Ej: React con fetch
const apiCall = async (endpoint: string, options: RequestInit = {}) => {
  const token = localStorage.getItem('auth_token');
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
    ...(token && { Authorization: `Bearer ${token}` })
  };

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers
  });

  if (response.status === 401) {
    localStorage.removeItem('auth_token');
    window.location.href = '/login';
    return;
  }

  return response.json();
};
```

### 2. Garantizar Login Guarda Token

```typescript
const handleLogin = async (email: string, password: string) => {
  try {
    const { token, user } = await apiCall('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });

    // ✅ GUARDAR TOKEN
    localStorage.setItem('auth_token', token);
    setUser(user);
    
    navigate('/chat');
  } catch (error) {
    setError(error.message);
  }
};
```

### 3. Limpiar Token en Logout

```typescript
const handleLogout = () => {
  localStorage.removeItem('auth_token');
  setUser(null);
  navigate('/login');
};
```

### 4. Validar en Componentes

```typescript
// ✅ Proteger rutas que necesitan autenticación
function ProtectedRoute({ children }) {
  const token = localStorage.getItem('auth_token');
  
  if (!token) {
    return <Navigate to="/login" />;
  }
  
  return children;
}
```

## Testing

### Test 1: Login y Token Guardado
```bash
1. Abrir DevTools → Console
2. localStorage.getItem('auth_token') → null (antes de login)
3. Hacer login
4. localStorage.getItem('auth_token') → "eyJ..." ✅
```

### Test 2: Petición sin Token
```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json"
  
Response 401: { "error": "Missing authorization header", "code": "MISSING_AUTH" }
```

### Test 3: Petición con Token
```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJ..." \
  -d '{"message": "Hola"}'

Response 200: { "success": true, ... } ✅
```

## Variables de Entorno

**Frontend** no necesita cambios en .env (usa localStorage).

**Backend** (.env):
```
JWT_SECRET=your-secret-key-change-in-production
```

## Timeline

| Fase | Tarea | ETA |
|------|-------|-----|
| 1 | Actualizar apiCall en frontend | Hoy |
| 2 | Verificar login guarda token | Hoy |
| 3 | Test manual de integraciones | Hoy |
| 4 | Build y deploy a Vercel | Hoy |
| 5 | Validar en producción | Hoy |

## Documentos Relacionados

- `IMPLEMENTACION_AUTH_JWT.md` → Detalles backend
- `.env.example` → Configuración necesaria
- `backend/src/middleware/auth.middleware.ts` → Código middleware

## Preguntas Frecuentes

**Q: ¿Dónde guardar el token?**  
R: localStorage es lo más común. Alternativas: sessionStorage (borrado al cerrar tab), cookie (HTTPS + HttpOnly).

**Q: ¿Cuánto dura el token?**  
R: 24 horas. Después: redirigir a login automáticamente.

**Q: ¿Cómo refrescar token sin logout?**  
R: Implementar endpoint `/api/auth/refresh` (próxima iteración).

**Q: ¿Es seguro guardar en localStorage?**  
R: No es ideal (XSS vulnerability). Mejor: HttpOnly cookie + CSRF token (próxima iteración).
