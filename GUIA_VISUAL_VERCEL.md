# 🖼️ GUÍA VISUAL - Configurar JWT_SECRET en Vercel

## PASO 1: Abre Vercel Dashboard

```
Abre en tu navegador:
https://vercel.com/dashboard
```

**Deberías ver algo así:**
```
┌─────────────────────────────────────┐
│ VERCEL DASHBOARD                    │
├─────────────────────────────────────┤
│ Projects                            │
│                                     │
│ > AlasLatinasNeftify    Deployed ✓  │
│ > Otro-proyecto                     │
│ > Otro-proyecto-2                   │
│                                     │
└─────────────────────────────────────┘
```

---

## PASO 2: Selecciona el Proyecto

**Haz clic en:** `AlasLatinasNeftify`

```
┌─────────────────────────────────────┐
│ AlasLatinasNeftify                  │
├─────────────────────────────────────┤
│ ✓ Production Deployment             │
│   Deployment 2 days ago             │
│                                     │
│ 📊 Analytics  📧 Events  ⚙️ Settings │
│                                     │
└─────────────────────────────────────┘
```

---

## PASO 3: Ve a Settings

**Haz clic en el botón:** `⚙️ Settings`

(Está en la parte superior derecha del proyecto)

```
┌─────────────────────────────────────┐
│ AlasLatinasNeftify Settings         │
├─────────────────────────────────────┤
│ General                             │
│ Environment Variables      ← AQUÍ   │
│ Domains                             │
│ Functions                           │
│ Analytics                           │
│ Logs                                │
│                                     │
└─────────────────────────────────────┘
```

---

## PASO 4: Haz Clic en Environment Variables

**Menú izquierdo:**
```
General
[Environment Variables]  ← HACES CLIC AQUÍ
Domains
Functions
Analytics
```

---

## PASO 5: Agrega JWT_SECRET

**Deberías ver:**
```
┌──────────────────────────────────────────┐
│ Environment Variables                    │
├──────────────────────────────────────────┤
│ [+ New Environment Variable]             │
│                                          │
│ PRODUCTION                               │
│ (Lista vacía o con otras variables)      │
│                                          │
│ PREVIEW                                  │
│ (Lista vacía o con otras variables)      │
│                                          │
└──────────────────────────────────────────┘
```

**Haz clic en:** `[+ New Environment Variable]`

---

## PASO 6: Completa el Formulario

**Verás un formulario:**
```
┌────────────────────────────────────┐
│ Add Environment Variable            │
├────────────────────────────────────┤
│                                    │
│ Name:                              │
│ [___________________________]       │
│  ↑ ESCRIBE: JWT_SECRET             │
│                                    │
│ Value:                             │
│ [___________________________]       │
│  ↑ ESCRIBE: tu_clave_secreta_123   │
│                                    │
│ ☑ Production                       │
│ ☑ Preview                          │
│ ☑ Development                      │
│                                    │
│ [Cancel]  [Save]                   │
│           ↑ HACES CLIC              │
│                                    │
└────────────────────────────────────┘
```

### Detalles:

**Name:** `JWT_SECRET`

**Value:** 
```
alas_latinas_secreto_2025_super_seguro
```

(Cualquier string de al menos 10 caracteres)

**Ambientes:** Selecciona ✓ Production, ✓ Preview, ✓ Development

---

## PASO 7: Guarda y Espera Redeploy

**Haz clic en:** `[Save]`

```
┌────────────────────────────────────┐
│ ✓ Environment Variable Saved        │
│                                    │
│ Redeploying... ⏳                   │
│                                    │
│ AlasLatinasNeftify → Production    │
│ Deployment Status: Building... ◐   │
│                                    │
└────────────────────────────────────┘
```

**Vercel se redesplegará automáticamente.**

---

## PASO 8: Espera a que Termine

**En la vista de Deployments:**

```
┌────────────────────────────────────┐
│ Deployments                        │
├────────────────────────────────────┤
│ ◐ Current: Building...             │
│                                    │
│ [View Logs]                        │
│                                    │
│ Esperando 2-3 minutos...           │
│                                    │
│ ✓ Previous: Ready (2 days ago)     │
│                                    │
└────────────────────────────────────┘
```

**Cuando veas:** `✓ Ready` → ¡Terminó!

```
┌────────────────────────────────────┐
│ ✓ Deployment Ready                 │
│                                    │
│ Environment: Production            │
│ Commit: f6ffd9b                    │
│ Time: Just now                     │
│                                    │
│ [Visit] [View Source]              │
│                                    │
└────────────────────────────────────┘
```

---

## PASO 9: Verifica que Todo Funciona

**Haz clic en:** `[Visit]`

O abre directamente:
```
https://tu-dominio-en-vercel.app
```

**Navega a "Destinos" en el menú**

---

## ✅ Resultado Esperado

Deberías ver:
```
┌─────────────────────────────────┐
│ ✈️ Alas Latinas 3.0             │
├─────────────────────────────────┤
│                                 │
│ DESTINOS                        │
│                                 │
│ ┌────────────────────────────┐  │
│ │ 🏔️ Machu Picchu           │  │
│ │ Cusco, Peru               │  │
│ │ ⭐ 4.9/5                  │  │
│ │ [Ver Detalles]            │  │
│ └────────────────────────────┘  │
│                                 │
│ ┌────────────────────────────┐  │
│ │ 🏖️ Playa Tamarindo        │  │
│ │ Guanacaste, Costa Rica    │  │
│ │ ⭐ 4.7/5                  │  │
│ │ [Ver Detalles]            │  │
│ └────────────────────────────┘  │
│                                 │
│ ... 15 destinos más ...         │
│                                 │
└─────────────────────────────────┘
```

---

## ❌ Si NO Funciona

### 1. Verifica que JWT_SECRET esté guardada

```
Vercel Dashboard
→ Settings
→ Environment Variables

Debería mostrar:
JWT_SECRET = ****** (oculta por seguridad)
```

### 2. Limpia caché del navegador

```
Ctrl + Shift + Delete (Windows)
o
Cmd + Shift + Delete (Mac)

Selecciona: "Todos los tiempos"
Clic en: "Borrar datos"
Recarga la página
```

### 3. Verifica los logs

```
Vercel Dashboard
→ Deployments (el más reciente)
→ [View Logs]

Busca errores como:
- "JWT_SECRET not defined"
- "ENOENT" (archivo no encontrado)
- "500 Internal Error"
```

### 4. Prueba la API directamente

En PowerShell/Terminal:
```powershell
$url = "https://tu-dominio.vercel.app/api/destinations"
Invoke-WebRequest -Uri $url | ConvertFrom-Json | ConvertTo-Json
```

Debería retornar:
```json
[
  {
    "id": "dest-1",
    "name": "Machu Picchu",
    ...
  },
  ...
]
```

---

## 📱 Resumen Visual

```
GitHub (Tu código)
         ↓
git push main
         ↓
Vercel (Detecta cambios)
         ↓
Lee vercel.json
         ↓
Busca funciones en api/
         ↓
Deploy automático
         ↓
Lee JWT_SECRET de Environment Variables
         ↓
Funciones serverless activas ✅
         ↓
Tu app en vercel.app ✨
         ↓
Destinos visibles 🎉
```

---

## 🎯 Resumen

| Paso | Acción | Tiempo |
|------|--------|--------|
| 1 | Abre Vercel Dashboard | 10 seg |
| 2 | Selecciona proyecto | 5 seg |
| 3 | Ve a Settings | 5 seg |
| 4 | Click Environment Variables | 5 seg |
| 5 | New Environment Variable | 10 seg |
| 6 | JWT_SECRET = tu_clave | 20 seg |
| 7 | Save | 5 seg |
| 8 | Espera redeploy | 2-3 min |
| 9 | Verifica destinos | 30 seg |
| **TOTAL** | | **3-4 min** |

---

**¿Completó todos los pasos?** → Los destinos deberían verse ✅

Diciembre 2025
