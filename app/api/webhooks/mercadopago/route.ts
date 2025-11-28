import { NextResponse } from 'next/server';
import MercadoPagoConfig, { Payment } from 'mercadopago';
import { matchService } from '@/services/matchService';

// Note: Webhooks need a public URL to work. 
// On localhost, use ngrok or similar to tunnel.

const client = new MercadoPagoConfig({ 
    accessToken: process.env.MP_ACCESS_TOKEN || '', 
    options: { timeout: 5000 } 
});

export async function POST(request: Request) {
    try {
        const body = await request.json();
        
        // Mercado Pago sends a notification like: { action: 'payment.created', data: { id: '123' } }
        // or just query params depending on config. Let's handle the standard body format.

        const paymentId = body.data?.id;
        const type = body.type;

        if (type === 'payment' && paymentId) {
            const payment = new Payment(client);
            const paymentData = await payment.get({ id: paymentId });
            
            if (paymentData.status === 'approved') {
                const playerId = paymentData.external_reference;
                
                if (playerId) {
                    console.log(`Payment approved for player ${playerId}`);
                    
                    // Update DB
                    const success = await matchService.updatePlayerPayment(playerId, true);
                    
                    if (success) {
                        return NextResponse.json({ success: true });
                    } else {
                        console.error('Failed to update player payment in DB');
                        return NextResponse.json({ error: 'DB Error' }, { status: 500 });
                    }
                }
            }
        }

        return NextResponse.json({ received: true });

    } catch (error) {
        console.error('Webhook error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
