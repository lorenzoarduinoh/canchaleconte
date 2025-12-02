import { NextResponse } from 'next/server';
import { supabase } from '@/services/supabase';
import { whatsappService } from '@/services/whatsappService';
import { headers } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const headersList = await headers();
        const authHeader = headersList.get('authorization');
        
        if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
        
        // Fetch matches for today that are Open or Full
        const { data: matches, error } = await supabase
            .from('matches')
            .select('*, players(*)')
            .eq('date', today)
            .neq('status', 'Cancelado')
            .neq('status', 'Finalizado');

        if (error) throw error;

        if (!matches || matches.length === 0) {
            return NextResponse.json({ message: 'No matches today' });
        }

        const remindersSent = [];

        for (const match of matches) {
            // Parse time. valid formats: "20:00", "20:00hs", "20".
            let timeStr = match.time.replace('hs', '').trim();
            if (!timeStr.includes(':')) timeStr += ':00';
            
            const [hours, minutes] = timeStr.split(':').map(Number);
            if (isNaN(hours) || isNaN(minutes)) continue;

            // Get current time in Argentina
            const argTime = new Date().toLocaleString("en-US", {timeZone: "America/Argentina/Buenos_Aires"});
            const argDateObj = new Date(argTime);
            const currentHours = argDateObj.getHours();
            const currentMinutes = argDateObj.getMinutes();
            const currentTotalMinutes = currentHours * 60 + currentMinutes;
            
            const matchTotalMinutes = hours * 60 + minutes;
            
            const diff = matchTotalMinutes - currentTotalMinutes;
            
            // If diff is between 110 and 130 minutes (approx 2 hours window to be safe with cron schedule)
            // Assuming cron runs every 10 or 15 mins.
            if (diff >= 110 && diff <= 130) {
                 // Send Reminders
                 if (match.players) {
                     for (const player of match.players) {
                         if (player.phone) {
                             await whatsappService.sendMatchReminder(
                                 player.phone,
                                 match.name,
                                 match.time,
                                 match.location_link || 'https://maps.app.goo.gl/HkvCMsKvaMeDvaNa8?g_st=iw'
                             );
                         }
                     }
                     remindersSent.push(match.id);
                     console.log(`Reminders sent for match: ${match.name}`);
                 }
            }
        }

        // 2. Payment Reminders (24hs after)
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];

        const { data: yesterdayMatches } = await supabase
             .from('matches')
             .select('*, players(*)')
             .eq('date', yesterdayStr)
             .eq('status', 'Finalizado');
             
        if (yesterdayMatches && yesterdayMatches.length > 0) {
             // Get current time stats again (already computed above but accessible here? No, scoped.)
             // Re-compute simplified:
             const argTime = new Date().toLocaleString("en-US", {timeZone: "America/Argentina/Buenos_Aires"});
             const argDateObj = new Date(argTime);
             const currentHours = argDateObj.getHours();
             const currentMinutes = argDateObj.getMinutes();
             const currentTotalMinutes = currentHours * 60 + currentMinutes;

             for (const match of yesterdayMatches) {
                  let timeStr = match.time.replace('hs', '').trim();
                  if (!timeStr.includes(':')) timeStr += ':00';
                  const [hours, minutes] = timeStr.split(':').map(Number);
                  if (isNaN(hours) || isNaN(minutes)) continue;
                  
                  const matchTotalMinutes = hours * 60 + minutes;
                  
                  // We want to trigger this if we are roughly 24h later.
                  // Since we filtered by date=yesterday, we just check if current time matches match time.
                  const diff = currentTotalMinutes - matchTotalMinutes; 
                  
                  // Within 20 min window
                  if (Math.abs(diff) <= 20) { 
                      const paymentLink = "https://link.mercadopago.com.ar/canchaleconte"; 
                      for (const player of match.players) {
                           if (!player.has_paid && player.phone) {
                               await whatsappService.sendPaymentRequest(
                                   player.phone, 
                                   match.name, 
                                   paymentLink
                               ); 
                           }
                      }
                      console.log(`Payment reminders sent for match: ${match.name}`);
                  }
             }
        }

        return NextResponse.json({ success: true, sentCount: remindersSent.length, matches: remindersSent });

    } catch (error) {
        console.error('Cron error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
