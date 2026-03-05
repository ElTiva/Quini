# Quini

Aplicación de análisis de probabilidades de números con **persistencia de datos**.

- Ingreso de hasta 6 números distintos (0–45) por ticket.
- Los botones llevan a secciones separadas: "Cargar" y "Probabilidad".
- Se guardan las últimas **20** secuencias (120 valores en total); al superar ese límite se descartará la más antigua.
- La vista de probabilidades **se recarga automáticamente cada 20 segundos** mostrando porcentajes y conteos, además del ticket con los 6 números más frecuentes.
- **Botón manual "Recargar"** para actualizar datos sin esperar.
- **Base de datos SQLite**: Todos los datos se guardan de manera permanente. Persisten entre reinicios.

## Instalación

```bash
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

## Ejecución Local

El servidor corre en HTTP en el puerto 5000:

```bash
python app.py
```

### Acceso Local

- **Desde la misma máquina**: http://localhost:5000

## Desplegar en la Nube (Público)

Para que la aplicación esté **disponible públicamente sin necesidad de tener un servidor corriendo**:

### Opción: Render (Recomendado)

1. **Crea una cuenta** en [render.com](https://render.com) (es gratis)

2. **Conecta tu repositorio GitHub**:
   - Ve a Render → New → Web Service
   - Conecta tu GitHub y selecciona el repositorio `Quini`

3. **Configura el servicio**:
   - Runtime: Python
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `python app.py`
   - (El archivo `Procfile` o `render.yaml` lo hacen automático)

4. **Añade una base de datos PostgreSQL**:
   - En el dashboard de Render, crea un servicio de tipo **PostgreSQL** (Free plan funciona).
   - Copia la variable `DATABASE_URL` que Render te da.
   - Ve al Web Service de tu app → Environment → Add Environment Variable
     y pega `DATABASE_URL` allí.
   - Con esto la app usará Postgres en lugar de SQLite.

5. **Deploy**:
   - Render desplegará automáticamente
   - Te dará una URL pública como: `https://quini-abc123.onrender.com`

6. **Accede** desde cualquier lugar:
   - Comparte el link: `https://quini-abc123.onrender.com`
   - No necesita IP ni servidor local corriendo
   - Los datos se almacenan en la base Postgres y no se perderán jamás

### Notas sobre Render Free:

- ✅ Gratis para ejecutar
- ✅ Base de datos Postgres persistente (no se borra en redeploy)
- ✅ URL pública permanente
- ⚠️ El servicio web se "duerme" después de 15 min sin actividad (primera solicitud tarda ~30s)
- Si necesitas mejor rendimiento, puedes upgrade a plan pagado

---

**TL;DR**: Haz push a GitHub, conecta Render, y listo. Tu app estará pública sin hacer nada más. Los datos persisten para siempre.


