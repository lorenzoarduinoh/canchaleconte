"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { Match, MatchStatus, DashboardStats } from '@/types';
import { MatchDetail } from '@/components/MatchDetail';
import { CreateMatchModal } from '@/components/CreateMatchModal';
import { PlusIcon, CalendarIcon, UsersIcon, DollarSignIcon, TrophyIcon, CheckCircleIcon, AlertTriangleIcon } from '@/components/Icons';
import { matchService } from '@/services/matchService';
import { updateMatchAction } from '@/app/actions';

export default function Home() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error'} | null>(null);

  // Load matches on mount
  useEffect(() => {
    loadMatches();
  }, []);

  const loadMatches = async () => {
    setIsLoading(true);
    const data = await matchService.getMatches();
    setMatches(data);
    setIsLoading(false);
  };

  // Notification Helper
  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // Create Match
  const handleCreateMatch = async (newMatchData: Omit<Match, 'id' | 'players' | 'status'>) => {
    const createdMatch = await matchService.createMatch(newMatchData);
    if (createdMatch) {
      setMatches([createdMatch, ...matches]);
      showNotification('Partido creado exitosamente', 'success');
    } else {
      showNotification('Error al crear el partido', 'error');
    }
  };

  // Update Match (Optimistic update + DB call)
  const handleUpdateMatch = async (updatedMatch: Match) => {
    // Optimistic update
    setMatches(matches.map(m => m.id === updatedMatch.id ? updatedMatch : m));
    setSelectedMatch(updatedMatch);

    // DB Update
    const result = await updateMatchAction(updatedMatch);
    if (!result.success) {
      showNotification('Error al guardar los cambios', 'error');
      // Revert if needed, or just reload
      loadMatches();
    }
  };

  // Delete Match
  const handleDeleteMatch = async (matchId: string) => {
    const success = await matchService.deleteMatch(matchId);
    if (success) {
      setMatches(matches.filter(m => m.id !== matchId));
      setSelectedMatch(null);
      showNotification('Partido eliminado', 'success');
    } else {
      showNotification('Error al eliminar el partido', 'error');
    }
  };

  // Stats Calculation
  const stats: DashboardStats = useMemo(() => {
    const finishedMatches = matches.filter(m => m.status === MatchStatus.Finished);
    const revenue = matches.reduce((acc, match) => {
      if (match.status === MatchStatus.Canceled) return acc;
      const paidPlayers = match.players.filter(p => p.hasPaid).length;
      return acc + (paidPlayers * match.pricePerPlayer);
    }, 0);
    const goals = finishedMatches.reduce((acc, m) => {
      if (!m.result) return acc;
      const parts = m.result.split('-').map(s => parseInt(s.trim()));
      return acc + (parts[0] || 0) + (parts[1] || 0);
    }, 0);

    return {
      totalMatches: matches.filter(m => m.status !== MatchStatus.Canceled).length,
      totalRevenue: revenue,
      totalGoals: goals,
      activePlayers: new Set(matches.flatMap(m => m.players.map(p => p.name))).size
    };
  }, [matches]);

  const getStatusBadgeStyles = (status: MatchStatus) => {
    switch (status) {
      case MatchStatus.Open:
        return 'bg-success text-white';
      case MatchStatus.Canceled:
        return 'bg-danger/20 text-danger border border-danger/20';
      default:
        return 'bg-surface-dark text-secondary';
    }
  };

  return (
    <div className="min-h-screen bg-background font-sans transition-colors duration-300">
      
      {/* Navigation */}
      <nav className="sticky top-0 z-40 w-full bg-surface/80 backdrop-blur-md border-b border-surface-dark/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <h1 className="text-2xl font-black tracking-tighter text-primary">
              CANCHA <span className="text-success">LECONTE</span>
            </h1>
            <div className="flex items-center gap-4">
              <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-success to-info flex items-center justify-center text-white font-bold text-xs shadow-lg">
                SA
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Welcome Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold text-primary">Hola, Santiago y Agustín</h2>
            <p className="text-secondary mt-1">Aquí tienen el resumen de la quinta.</p>
          </div>
          <button 
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center justify-center gap-2 bg-primary text-surface px-6 py-3 rounded-xl font-bold shadow-lg shadow-primary/20 hover:scale-105 transition-transform"
          >
            <PlusIcon className="w-5 h-5" />
            Crear Partido
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard 
            icon={<DollarSignIcon className="text-success" />} 
            label="Recaudación Total" 
            value={`$${stats.totalRevenue.toLocaleString()}`} 
          />
          <StatCard 
            icon={<TrophyIcon className="text-warning" />} 
            label="Partidos Jugados" 
            value={stats.totalMatches} 
          />
          <StatCard 
            icon={<UsersIcon className="text-info" />} 
            label="Jugadores Activos" 
            value={stats.activePlayers} 
          />
          <StatCard 
            icon={<CalendarIcon className="text-danger" />} 
            label="Goles Totales" 
            value={stats.totalGoals} 
          />
        </div>

        {/* Matches List */}
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-primary">Partidos Recientes</h3>
          {isLoading ? (
            <div className="flex justify-center py-10 text-secondary">Cargando partidos...</div>
          ) : matches.length === 0 ? (
            <div className="text-center py-10 text-secondary bg-surface rounded-2xl border border-surface-dark/10">
              No hay partidos creados aún.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {matches.map(match => (
                <div 
                  key={match.id}
                  onClick={() => setSelectedMatch(match)}
                  className="group bg-surface border border-surface-dark/10 rounded-2xl p-5 cursor-pointer hover:border-success/50 hover:shadow-lg transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold ${
                        match.status === MatchStatus.Finished ? 'bg-surface-dark text-secondary' : 
                        match.status === MatchStatus.Canceled ? 'bg-danger/10 text-danger' : 'bg-success/10 text-success'
                      }`}>
                        {new Date(match.date).getDate()}
                      </div>
                      <div className={match.status === MatchStatus.Canceled ? 'opacity-50' : ''}>
                        <h4 className="font-bold text-lg text-primary group-hover:text-success transition-colors">
                          {match.name}
                          {match.status === MatchStatus.Canceled && <span className="ml-2 text-xs font-normal text-danger">(Cancelado)</span>}
                        </h4>
                        <p className="text-secondary text-sm flex items-center gap-2">
                          {match.time}hs • {match.players.length}/{match.maxPlayers} Jugadores
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                       <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusBadgeStyles(match.status)}`}>
                          {match.status.toUpperCase()}
                        </span>
                        {match.result && match.status === MatchStatus.Finished && <span className="text-sm font-bold text-primary mt-1">{match.result}</span>}
                    </div>
                  </div>
                  
                  {/* Mini Progress Bar for Players */}
                  {match.status !== MatchStatus.Canceled && (
                    <div className="mt-4 w-full bg-surface-dark/10 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-success transition-all duration-500" 
                        style={{ width: `${(match.players.length / match.maxPlayers) * 100}%` }}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

      </main>

      {/* Toast Notification */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-[100] animate-[slideIn_0.3s_ease-out_forwards]">
          <div className={`px-5 py-4 rounded-xl shadow-2xl flex items-center gap-3 text-white font-semibold ${
            notification.type === 'success' ? 'bg-success' : 'bg-danger'
          }`}>
            {notification.type === 'success' ? <CheckCircleIcon className="w-6 h-6"/> : <AlertTriangleIcon className="w-6 h-6"/>}
            <span>{notification.message}</span>
          </div>
        </div>
      )}

      {/* Modals */}
      {isCreateModalOpen && (
        <CreateMatchModal 
          onClose={() => setIsCreateModalOpen(false)} 
          onCreate={handleCreateMatch} 
        />
      )}

      {selectedMatch && (
        <MatchDetail 
          match={selectedMatch} 
          onClose={() => setSelectedMatch(null)}
          onUpdateMatch={handleUpdateMatch}
          onDeleteMatch={handleDeleteMatch}
          onShowNotification={showNotification}
        />
      )}
    </div>
  );
}

const StatCard = ({ icon, label, value }: { icon: React.ReactNode, label: string, value: string | number }) => (
  <div className="bg-surface p-5 rounded-2xl border border-surface-dark/10 shadow-sm flex flex-col gap-2">
    <div className="p-2 bg-surface-dark/5 w-fit rounded-lg">
      {React.isValidElement(icon) 
        ? React.cloneElement(icon as React.ReactElement<{ className?: string }>, { 
            className: `w-6 h-6 ${(icon.props as { className?: string }).className || ''}` 
          })
        : icon}
    </div>
    <div className="mt-2">
      <p className="text-secondary text-xs uppercase tracking-wider font-semibold">{label}</p>
      <p className="text-2xl font-black text-primary">{value}</p>
    </div>
  </div>
);
