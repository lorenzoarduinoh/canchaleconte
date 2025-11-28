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

    // Format phone number logic for Argentina
    let cleanPhone = to.replace(/\D/g, '');

    // Logic for Sandbox compatibility (User registered without '9')
    // If cleanPhone is 10 digits (e.g. 3794557442), just add 54.
    if (cleanPhone.length === 10) {
        cleanPhone = '54' + cleanPhone;
    } 
    // If it comes as 54379... (12 digits), leave it as is.
    
    // Log for debugging
    console.log(`Sending WhatsApp to: ${cleanPhone} (Original: ${to})`);

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
                    language: { code: 'en' },
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
