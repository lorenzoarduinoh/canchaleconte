"use client";

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Match, MatchStatus } from '@/types';
import { matchService } from '@/services/matchService';
import { registerPlayerAction } from '@/app/actions';
import { 
  CalendarIcon, 
  MapPinIcon, 
  DollarSignIcon, 
  CheckCircleIcon, 
  AlertTriangleIcon, 
  UsersIcon 
} from '@/components/Icons';

export default function MatchRegistration() {
  const params = useParams();
  const matchId = params.id as string;
  
  const [match, setMatch] = useState<Match | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({ name: '', phone: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (matchId) {
      loadMatch();
    }
  }, [matchId]);

  const loadMatch = async () => {
    setIsLoading(true);
    const data = await matchService.getMatchById(matchId);
    setMatch(data);
    setIsLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!match) return;
    
    setError(null);
    setIsSubmitting(true);

    // Basic validation
    if (!formData.name.trim() || !formData.phone.trim()) {
      setError('Por favor completa todos los campos.');
      setIsSubmitting(false);
      return;
    }

    // Check if full
    if (match.players.length >= match.maxPlayers) {
      setError('El partido ya está completo.');
      setIsSubmitting(false);
      return;
    }

    try {
      const result = await registerPlayerAction(matchId, formData.name, formData.phone);

      if (result.success && result.player) {
        setIsRegistered(true);
        setMatch(prev => prev ? { ...prev, players: [...prev.players, result.player!] } : null);
      } else {
        setError(result.message || 'Ocurrió un error al inscribirte. Intenta nuevamente.');
      }
    } catch (err) {
      setError('Ocurrió un error inesperado.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-primary font-bold">Cargando partido...</div>
      </div>
    );
  }

  if (!match) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 text-center">
        <AlertTriangleIcon className="w-12 h-12 text-danger mb-4" />
        <h1 className="text-2xl font-bold text-primary">Partido no encontrado</h1>
        <p className="text-secondary mt-2">El enlace puede ser incorrecto o el partido fue eliminado.</p>
      </div>
    );
  }

  const isFull = match.players.length >= match.maxPlayers;
  const progress = (match.players.length / match.maxPlayers) * 100;

  return (
    <div className="min-h-screen bg-background font-sans text-primary">
      {/* Navbar Minimal */}
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
            <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-primary/5 text-primary mb-3">
              {match.status.toUpperCase()}
            </span>
            <h2 className="text-3xl font-black text-primary leading-tight mb-2">{match.name}</h2>
            <p className="text-secondary font-medium">
              Inscríbete para confirmar tu lugar
            </p>
          </div>

          <div className="p-6 space-y-6">
            
            {/* Info Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1 p-3 bg-surface-dark/5 rounded-xl">
                <div className="flex items-center gap-2 text-secondary text-xs font-bold uppercase tracking-wider">
                  <CalendarIcon className="w-4 h-4" /> Fecha
                </div>
                <div className="font-bold text-primary">
                  {new Date(match.date).toLocaleDateString()}
                  <br/>
                  <span className="text-sm font-normal text-secondary">{match.time} hs</span>
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
                    className="font-bold hover:underline truncate block"
                  >
                    Ver en Google Maps
                  </a>
               </div>
            </div>

            {/* Players Progress */}
            <div>
              <div className="flex justify-between items-end mb-2">
                <span className="text-sm font-bold text-secondary flex items-center gap-2">
                  <UsersIcon className="w-4 h-4" />
                  Jugadores
                </span>
                <span className={`text-sm font-bold ${isFull ? 'text-danger' : 'text-success'}`}>
                  {match.players.length} / {match.maxPlayers}
                </span>
              </div>
              <div className="w-full bg-surface-dark/10 h-2.5 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-500 ${isFull ? 'bg-danger' : 'bg-success'}`} 
                  style={{ width: `${progress}%` }}
                />
              </div>
              {isFull && !isRegistered && (
                <p className="text-xs text-danger mt-2 font-medium text-center">
                  ¡El partido está completo! No se admiten más inscripciones.
                </p>
              )}
            </div>

            <hr className="border-surface-dark/10" />

            {/* Registration Form or Success Message */}
            {isRegistered ? (
              <div className="text-center space-y-4 py-4 animate-in fade-in zoom-in duration-300">
                <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircleIcon className="w-8 h-8 text-success" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-primary">¡Estás inscripto!</h3>
                  <p className="text-secondary text-sm mt-1">
                    Te enviamos un WhatsApp con los detalles.
                  </p>
                </div>
                <div className="p-4 bg-surface-dark/5 rounded-xl text-sm text-secondary">
                  Recuerda que puedes darte de baja desde el link que te enviamos si no puedes asistir.
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                   <div className="p-3 bg-danger/10 text-danger text-sm font-medium rounded-lg flex items-center gap-2">
                      <AlertTriangleIcon className="w-4 h-4 flex-shrink-0" />
                      {error}
                   </div>
                )}
                
                <div className="space-y-1">
                  <label htmlFor="name" className="text-sm font-bold text-secondary">Nombre Completo</label>
                  <input
                    id="name"
                    type="text"
                    placeholder="Ej: Lionel Messi"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-background border border-surface-dark/20 rounded-xl p-3 text-primary focus:ring-2 focus:ring-primary outline-none transition-all disabled:opacity-50"
                    disabled={isSubmitting || isFull}
                  />
                </div>

                <div className="space-y-1">
                  <label htmlFor="phone" className="text-sm font-bold text-secondary">Teléfono (WhatsApp)</label>
                  <input
                    id="phone"
                    type="tel"
                    placeholder="Ej: 3795123456"
                    value={formData.phone}
                    onChange={(e) => {
                      // Solo números
                      let val = e.target.value.replace(/\D/g, '');
                      // Limitar a 10 dígitos (formato móvil estándar sin 0 ni 15)
                      if (val.length > 10) val = val.slice(0, 10);
                      
                      // Formato visual: 11 1234-5678
                      if (val.length > 6) {
                        val = `${val.slice(0, 2)} ${val.slice(2, 6)}-${val.slice(6)}`;
                      } else if (val.length > 2) {
                        val = `${val.slice(0, 2)} ${val.slice(2)}`;
                      }
                      
                      setFormData({ ...formData, phone: val });
                    }}
                    className="w-full bg-background border border-surface-dark/20 rounded-xl p-3 text-primary focus:ring-2 focus:ring-primary outline-none transition-all disabled:opacity-50"
                    disabled={isSubmitting || isFull}
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || isFull}
                  className="w-full bg-primary text-surface font-bold py-3.5 rounded-xl shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:hover:scale-100 disabled:shadow-none"
                >
                  {isSubmitting ? 'Inscribiendo...' : isFull ? 'Cupos Agotados' : 'Confirmar Asistencia'}
                </button>
              </form>
            )}

          </div>
        </div>

        <p className="text-center text-secondary text-xs mt-8 opacity-50">
          &copy; {new Date().getFullYear()} Cancha Leconte. Todos los derechos reservados.
        </p>

      </main>
    </div>
  );
}
