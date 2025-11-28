'use server'

import { matchService } from '@/services/matchService';
import { whatsappService } from '@/services/whatsappService';
import { paymentService } from '@/services/paymentService';
import { revalidatePath } from 'next/cache';
import { Match, MatchStatus, Player } from '@/types';
import { redirect } from 'next/navigation';

export async function registerPlayerAction(matchId: string, name: string, phone: string) {
    try {
        // 1. Check if match exists and is open (Basic validation should be done on client, but good to double check)
        const match = await matchService.getMatchById(matchId);
        if (!match) {
            return { success: false, message: 'Partido no encontrado.' };
        }
        
        if (match.players.length >= match.maxPlayers) {
             return { success: false, message: 'El partido ya está completo.' };
        }

        // 2. Add player to DB
        const newPlayer = await matchService.addPlayer(matchId, { name, phone });

        if (!newPlayer) {
            return { success: false, message: 'Error al registrar en la base de datos.' };
        }

        // 3. Send WhatsApp Notification
        // Build the manage link. Assuming a route /match/[id]/manage/[playerId] exists or will exist.
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
        const manageLink = `${appUrl}/match/${matchId}/manage/${newPlayer.id}`;
        
        // Run in background so we don't block the UI response too long? 
        // Vercel Serverless functions have a timeout. WhatsApp API is fast, so we can await it.
        await whatsappService.sendRegistrationConfirmation(
            phone, 
            match.name, 
            manageLink
        );

        revalidatePath(`/match/${matchId}`);
        return { success: true, player: newPlayer };

    } catch (error) {
        console.error('Registration error:', error);
        return { success: false, message: 'Error interno del servidor.' };
    }
}

export async function createPaymentPreferenceAction(match: Match, player: Player) {
    try {
        const initPoint = await paymentService.createPreference(match, player);
        if (initPoint) {
            return { success: true, url: initPoint };
        } else {
            return { success: false, message: 'Error al conectar con Mercado Pago' };
        }
    } catch (error) {
        console.error('Payment error:', error);
        return { success: false, message: 'Error interno.' };
    }
}

export async function removePlayerAction(matchId: string, playerId: string) {
    try {
        const success = await matchService.removePlayer(playerId);
        if (success) {
            revalidatePath(`/match/${matchId}`);
            return { success: true };
        }
        return { success: false, message: 'Error al eliminar jugador' };
    } catch (error) {
        return { success: false, message: 'Error interno' };
    }
}

export async function updateMatchAction(match: Match) {
    try {
        // 1. Update DB
        const success = await matchService.updateMatch(match);
        
        if (!success) {
             return { success: false, message: 'Error al actualizar el partido.' };
        }

        // 2. Check for Payment Request Trigger
        if (match.status === MatchStatus.Finished) {
             // Fetch fresh data to get players (in case local state was stale, though unlikely)
             const updatedMatch = await matchService.getMatchById(match.id);
             if (updatedMatch) {
                 const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
                 
                 // Iterate players
                 for (const player of updatedMatch.players) {
                      // Send to players who haven't paid
                      if (!player.hasPaid && player.phone) {
                           // We send the MANAGE link so they can click "Pay" there, 
                           // which generates the specific preference for them.
                           const manageLink = `${appUrl}/match/${match.id}/manage/${player.id}`;
                           
                           await whatsappService.sendPaymentRequest(
                               player.phone,
                               updatedMatch.name,
                               manageLink 
                           );
                      }
                 }
             }
        }

        revalidatePath('/'); 
        revalidatePath(`/match/${match.id}`);
        return { success: true };

    } catch (error) {
        console.error('Update error:', error);
        return { success: false, message: 'Error interno.' };
    }
}
