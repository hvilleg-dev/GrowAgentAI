# 🎨 UX Best Practices para GrowAgentAI
## Basado en Aplicaciones Exitosas

**Referentes analizados:** Calm, Headspace, Slack, Linear, Superhuman, Notion, Strava, Streaks, Duolingo, Peloton, Masterclass, Figma, Discord

---

## 1. ONBOARDING CONVERSACIONAL (Patrón: Duolingo + Calm)

### Problema
Usuarios llegan a "Chat" vacío → confusión → abandono

### Solución Exitosa
**Duolingo:** Intro visual + progreso claro
**Calm:** "Bienvenido, ¿cómo estás hoy?" con opciones rápidas

### Implementación GrowAgentAI

**Pantalla 1: Login → Dashboard**
```
(Primer login)
┌─────────────────────────────┐
│  🌱 Bienvenido a GrowAgentAI│
│                              │
│  "Hola! Soy tu coach IA.     │
│   Te ayudaré a crecer."      │
│                              │
│  [Crear primera sesión]      │
│  [Ver cómo funciona] (video) │
└─────────────────────────────┘
```

**Pantalla 2: Elegir Tema**
```
┌──────────────────────────────┐
│  ¿En qué quieres trabajar?   │
│  (Elige UNO para empezar)    │
│                              │
│ 🎯 Carrera                   │
│ 💼 Trabajo                   │
│ 👨‍👩‍👧 Familia                 │
│ 📚 Educación                 │
│ 💪 Personal                  │
│                              │
│ [Siguiente]                  │
└──────────────────────────────┘
```

**Pantalla 3: Chat + Guía Visual**
```
┌──────────────────────────────┐
│ Etapa 1 de 7: CONECTAR       │ ← Badge claro
│                              │
│ 💭 Coach: "Hola! ¿Cómo      │
│    estás hoy? Cuéntame un   │
│    poco..."                  │
│                              │
│ [Input area]                 │
│                              │
│ ℹ️ "Responde lo que sientas" │ ← Instrucción empática
└──────────────────────────────┘
```

---

## 2. INDICADORES DE ETAPA GROW (Patrón: Linear + Slack)

### Problema
Usuario no sabe en qué etapa está → confusión sobre flujo

### Solución Exitosa
**Linear:** Barra de progreso visual clara (To Do → In Progress → Done)
**Slack:** Threads con estado visual

### Implementación GrowAgentAI

**Visual de Etapas (Header del Chat)**
```
┌─────────────────────────────────────────┐
│ CONECTAR → OBJETIVO → REALIDAD → AMPLIAR│  (3 siguientes grises)
│    ✓         ✓          🔵      □      │  (etapa actual = azul)
│                                         │
│ Etapa 3 de 7: Explorando la realidad   │  (Nombre etapa + descripción)
└─────────────────────────────────────────┘
```

**Color Code:**
- ✓ Verde = completada
- 🔵 Azul = actual
- □ Gris = por hacer

**Cuando avanza de etapa:**
- Animación suave (fade del indicador)
- "Siguiente etapa: AMPLIAR" (toast notificación)
- Cambio de fondo muy sutil (sin ser jarring)

---

## 3. FEEDBACK DE ESTADO "COACH PENSANDO" (Patrón: Slack + Superhuman)

### Problema
Usuario espera respuesta → silencio → anxiety

### Solución Exitosa
**Slack:** "Typing..." con animación
**Superhuman:** "Processing..." con progreso

### Implementación GrowAgentAI

```
Usuario: "No sé cómo cambiar de carrera"

Coach bubble aparece:
┌──────────────────────────┐
│  💭 Coach está pensando...│  ← Animación de 3 puntos (...)
│                          │
│  [Barra de progreso suave]
│  Leyendo tu mensaje...
└──────────────────────────┘

(3-5 segundos después)

┌──────────────────────────────────────┐
│  📖 Coach: "Entiendo la duda. Veo    │
│    que mencionas 'no sé'. Cuéntame   │
│    un poco más: ¿es incertidumbre    │
│    sobre capacidades o sobre si es   │
│    el momento correcto?"              │
└──────────────────────────────────────┘
```

**Elemento clave:** NO mostrar burbujas genéricas. Mostrar intent real ("Leyendo emoción...", "Buscando referencias...", etc.)

---

## 4. PROGRESO VISUAL (Patrón: Strava + Streaks)

### Problema
Usuario no ve progreso → desmotivación

### Solución Exitosa
**Strava:** Mapa visual de actividad, badges
**Streaks:** Cadena de días consecutivos, gráfico circular

### Implementación GrowAgentAI - Dashboard

**Meta Card Visual (NO texto aburrido)**

```
┌──────────────────────────────────┐
│  🎯 Cambiar de carrera           │
│                                  │
│  ████████░░ 68% completado       │  (Barra colorida)
│                                  │
│  📊 Hitos logrados:              │
│  ✅ Definí objetivo claro        │
│  ✅ Identifiqué mi realidad      │
│  ⏳ Estoy ampliando perspectiva  │
│  ◯ Generaré opciones (prox)    │
│                                  │
│  ⏱️ Iniciada hace 3 semanas     │
│  📅 Meta: 30 Dic 2026           │
│                                  │
│  [Ver sesiones] [Continuar]     │
└──────────────────────────────────┘
```

**En Timeline de Compromisos:**
```
📅 Compromisos de esta meta:

┌──────────────────────────────┐
│ ✅ Nov 15: "Revisar 3 perfiles │
│           en LinkedIn"        │
│ Completado hace 3 días       │
└──────────────────────────────┘

┌──────────────────────────────┐
│ ⏳ Nov 22: "Charla con mentor" │
│ Vence en 5 días              │
│ [Actualizar estado]          │
└──────────────────────────────┘

┌──────────────────────────────┐
│ ◯ Nov 29: "Enviar CV a       │
│          2 empresas"         │
│ Pendiente                    │
└──────────────────────────────┘
```

---

## 5. ANIMACIONES SUAVES (Patrón: Figma + Framer)

### Problema
Experiencia robótica, sin vida

### Solución Exitosa
**Figma:** Transiciones suaves entre estados
**Framer:** Micro-interacciones agradables

### Implementación GrowAgentAI

**Burbujas de chat:**
- Fade-in suave (200ms)
- Slide desde abajo (100ms)
- NO aparición abrupta

**Ejemplo código (Framer Motion en React):**
```tsx
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.3, ease: "easeOut" }}
>
  Coach bubble aquí
</motion.div>
```

**Transiciones de pantalla:**
- Fade entre Dashboard → Chat (150ms)
- Slide del drawer de Metas (200ms)
- NO cambios abruptos

**Hover states:**
- Botón primario: cambio de sombra suave
- Meta card: levanta ligeramente (lift effect)
- Compromiso: highlighta suavemente

---

## 6. TONO DE COLOR (Patrón: Calm + Headspace)

### Problema
Colores fríos/corporativos = sensación NO empática

### Solución Exitosa
**Calm:** Azul cielo + verde agua (calmante)
**Headspace:** Azul océano + verde naturaleza (bienestar)

### Implementación GrowAgentAI

```
PRIMARY (Confianza): #2563EB (Azul)
  └─ Botones principales, etapa actual, links
  
SECONDARY (Crecimiento): #10B981 (Verde)
  └─ Metas completadas, checkmarks, badges
  
ACCENT (Energía): #F59E0B (Naranja)
  └─ Alerts suaves, llamadas a acción
  
BACKGROUND (Serenidad): #F9FAFB (Gris muy claro)
  └─ NO blanco puro (cansa la vista)
  
ERROR (Alerta empática): #F87171 (Rojo suave, NO rojo puro)
  └─ Derivaciones de crisis, errores críticos
  
NEUTRAL (Profesionalismo): #6B7280 (Gris)
  └─ Texto secundario, timestamps, metadata

Paleta de SENTIMIENTOS:
- Esperanza: Verde + Azul (vistas juntas)
- Reflexión: Azul oscuro + blanco
- Energía: Naranja + blanco
- Calma: Verde pastel + gris claro
```

---

## 7. NAVEGACIÓN INTUITIVA (Patrón: Discord + Slack)

### Problema
Usuario se pierde entre pantallas

### Solución Exitosa
**Discord:** Sidebar siempre visible, tabs claras
**Slack:** Bottom nav en mobile, top nav en desktop

### Implementación GrowAgentAI

**Desktop (Web + Electron):**
```
┌──────┬───────────────────────────────┐
│ Logo │  🏠 Dashboard  💬 Chat        │
│ 🌱   │      🎯 Metas  📋 Sesiones  │
│      │      👤 Perfil               │
│      │                               │
│      │  [Chat content aquí]          │
│      │                               │
│      │  📊 GrowAgentAI v1.0         │
└──────┴───────────────────────────────┘
```

**Mobile (React Native):**
```
┌──────────────────────────────┐
│  ☰  Dashboard               │
├──────────────────────────────┤
│  [Chat content aquí]         │
│  [Chat content aquí]         │
│  [Chat content aquí]         │
├──────────────────────────────┤
│ 💬 📊 🎯 📋 👤              │ ← Bottom tabs
└──────────────────────────────┘
```

---

## 8. MANEJO DE ERRORES EMPÁTICO (Patrón: Duolingo + Headspace)

### Problema
Mensajes de error técnicos = frustración

### Solución Exitosa
**Duolingo:** "Casi! Intenta de nuevo"
**Headspace:** "Algo salió mal. Recargando..."

### Implementación GrowAgentAI

**Error técnico:**
```
❌ "Oops, algo salió mal"

Opciones:
[🔄 Reintentar] [💬 Contactar soporte]
```

**Error de conexión:**
```
📡 "Conexión interrumpida"

Estamos intentando reconectar...
[Reconectando... 2/3 intentos]

Si persiste: [📧 Reportar problema]
```

**No permitir nuevo mensaje (coach procesa):**
```
💭 Coach está pensando...

⚡ Esto normalmente toma 5-10 segundos
```

---

## 9. GAMIFICACIÓN LIGHT (Patrón: Streaks + Duolingo)

### Problema
Coach conversacional puede ser monótono

### Solución Exitosa
**Streaks:** Cadena visual de días
**Duolingo:** Badges, celebraciones suaves

### Implementación GrowAgentAI (NOT OVERKILL)

**Badges leves (NO invasivos):**
```
Cuando completa un compromiso:
┌──────────────────┐
│ 🎉 ¡Lo hiciste!  │
│                  │
│ "Primer paso"    │  ← Badge sutil
│ (1 de 5 hitos)   │
└──────────────────┘
```

**Racha visual:**
```
📅 Tu actividad en coaching:
┌────────────────────────────┐
│ Nov: 🟢🟢🟢⚪🟢🟢🟢🟢🟢   │ (9 sesiones)
│     ↑ 4 sesiones este mes  │
└────────────────────────────┘
```

**Celebración de meta completada:**
```
┌──────────────────────────────┐
│ 🎊 ¡Completaste tu meta!    │
│                              │
│ "Cambiar de carrera"        │
│ En 8 semanas lograste       │
│ transformar tu carrera.     │
│                              │
│ [🎓 Ver reflexión final]    │
│ [🎯 Crear nueva meta]       │
└──────────────────────────────┘
```

---

## 10. RESPONSIVE MOBILE-FIRST (Patrón: Slack Mobile + Discord)

### Problema
Chat es pequeño en mobile, difícil leer

### Solución Exitosa
**Slack:** Burbujas grandes, texto legible
**Discord:** Tap zones grandes, teclado optimizado

### Implementación GrowAgentAI Mobile

```
Pantalla Mobile (375px ancho):

┌─────────────────────────┐
│ Etapa 1/7: CONECTAR     │ ← Menos info, legible
├─────────────────────────┤
│                         │
│ 💭 Coach: "Hola!        │ ← Burbuja ancha
│    ¿Cómo estás?"        │
│                         │
│ 👤 Tú: "Confundido      │ ← Alineación clara
│    sobre carrera"       │
│                         │
├─────────────────────────┤
│ [Input grande]          │ ← Easy tap (48px height)
│ [📎 attachment] [➜]     │
└─────────────────────────┘
```

**Tap zones:** Mínimo 48px × 48px (recomendación iOS/Android)

---

## 11. DARK MODE (Patrón: Discord + Figma)

### Problema
Modo oscuro es tendencia, usuarios lo esperan

### Solución Exitosa
**Discord:** Toggle fácil, preserva colores
**Figma:** Ambos modos igualmente hermosos

### Implementación GrowAgentAI

```
Settings → Tema

Dark mode automático:
- Si el SO tiene dark → aplicar
- Si prefiere manual → toggle en settings

DARK Colors:
- Background: #1F2937 (gris oscuro)
- Cards: #111827 (muy oscuro)
- Text: #F3F4F6 (blanco muy suave)
- Primary: #3B82F6 (azul más brillante)
- Secondary: #34D399 (verde más brillante)
```

---

## 12. ACCESIBILIDAD REAL (Patrón: Apple + Microsoft)

### Problema
WCAG 2.1 AA es mínimo, no óptimo

### Solución Exitosa
**Apple:** Accesibilidad por defecto, no añadido
**Microsoft:** Alto contraste, navegación por teclado

### Implementación GrowAgentAI

**Contraste:**
- Texto: 4.5:1 mínimo (WCAG AA)
- Idealmente: 7:1 (WCAG AAA)

**Navegación por teclado:**
- Tab entre elementos
- Enter para activar botones
- Esc para cerrar modals

**Lectores de pantalla:**
- Etiquetas semánticas HTML5
- aria-labels donde sea necesario
- Alt text en images

**Animaciones:**
- Respetar `prefers-reduced-motion`
- No autoplay de videos

---

## 13. COPY EMPÁTICO (Patrón: Calm + Headspace)

### Problema
Copy corporativo = sensación de máquina, no empatía

### Solución Exitosa
**Calm:** "Tómate un momento", "Descansa tu mente"
**Headspace:** "Tu momento", "Respira"

### Implementación GrowAgentAI

**EVITAR:**
```
❌ "Error 500: Internal Server Error"
❌ "Procesando solicitud..."
❌ "Sesión expirada. Vuelve a iniciar."
```

**USAR:**
```
✅ "Algo se interrumpió. Intentemos de nuevo."
✅ "Procesando tu reflexión..."
✅ "Tu sesión expiró. Vuelve a conectar cuando estés listo."
```

**Copy por contexto:**

| Situación | Copy |
|-----------|------|
| **Bienvenida** | "Hola! Soy tu coach IA. Te acompaño a crecer." |
| **Comenzar sesión** | "¿Qué te trae hoy?" |
| **Etapa CONECTAR** | "Cuéntame cómo estás. Sin filtros." |
| **Etapa AMPLIAR** | "Exploremos esto desde otro ángulo." |
| **Compromiso completado** | "¡Lo lograste! Esto cuenta." |
| **Crisis detectada** | "Veo que esto es importante. Aquí hay recursos que pueden ayudarte más." |
| **Meta completada** | "Felicidades. Creciste." |

---

## 14. ONBOARDING TOUR (Patrón: Notion + Figma)

### Problema
Pantalla nuevas pueden ser overwhelming

### Solución Exitosa
**Notion:** Tutorial interactivo optional
**Figma:** Intro video corto (no forzado)

### Implementación GrowAgentAI

**Video intro (30 segundos):**
```
"Bienvenido a GrowAgentAI"

[Screen 1] "Aquí tienes tu chat de coaching"
[Screen 2] "Aquí ves tu progreso"
[Screen 3] "Aquí tus compromisos"

[Skip] [Siguiente] [Entiendo]
```

**Tooltips contextuales (opcional):**
```
Primera visita a Dashboard:
Tooltip señala Meta card:
"Aquí ves todas tus metas y su progreso"
[Entiendo] [Siguiente]
```

---

## 15. PERFORMANCE VISUAL (Patrón: Linear + Superhuman)

### Problema
Esperar es frustración

### Solución Exitosa
**Linear:** Actualizaciones instant (optimistic UI)
**Superhuman:** Carga casi invisible

### Implementación GrowAgentAI

**Optimistic UI:**
```
Usuario clickea "Marcar completado"

INMEDIATO (visual):
┌────────────────────────────┐
│ ✅ "Completado!"           │  ← Aparece al instant
│ (Marcando en servidor...)  │  (Backend confirma de fondo)
└────────────────────────────┘
```

**Loading states:**
- Skeleton screens (NO "Loading...")
- Blur effect mientras carga
- Progress bar siempre visible (aunque sea fake)

---

## 📋 CHECKLIST UX PARA AGENTE 3

```
ONBOARDING
✅ Primer login muestra intro video
✅ Pantalla de elegir tema (UX clara)
✅ Chat inicial con "¿Cómo estás?"

INDICADORES
✅ Badge de etapa GROW 1-7 (color + número)
✅ "Coach pensando..." con animación real
✅ Estado visual de compromiso (pendiente/hecho)

PROGRESO
✅ Dashboard muestra % visual claro
✅ Timeline de compromisos con estados
✅ Célula de racha (sesiones completadas)

VISUAL
✅ Colores: azul confianza, verde crecimiento
✅ Animaciones suaves (<300ms)
✅ NO animaciones que duren >1s

ERRORES
✅ Mensajes empáticos (no técnicos)
✅ Opciones de acción (reintentar, contactar)
✅ Copy friendly

MOBILE
✅ Tap zones 48px × 48px
✅ Texto legible (16px mínimo)
✅ Burbujas anchas

ACCESIBILIDAD
✅ Contraste 4.5:1+ (AA)
✅ Navegación por teclado funciona
✅ Alt text en imágenes
✅ Respeta prefers-reduced-motion

PERFORMANCE
✅ Skeleton screens mientras carga
✅ Optimistic UI updates
✅ <3s load time en 4G

COPY
✅ Empático, NO corporativo
✅ Celebra logros
✅ Reconforta en dificultades
```

---

## 🎯 APLICAR A GrowAgentAI

**Cuando Agente 3 termine, revisar:**

1. ¿El onboarding es claro y NO invasivo?
2. ¿Las etapas GROW son visuales y obvias?
3. ¿El progreso de metas es motivante?
4. ¿Los colores transmiten empatía?
5. ¿Funciona en mobile sin zoom?
6. ¿El copy es cálido, no frío?
7. ¿Las animaciones son suaves?
8. ¿Los errores son amigables?

Si 6+ sí → UX es sólida
Si <6 → requiere iteración

---

**Este documento será referencia para auditar UX después de que Agente 3 entregue. 🎨**
