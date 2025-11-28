# Integración de WhatsApp - Guía y Configuración

Este documento detalla cómo funciona el sistema de notificaciones automáticas por WhatsApp para "Cancha Leconte", qué está implementado y cómo modificarlo en el futuro.

## 1. Qué hace el sistema actualmente

El sistema utiliza la **Meta WhatsApp Cloud API** oficial. Envía mensajes automáticos en 3 situaciones específicas:

| Evento | Disparador (Trigger) | Plantilla (Template Name) | Variables |
| :--- | :--- | :--- | :--- |
| **Inscripción** | Cuando un jugador se anota en la web. | `match_registration_confirmed` | 1. Nombre del partido<br>2. Link de gestión personal |
| **Recordatorio** | Cron Job (Automático, 2 horas antes). | `match_reminder` | 1. Nombre del partido<br>2. Hora (ej: 20:00)<br>3. Link de Google Maps |
| **Cobro** | Cuando el admin marca el partido como "Finalizado". | `match_payment_request` | 1. Nombre del partido<br>2. Link de gestión para pagar |

---

## 2. Configuración Requerida

Para que los mensajes salgan, necesitas configurar las credenciales en el archivo `.env.local`:

```env
# Identificador de tu número de teléfono en Meta
WHATSAPP_PHONE_NUMBER_ID=123456789...

# Token de acceso (Temporal de 24h o Permanente de Usuario de Sistema)
WHATSAPP_ACCESS_TOKEN=EAAG...
```

> **Importante:** Si estás usando una cuenta de prueba (Sandbox), solo puedes enviar mensajes a números que hayas verificado previamente en la consola de Meta Developers.

---

## 3. Cómo hacer cambios (Guía de Mantenimiento)

### Caso A: Quiero cambiar el TEXTO del mensaje
*Ejemplo: Cambiar "Hola!" por "Buenas tardes crack".*

1. **No toques el código.**
2. Ve a [Meta Business Manager > WhatsApp Manager](https://business.facebook.com/).
3. Busca la plantilla correspondiente (ej: `match_registration_confirmed`).
4. Edítala y envíala a revisión.
5. **Regla de Oro:** Mantén la misma cantidad de variables `{{1}}`, `{{2}}`. Si las borras o agregas nuevas, el código fallará.

### Caso B: Quiero cambiar el NOMBRE de la plantilla
*Ejemplo: En Meta cambiaste el nombre de `match_reminder` a `recordatorio_partido`.*

1. Tienes que actualizar el código.
2. Abre el archivo: `services/whatsappService.ts`.
3. Busca la función correspondiente (ej: `sendMatchReminder`).
4. Cambia el segundo parámetro de `sendTemplateMessage`:
   ```typescript
   // Antes
   await this.sendTemplateMessage(to, 'match_reminder', components);
   
   // Ahora
   await this.sendTemplateMessage(to, 'recordatorio_partido', components);
   ```

### Caso C: Quiero agregar una NUEVA variable
*Ejemplo: Quieres que el mensaje de recordatorio diga también el precio.*

1. **En Meta:** Edita la plantilla y agrega `{{4}}`.
2. **En el Código (`services/whatsappService.ts`):**
   Actualiza el array `components` para enviar ese cuarto dato:
   ```typescript
   const components = [
       {
           type: 'body',
           parameters: [
               { type: 'text', text: matchName }, // {{1}}
               { type: 'text', text: time },      // {{2}}
               { type: 'text', text: location },  // {{3}}
               { type: 'text', text: "$5000" }    // {{4}} -> NUEVO
           ]
       }
   ];
   ```

---

## 4. Solución de Problemas Comunes

*   **Error "Template does not exist":** El nombre en `whatsappService.ts` no coincide exactamente con el nombre en Meta, o el idioma (`es_AR`) es diferente.
*   **Error "Param count mismatch":** La plantilla en Meta tiene 3 variables `{{...}}` pero el código solo está enviando 2.
*   **Mensaje no llega:** Revisa si el token (`WHATSAPP_ACCESS_TOKEN`) caducó (los de prueba duran 24hs) o si el número destino no está verificado (en modo Sandbox).
