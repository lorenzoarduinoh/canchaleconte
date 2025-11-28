const WHATSAPP_API_URL = 'https://graph.facebook.com/v17.0';
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;

export const whatsappService = {
  async sendTemplateMessage(to: string, templateName: string, components: any[]) {
    if (!PHONE_NUMBER_ID || !ACCESS_TOKEN) {
        console.warn('WhatsApp API credentials not found. Message not sent.');
        console.log('Mock Message:', { to, templateName, components });
        return;
    }

    // Format phone number: remove non-digits. 
    // If it starts with '11' (Buenos Aires) and no country code, add '549' (Argentina mobile).
    // This is a basic heuristic.
    let cleanPhone = to.replace(/\D/g, '');
    if (cleanPhone.length === 10 && cleanPhone.startsWith('11')) {
        cleanPhone = '549' + cleanPhone;
    } else if (!cleanPhone.startsWith('54')) {
        // If it doesn't start with 54, we might want to assume Argentina or handle it.
        // For now, let's assume the user inputs it correctly or we just send to what we have if it looks like an international number.
        // Commonly users enter '11...' for local.
        if (cleanPhone.length === 10) {
            cleanPhone = '549' + cleanPhone; 
        }
    }

    try {
        const response = await fetch(`${WHATSAPP_API_URL}/${PHONE_NUMBER_ID}/messages`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${ACCESS_TOKEN}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                messaging_product: 'whatsapp',
                to: cleanPhone,
                type: 'template',
                template: {
                    name: templateName,
                    language: { code: 'es_AR' },
                    components: components
                }
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('Error sending WhatsApp message:', JSON.stringify(errorData, null, 2));
            // We don't throw here to avoid crashing the registration flow if WA fails
        } else {
             const data = await response.json();
             console.log('WhatsApp message sent:', data);
        }

    } catch (error) {
        console.error('Failed to send WhatsApp message:', error);
    }
  },

  async sendRegistrationConfirmation(to: string, matchName: string, manageLink: string) {
     // Template assumption: 'match_registration_confirmed'
     // Header: (None or Text)
     // Body: "Hola! Te inscribiste al partido {{1}}. Gestiona tu asistencia aquí: {{2}}"
     const components = [
         {
             type: 'body',
             parameters: [
                 { type: 'text', text: matchName },
                 { type: 'text', text: manageLink }
             ]
         }
     ];
     await this.sendTemplateMessage(to, 'match_registration_confirmed', components);
  },

  async sendMatchReminder(to: string, matchName: string, time: string, locationLink: string) {
     // Template assumption: 'match_reminder'
     // Body: "Recordatorio: Hoy juegas {{1}} a las {{2}}. Ubicación: {{3}}"
     const components = [
         {
             type: 'body',
             parameters: [
                 { type: 'text', text: matchName },
                 { type: 'text', text: time },
                 { type: 'text', text: locationLink }
             ]
         }
     ];
     await this.sendTemplateMessage(to, 'match_reminder', components);
  },

  async sendPaymentRequest(to: string, matchName: string, paymentLink: string) {
     // Template assumption: 'match_payment_request'
     // Body: "El partido {{1}} ha finalizado. Por favor realiza el pago aquí: {{2}}"
     const components = [
         {
             type: 'body',
             parameters: [
                 { type: 'text', text: matchName },
                 { type: 'text', text: paymentLink }
             ]
         }
     ];
     await this.sendTemplateMessage(to, 'match_payment_request', components);
  }
};
