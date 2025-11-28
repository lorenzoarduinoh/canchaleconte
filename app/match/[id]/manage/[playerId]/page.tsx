"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { Match, Player, MatchStatus } from '@/types';
import { matchService } from '@/services/matchService';
import { createPaymentPreferenceAction, removePlayerAction } from '@/app/actions';
import { 
  CheckCircleIcon, 
  AlertTriangleIcon, 
  MapPinIcon, 
  CalendarIcon, 
  DollarSignIcon,
  TrashIcon
} from '@/components/Icons';

export default function PlayerManagePage() {
    const params = useParams();
    const searchParams = useSearchParams();
    const router = useRouter();
    
    const matchId = params.id as string;
    const playerId = params.playerId as string;
    const paymentStatus = searchParams.get('status'); // success, failure, pending

    const [match, setMatch] = useState<Match | null>(null);
    const [player, setPlayer] = useState<Player | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isPaying, setIsPaying] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        loadData();
    }, [matchId, playerId]);

    const loadData = async () => {
        setIsLoading(true);
        const matchData = await matchService.getMatchById(matchId);
        if (matchData) {
            setMatch(matchData);
            const foundPlayer = matchData.players.find(p => p.id === playerId);
            setPlayer(foundPlayer || null);
        }
        setIsLoading(false);
    };

    const handlePayment = async () => {
        if (!match || !player) return;
        
        setIsPaying(true);
        const result = await createPaymentPreferenceAction(match, player);
        if (result.success && result.url) {
            window.location.href = result.url; // Redirect to Mercado Pago
        } else {
            alert('Error al iniciar el pago: ' + (result.message || 'Intenta nuevamente'));
            setIsPaying(false);
        }
    };

    const handleUnsubscribe = async () => {
        if (!confirm('¿Estás seguro que deseas darte de baja del partido?')) return;
        
        setIsDeleting(true);
        const result = await removePlayerAction(matchId, playerId);
        if (result.success) {
            alert('Te has dado de baja exitosamente.');
            router.push(`/match/${matchId}`); // Go back to match page
        } else {
            alert('Error al darse de baja.');
            setIsDeleting(false);
        }
    };

    if (isLoading) return <div className="min-h-screen flex items-center justify-center text-primary">Cargando...</div>;
    
    if (!match || !player) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
                <h1 className="text-xl font-bold text-danger">No se encontró tu inscripción</h1>
                <p className="text-secondary">Puede que hayas sido eliminado o el partido no exista.</p>
            </div>
        );
    }

    const isMatchFinished = match.status === MatchStatus.Finished;
    
    return (
        <div className="min-h-screen bg-background font-sans text-primary p-4 flex flex-col items-center">
            <div className="w-full max-w-md bg-surface rounded-2xl shadow-xl border border-surface-dark/10 overflow-hidden">
                
                <div className="bg-primary/5 p-6 text-center border-b border-surface-dark/10">
                    <h1 className="text-2xl font-black text-primary mb-1">Gestionar Asistencia</h1>
                    <p className="text-secondary text-sm font-medium">Hola, <span className="text-primary font-bold">{player.name}</span></p>
                </div>

                <div className="p-6 space-y-6">
                    {/* Payment Status Notification */}
                    {paymentStatus === 'success' && (
                        <div className="bg-success/10 text-success p-4 rounded-xl flex items-center gap-3 mb-4 animate-pulse">
                            <CheckCircleIcon className="w-6 h-6" />
                            <span className="font-bold">¡Pago realizado con éxito!</span>
                        </div>
                    )}

                     {paymentStatus === 'failure' && (
                        <div className="bg-danger/10 text-danger p-4 rounded-xl flex items-center gap-3 mb-4">
                            <AlertTriangleIcon className="w-6 h-6" />
                            <span className="font-bold">El pago falló. Intenta nuevamente.</span>
                        </div>
                    )}

                    {/* Match Details */}
                    <div className="space-y-3">
                        <h2 className="text-lg font-bold text-primary border-b border-surface-dark/10 pb-2">Detalles del Partido</h2>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-surface-dark/5 p-3 rounded-xl">
                                <div className="text-xs text-secondary uppercase font-bold flex items-center gap-1">
                                    <CalendarIcon className="w-3 h-3"/> Fecha
                                </div>
                                <div className="font-bold">{new Date(match.date).toLocaleDateString()} {match.time}</div>
                            </div>
                            <div className="bg-surface-dark/5 p-3 rounded-xl">
                                <div className="text-xs text-secondary uppercase font-bold flex items-center gap-1">
                                    <MapPinIcon className="w-3 h-3"/> Lugar
                                </div>
                                <a href={match.locationLink} target="_blank" className="font-bold underline text-primary truncate block">Ver Mapa</a>
                            </div>
                        </div>
                    </div>

                    {/* Payment Section */}
                    <div className="space-y-3">
                         <h2 className="text-lg font-bold text-primary border-b border-surface-dark/10 pb-2">Estado de Pago</h2>
                         
                         {player.hasPaid ? (
                             <div className="flex flex-col items-center justify-center p-6 bg-success/5 rounded-xl border border-success/20">
                                 <div className="w-12 h-12 bg-success rounded-full flex items-center justify-center mb-2 shadow-lg shadow-success/30">
                                     <CheckCircleIcon className="w-6 h-6 text-white" />
                                 </div>
                                 <span className="text-xl font-black text-success">PAGADO</span>
                                 <p className="text-xs text-secondary mt-1">Gracias por cumplir.</p>
                             </div>
                         ) : (
                             <div className="space-y-3">
                                 <div className="flex justify-between items-center p-3 bg-surface-dark/5 rounded-xl">
                                     <span className="font-bold text-secondary">Monto a pagar</span>
                                     <span className="text-xl font-black text-primary">${match.pricePerPlayer}</span>
                                 </div>
                                 
                                 <button 
                                    onClick={handlePayment}
                                    disabled={isPaying}
                                    className="w-full py-4 bg-[#009EE3] text-white font-bold rounded-xl shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                                 >
                                     {isPaying ? 'Procesando...' : 'Pagar con Mercado Pago'}
                                 </button>
                                 <p className="text-xs text-center text-secondary">
                                     Serás redirigido a Mercado Pago para completar la transacción de forma segura.
                                 </p>
                             </div>
                         )}
                    </div>

                    <hr className="border-surface-dark/10"/>

                    {/* Danger Zone */}
                    {!isMatchFinished && !player.hasPaid && (
                        <button 
                            onClick={handleUnsubscribe}
                            disabled={isDeleting}
                            className="w-full py-3 bg-transparent border border-danger/20 text-danger font-bold rounded-xl hover:bg-danger/5 transition-all flex items-center justify-center gap-2"
                        >
                            <TrashIcon className="w-4 h-4" />
                            {isDeleting ? 'Dando de baja...' : 'Darme de baja del partido'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
