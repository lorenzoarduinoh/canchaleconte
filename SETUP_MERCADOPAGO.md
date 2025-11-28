# Guía de Configuración: Mercado Pago

Para que el sistema de cobros funcione automáticamente y se actualice la base de datos ("Pagó" / "No Pagó"), sigue estos pasos obligatorios.

## 1. Obtener Credenciales de Mercado Pago

Necesitas una cuenta de vendedor en Mercado Pago.

1. Ingresa a [Tus Integraciones en Mercado Pago Developers](https://www.mercadopago.com.ar/developers/panel).
2. Haz clic en **"Crear aplicación"**.
   - Nombre: "Cancha Leconte".
   - Tipo de integración: "Pagos Online" (Checkout Pro).
   - ¿Usarás una plataforma de e-commerce?: "No".
3. Una vez creada, entra a la aplicación y busca **"Credenciales de producción"** en el menú izquierdo.
4. Copia el **Access Token**. Debería empezar con `APP_USR-...` (para cobros reales).
   - *Nota:* Si quieres hacer pruebas con dinero ficticio, usa las "Credenciales de prueba" (`TEST-...`).

## 2. Configurar Variables de Entorno

Abre tu archivo `.env.local` en la carpeta del proyecto y agrega (o edita) la siguiente línea:

```env
MP_ACCESS_TOKEN=tu_access_token_que_copiaste_recien
```

Asegúrate también de que la URL de tu app esté definida correctamente, ya que Mercado Pago la usa para redirigir al usuario después de pagar:

```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
# Cuando subas a Vercel, cambia esto por: https://tu-proyecto.vercel.app
```

## 3. Configurar Webhooks (Notificaciones de Pago)

Mercado Pago necesita "avisarle" a tu página cuando entra dinero.

### Opción A: En Producción (Vercel) - RECOMENDADO
Cuando despliegues tu página en Vercel, esto **funciona automáticamente**. El código ya está programado para decirle a Mercado Pago: *"Cuando cobres, avísame a `https://mi-sitio.com/api/webhooks/mercadopago`"*.

### Opción B: Probando en tu PC (Localhost)
Mercado Pago **NO** puede ver tu computadora (`localhost`). Si necesitas probar que el "tilde verde" se active estando en tu casa:

1. Descarga e instala [Ngrok](https://ngrok.com/download).
2. Abre una terminal y corre: `ngrok http 3000`.
3. Ngrok te dará una URL pública rara, ej: `https://a1b2-c3d4.ngrok-free.app`.
4. Ve a tu archivo `.env.local` y cambia temporalmente:
   ```env
   NEXT_PUBLIC_APP_URL=https://a1b2-c3d4.ngrok-free.app
   ```
5. Reinicia tu servidor (`npm run dev`). Ahora MP podrá "entrar" a tu PC.

## 4. Validar Funcionamiento

1. Crea un partido de prueba.
2. Inscríbete como jugador (recibirás el WhatsApp).
3. Entra al link de "Gestionar asistencia".
4. Haz clic en **"Pagar con Mercado Pago"**.
5. Completa el pago (si usas credenciales de prueba, usa tarjetas de prueba de MP).
6. Al finalizar, deberías volver a tu página y ver el cartel **"PAGADO"** en verde automáticamente.
