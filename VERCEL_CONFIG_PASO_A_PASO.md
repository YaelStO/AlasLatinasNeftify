# ⚙️ INSTRUCCIONES DE CONFIGURACIÓN VERCEL - PASO A PASO

## El Problema y la Solución

**Problema:** Los destinos no se ven en Vercel porque no había backend serverless.

**Solución:** Ya se han agregado funciones serverless. Solo necesitas configurar una variable de entorno.

---

## 🔧 PASO 1: Configurar Variable de Entorno en Vercel

### En tu navegador:

1. **Abre el Dashboard de Vercel:**
   ```
   https://vercel.com/dashboard
   ```

2. **Selecciona el proyecto "AlasLatinasNeftify"**

3. **Ve a Settings:**
   - Clic en "Settings" (arriba del proyecto)

4. **Environment Variables:**
   - Clic en "Environment Variables" (menú izquierdo)

5. **Agrega una nueva variable:**
   - **Key:** `JWT_SECRET`
   - **Value:** `tu_clave_secreta_aqui_minimo_32_caracteres`
   
   Ejemplo:
   ```
   JWT_SECRET = alas_latinas_secreto_super_seguro_2025
   ```

6. **Haz clic en "Save"**

7. **Vercel te preguntará en qué entornos aplicar:**
   - Selecciona: Production, Preview, Development
   - Haz clic en "Save and Redeploy"

### Vercel se redesplegará automáticamente ⏳

Espera a que diga "✓ Ready" (suele tomar 2-3 minutos)

---

## 🔍 PASO 2: Verifica que Todo Funciona

### En tu navegador:

1. **Abre tu app:**
   ```
   https://tu-dominio-en-vercel.app
   ```

2. **Haz clic en "Destinos"** en el menú

3. **Deberías ver 17 destinos listados:**
   - Machu Picchu
   - Playa Tamarindo
   - Galápagos Islands
   - ... y más

### Si ves los destinos: ✅ ¡ÉXITO!

---

## 🧪 PASO 3: Testing Adicional (Opcional)

### Prueba la API directamente:

```bash
# Terminal / PowerShell

# 1. GET todos los destinos
curl https://tu-dominio-en-vercel.app/api/destinations | jq

# 2. GET destinos filtrados
curl "https://tu-dominio-en-vercel.app/api/destinations?search=Peru" | jq

# 3. Ver logs de Vercel
vercel logs --follow
```

---

## ❌ Troubleshooting

### Los destinos SIGUEN no viéndose

**1. Verifica la variable de entorno:**
   - Dashboard → Settings → Environment Variables
   - Confirma que `JWT_SECRET` esté configurada
   - Si no está, agrégala y guarda

**2. Espera a que Vercel termine el redeploy:**
   - Dashboard → Deployments
   - Debería decir "✓ Ready"

**3. Limpia la caché del navegador:**
   ```
   Ctrl + Shift + Delete (o Cmd + Shift + Delete en Mac)
   Selecciona: "Todos los tiempos"
   Haz clic en "Borrar datos"
   ```
   Luego recarga la página

**4. Verifica los logs del servidor:**
   - Dashboard → Deployments (el más reciente)
   - Clic en "Logs"
   - Busca errores

**5. Prueba directamente la API:**
   ```bash
   curl https://tu-dominio-en-vercel.app/api/destinations
   ```
   
   Debería retornar algo como:
   ```json
   [
     {
       "id": "dest-1",
       "name": "Machu Picchu",
       "location": "Cusco, Peru",
       ...
     },
     ...
   ]
   ```

### Error "500 - Internal Server Error"

- Revisa los Function Logs en Vercel
- Verifica que `JWT_SECRET` esté en variables de entorno
- Verifica que el build tenga permisos correctos

### Error "404 - Not Found"

- Verifica que las funciones en `api/` estén siendo detectadas
- Ejecuta un nuevo deploy:
  ```bash
  vercel deploy --prod
  ```

---

## 📝 Resumen de Cambios Realizados

Ya está hecho (no necesitas hacer nada más):

```
✅ Creadas funciones serverless en frontend/api/
✅ Configurado vercel.json correctamente
✅ Actualizado package.json para inicializar BD
✅ Base de datos con 17 destinos iniciales
✅ Todo pusheado a GitHub
```

**Solo falta:** Configurar `JWT_SECRET` en Vercel Dashboard

---

## 🎯 Resultado Esperado

Después de configurar JWT_SECRET:

```
Usuario abre la app
         ↓
Navega a /destinations
         ↓
API retorna 17 destinos
         ↓
Se muestran los destinos en pantalla ✨
```

---

## 📧 ¿Preguntas?

Si algo no funciona:

1. Verifica los logs en Vercel Dashboard → Deployments
2. Comprueba que JWT_SECRET está configurada
3. Limpia caché del navegador
4. Intenta un redeploy manual:
   ```bash
   vercel deploy --prod
   ```

---

**Configuración requerida:** Solo `JWT_SECRET`  
**Tiempo estimado:** 5 minutos  
**Resultado:** ✅ Destinos visibles en Vercel

Diciembre 2025
