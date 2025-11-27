import React, { useState } from 'react';
import { Match, Player, MatchStatus } from '../types';
import { generateMatchSummary } from '../services/geminiService';
import { BotIcon, CheckCircleIcon, ShareIcon, UsersIcon, MapPinIcon, TrashIcon, AlertTriangleIcon } from './Icons';

interface MatchDetailProps {
  match: Match;
  onClose: () => void;
  onUpdateMatch: (updatedMatch: Match) => void;
  onDeleteMatch: (matchId: string) => void;
  onShowNotification: (message: string, type: 'success' | 'error') => void;
}

export const MatchDetail: React.FC<MatchDetailProps> = ({ match, onClose, onUpdateMatch, onDeleteMatch, onShowNotification }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [resultInput, setResultInput] = useState(match.result || '');
  const [mvpInput, setMvpInput] = useState(match.mvp || '');
  const [commentsInput, setCommentsInput] = useState(match.comments || '');

  const paidCount = match.players.filter(p => p.hasPaid).length;
  const revenue = paidCount * match.pricePerPlayer;

  const handleTogglePaid = (playerId: string) => {
    const updatedPlayers = match.players.map(p => 
      p.id === playerId ? { ...p, hasPaid: !p.hasPaid } : p
    );
    onUpdateMatch({ ...match, players: updatedPlayers });
  };

  const handleGenerateSummary = async () => {
    setIsGenerating(true);
    const summary = await generateMatchSummary(match.name, resultInput, mvpInput, commentsInput);
    setCommentsInput(summary);
    setIsGenerating(false);
  };

  const handleSaveDetails = () => {
    onUpdateMatch({
      ...match,
      result: resultInput,
      mvp: mvpInput,
      comments: commentsInput,
      status: match.status === MatchStatus.Open && resultInput ? MatchStatus.Finished : match.status
    });
    onShowNotification('Cambios guardados exitosamente', 'success');
    onClose();
  };

  const handleCancelMatch = () => {
    onDeleteMatch(match.id);
    setShowCancelConfirm(false);
    onClose();
  };

  const shareText = `⚽ *${match.name}*
📅 ${new Date(match.date).toLocaleDateString()} a las ${match.time}
📍 Cancha Leconte
💰 $${match.pricePerPlayer}

Sumate acá: [Link Simulado]`;

  const handleShare = () => {
    const url = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank');
  };

  const getStatusBadge = (status: MatchStatus) => {
    switch (status) {
      case MatchStatus.Open:
        return 'bg-success/10 text-success';
      case MatchStatus.Canceled:
        return 'bg-danger/10 text-danger';
      case MatchStatus.Finished:
        return 'bg-secondary/10 text-secondary';
      default:
        return 'bg-secondary/10 text-secondary';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="relative bg-surface w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl shadow-2xl border border-surface-dark/10">
        
        {/* Header */}
        <div className="sticky top-0 bg-surface z-10 p-6 border-b border-surface-dark/10 flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold text-primary">{match.name}</h2>
            <div className="flex items-center gap-2 mt-1 text-secondary text-sm">
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(match.status)}`}>
                {match.status}
              </span>
              <span>•</span>
              <span>{new Date(match.date).toLocaleDateString()} - {match.time}hs</span>
            </div>
          </div>
          <button onClick={onClose} className="text-secondary hover:text-primary">✕</button>
        </div>

        <div className="p-6 space-y-8">
          
          {/* Action Bar */}
          <div className="flex flex-wrap gap-3">
            <button 
              onClick={handleShare}
              className="flex items-center gap-2 px-4 py-2 bg-success text-white rounded-lg hover:brightness-110 transition-all font-medium"
            >
              <ShareIcon className="w-4 h-4" />
              Invitar por WhatsApp
            </button>
            <a 
              href={match.locationLink} 
              target="_blank" 
              rel="noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-info text-white rounded-lg hover:brightness-110 transition-all font-medium"
            >
              <MapPinIcon className="w-4 h-4" />
              Ver Ubicación
            </a>
            
            {match.status === MatchStatus.Open && (
              <button 
                onClick={() => setShowCancelConfirm(true)}
                className="flex items-center gap-2 px-4 py-2 bg-danger/10 text-danger border border-danger/20 rounded-lg hover:bg-danger/20 transition-all font-medium ml-auto"
              >
                <TrashIcon className="w-4 h-4" />
                Cancelar
              </button>
            )}
          </div>

          {/* Players List */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-primary flex items-center gap-2">
                <UsersIcon className="w-5 h-5" />
                Jugadores ({match.players.length}/{match.maxPlayers})
              </h3>
              <div className="text-sm">
                <span className="text-secondary">Recaudado: </span>
                <span className="font-bold text-success">${revenue.toLocaleString()}</span>
                <span className="text-secondary text-xs ml-1">(${match.pricePerPlayer} c/u)</span>
              </div>
            </div>

            <div className="bg-surface-dark/5 rounded-lg overflow-hidden border border-surface-dark/10">
              <div className="grid grid-cols-12 gap-2 p-3 bg-surface-dark/10 text-xs font-bold text-secondary uppercase tracking-wider">
                <div className="col-span-5">Nombre</div>
                <div className="col-span-4">Teléfono</div>
                <div className="col-span-3 text-center">Pago</div>
              </div>
              <div className="divide-y divide-surface-dark/10">
                {match.players.length === 0 ? (
                  <div className="p-4 text-center text-secondary text-sm">Aún no hay inscriptos.</div>
                ) : (
                  match.players.map((player) => (
                    <div key={player.id} className="grid grid-cols-12 gap-2 p-3 items-center hover:bg-surface-dark/5 transition-colors">
                      <div className="col-span-5 font-medium text-primary">{player.name}</div>
                      <div className="col-span-4 text-sm text-secondary">{player.phone}</div>
                      <div className="col-span-3 flex justify-center">
                        <button
                          onClick={() => handleTogglePaid(player.id)}
                          className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-bold transition-all ${
                            player.hasPaid 
                              ? 'bg-success/10 text-success border border-success/20' 
                              : 'bg-danger/10 text-danger border border-danger/20 hover:bg-danger/20'
                          }`}
                        >
                          {player.hasPaid ? (
                            <>
                              <CheckCircleIcon className="w-3 h-3" />
                              PAGÓ
                            </>
                          ) : 'NO PAGÓ'}
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Post-Match Admin - Only show if not Canceled */}
          {match.status !== MatchStatus.Canceled && (
            <div className="border-t border-surface-dark/10 pt-6">
              <h3 className="text-lg font-semibold text-primary mb-4">Gestión Post-Partido</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-secondary mb-1">Resultado</label>
                  <input 
                    type="text" 
                    value={resultInput}
                    onChange={(e) => setResultInput(e.target.value)}
                    placeholder="Ej: 5 - 4"
                    className="w-full bg-background border border-surface-dark/20 rounded-lg p-2 text-primary focus:ring-2 focus:ring-info outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary mb-1">Figura (MVP)</label>
                  <input 
                    type="text" 
                    value={mvpInput}
                    onChange={(e) => setMvpInput(e.target.value)}
                    placeholder="Ej: Lolo"
                    className="w-full bg-background border border-surface-dark/20 rounded-lg p-2 text-primary focus:ring-2 focus:ring-info outline-none"
                  />
                </div>
              </div>

              <div className="mb-4">
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-sm font-medium text-secondary">Comentarios del Partido</label>
                  <button 
                    onClick={handleGenerateSummary}
                    disabled={isGenerating}
                    className="text-xs flex items-center gap-1 text-info hover:text-info/80 font-medium disabled:opacity-50"
                  >
                    <BotIcon className="w-3 h-3" />
                    {isGenerating ? 'Generando...' : 'Generar resumen con IA'}
                  </button>
                </div>
                <textarea 
                  value={commentsInput}
                  onChange={(e) => setCommentsInput(e.target.value)}
                  placeholder="Escribe un comentario o usa la IA para generar uno..."
                  rows={3}
                  className="w-full bg-background border border-surface-dark/20 rounded-lg p-2 text-primary focus:ring-2 focus:ring-info outline-none resize-none"
                />
              </div>

              <button 
                onClick={handleSaveDetails}
                className="w-full py-2.5 bg-primary text-surface rounded-lg font-semibold hover:opacity-90 transition-opacity"
              >
                Guardar Cambios
              </button>
            </div>
          )}

        </div>

        {/* Confirmation Modal Overlay */}
        {showCancelConfirm && (
          <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-surface/90 backdrop-blur-sm rounded-xl">
             <div className="bg-surface border border-danger/30 shadow-2xl rounded-xl p-6 max-w-sm w-full text-center animate-in fade-in zoom-in duration-200">
                <div className="mx-auto w-12 h-12 bg-danger/10 rounded-full flex items-center justify-center mb-4">
                    <AlertTriangleIcon className="w-6 h-6 text-danger" />
                </div>
                <h3 className="text-xl font-bold text-primary mb-2">¿Eliminar el partido?</h3>
                <p className="text-secondary text-sm mb-6">
                    Estás a punto de cancelar y eliminar <strong>{match.name}</strong>. Esta acción no se puede deshacer.
                </p>
                <div className="flex gap-3">
                    <button
                        onClick={() => setShowCancelConfirm(false)}
                        className="flex-1 py-2.5 text-primary bg-surface-dark/10 hover:bg-surface-dark/20 rounded-lg transition-colors font-medium"
                    >
                        No, volver
                    </button>
                    <button
                        onClick={handleCancelMatch}
                        className="flex-1 py-2.5 bg-danger text-white rounded-lg font-bold hover:brightness-110 transition-all shadow-lg shadow-danger/20"
                    >
                        Sí, eliminar
                    </button>
                </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};