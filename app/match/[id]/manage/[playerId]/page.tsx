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
  TrashIcon,
  UsersIcon
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

    if (isLoading) {
        return (
          <div className="min-h-screen bg-background flex items-center justify-center">
            <div className="animate-pulse text-primary font-bold">Cargando tu información...</div>
          </div>
        );
    }
    
    if (!match || !player) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 text-center">
                <AlertTriangleIcon className="w-12 h-12 text-danger mb-4" />
                <h1 className="text-2xl font-bold text-primary">No se encontró tu inscripción</h1>
                <p className="text-secondary mt-2">Puede que hayas sido eliminado o el partido no exista.</p>
            </div>
        );
    }

    const isMatchFinished = match.status === MatchStatus.Finished;
    const progress = (match.players.length / match.maxPlayers) * 100;

    return (
        <div className="min-h-screen bg-background font-sans text-primary">
            {/* Navbar Minimal (Igual a la inscripción) */}
            <nav className="w-full bg-surface/80 backdrop-blur-md border-b border-surface-dark/10 sticky top-0 z-10">
                <div className="max-w-md mx-auto px-4 h-14 flex items-center justify-center">
                <h1 className="text-lg font-black tracking-tighter">
                    CANCHA <span className="text-success">LECONTE</span>
                </h1>
                </div>
            </nav>

            <main className="max-w-md mx-auto px-4 py-8">
                <div className="bg-surface rounded-2xl shadow-xl border border-surface-dark/10 overflow-hidden">
                    
                    {/* Header Card */}
                    <div className="bg-surface-dark/5 p-6 border-b border-surface-dark/10 text-center">
                        <div className="flex justify-center gap-2 mb-3">
                            <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-primary/5 text-primary">
                                {match.status.toUpperCase()}
                            </span>
                            {player.hasPaid && (
                                <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-success text-white shadow-sm shadow-success/30">
                                    PAGADO
                                </span>
                            )}
                        </div>
                        <h2 className="text-2xl font-black text-primary leading-tight mb-1">{match.name}</h2>
                        <p className="text-secondary font-medium text-sm">
                            Hola, <span className="text-primary font-bold">{player.name}</span>
                        </p>
                    </div>

                    <div className="p-6 space-y-6">

                         {/* Payment Status Notification */}
                        {paymentStatus === 'success' && (
                            <div className="p-3 bg-success/10 text-success text-sm font-bold rounded-xl flex items-center gap-3 animate-in fade-in zoom-in duration-500">
                                <CheckCircleIcon className="w-5 h-5 flex-shrink-0" />
                                <span>¡Pago registrado correctamente!</span>
                            </div>
                        )}
                        {paymentStatus === 'failure' && (
                            <div className="p-3 bg-danger/10 text-danger text-sm font-bold rounded-xl flex items-center gap-3 animate-in fade-in zoom-in duration-500">
                                <AlertTriangleIcon className="w-5 h-5 flex-shrink-0" />
                                <span>El pago no se pudo completar.</span>
                            </div>
                        )}

                        {/* Info Grid (Igual a inscripción) */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex flex-col gap-1 p-3 bg-surface-dark/5 rounded-xl">
                                <div className="flex items-center gap-2 text-secondary text-xs font-bold uppercase tracking-wider">
                                <CalendarIcon className="w-4 h-4" /> Fecha
                                </div>
                                <div className="font-bold text-primary text-sm">
                                {new Date(match.date).toLocaleDateString()}
                                <br/>
                                <span className="font-normal text-secondary">{match.time} hs</span>
                                </div>
                            </div>
                            <div className="flex flex-col gap-1 p-3 bg-surface-dark/5 rounded-xl">
                                <div className="flex items-center gap-2 text-secondary text-xs font-bold uppercase tracking-wider">
                                <DollarSignIcon className="w-4 h-4" /> Precio
                                </div>
                                <div className="font-bold text-success text-lg">
                                ${match.pricePerPlayer}
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 p-3 bg-info/10 text-info rounded-xl">
                            <MapPinIcon className="w-5 h-5 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-bold uppercase tracking-wider opacity-70">Ubicación</p>
                                <a 
                                    href={match.locationLink} 
                                    target="_blank" 
                                    rel="noreferrer"
                                    className="font-bold hover:underline truncate block text-sm"
                                >
                                    Ver en Google Maps
                                </a>
                            </div>
                        </div>

                         {/* Payment Logic Section */}
                        <div className="pt-2">
                            {player.hasPaid ? (
                                <div className="text-center space-y-2 py-4 border-2 border-dashed border-success/20 rounded-xl bg-success/5">
                                    <div className="w-12 h-12 bg-success rounded-full flex items-center justify-center mx-auto shadow-lg shadow-success/30">
                                        <CheckCircleIcon className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-success">Todo listo</h3>
                                        <p className="text-secondary text-xs">Ya cubriste tu parte del partido.</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    <button 
                                        onClick={handlePayment}
                                        disabled={isPaying}
                                        className="w-full bg-[#009EE3] text-white font-bold py-3.5 rounded-xl shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                        {isPaying ? 'Procesando...' : 'Pagar con Mercado Pago'}
                                    </button>
                                    <p className="text-[10px] text-center text-secondary opacity-70">
                                        Pagos seguros procesados por Mercado Pago.
                                    </p>
                                </div>
                            )}
                        </div>

                        <hr className="border-surface-dark/10" />

                        {/* Danger Zone */}
                        {!isMatchFinished && !player.hasPaid && (
                            <div className="text-center">
                                <button 
                                    onClick={handleUnsubscribe}
                                    disabled={isDeleting}
                                    className="text-danger text-xs font-bold hover:underline flex items-center justify-center gap-1 mx-auto disabled:opacity-50"
                                >
                                    <TrashIcon className="w-3 h-3" />
                                    {isDeleting ? 'Procesando...' : 'Cancelar mi asistencia'}
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                <p className="text-center text-secondary text-xs mt-8 opacity-50">
                    &copy; {new Date().getFullYear()} Cancha Leconte
                </p>
            </main>
        </div>
    );
}