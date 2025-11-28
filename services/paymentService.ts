import MercadoPagoConfig, { Preference } from 'mercadopago';
import { Match, Player } from '../types';

// Initialize the client
// Note: MP_ACCESS_TOKEN must be in .env.local
const client = new MercadoPagoConfig({ 
    accessToken: process.env.MP_ACCESS_TOKEN || '', 
    options: { timeout: 5000 } 
});

export const paymentService = {
  async createPreference(match: Match, player: Player) {
    if (!process.env.MP_ACCESS_TOKEN) {
      console.error('Mercado Pago Access Token not found');
      return null;
    }

    const preference = new Preference(client);

    try {
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
        
        const result = await preference.create({
            body: {
                items: [
                    {
                        id: match.id,
                        title: `Partido: ${match.name}`,
                        description: `Reserva para ${match.date} a las ${match.time}`,
                        quantity: 1,
                        unit_price: Number(match.pricePerPlayer),
                        currency_id: 'ARS',
                    }
                ],
                payer: {
                    name: player.name,
                    // We don't strictly need email/phone for the basic preference, 
                    // but it's good practice if we had it.
                },
                back_urls: {
                    success: `${appUrl}/match/${match.id}/manage/${player.id}?status=success`,
                    failure: `${appUrl}/match/${match.id}/manage/${player.id}?status=failure`,
                    pending: `${appUrl}/match/${match.id}/manage/${player.id}?status=pending`,
                },
                auto_return: 'approved',
                external_reference: player.id, // CRITICAL: This links the payment to the player in our DB
                notification_url: `${appUrl}/api/webhooks/mercadopago`, 
                statement_descriptor: 'CANCHA LECONTE',
            }
        });

        return result.init_point; // The URL to redirect the user to

    } catch (error) {
        console.error('Error creating preference:', error);
        return null;
    }
  }
};
