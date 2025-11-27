import React, { useState } from 'react';
import { Match, MatchStatus } from '../types';

interface CreateMatchModalProps {
  onClose: () => void;
  onCreate: (match: Omit<Match, 'id' | 'players' | 'status'>) => void;
}

export const CreateMatchModal: React.FC<CreateMatchModalProps> = ({ onClose, onCreate }) => {
  const [formData, setFormData] = useState({
    name: '',
    date: '',
    time: '',
    pricePerPlayer: 2500,
    maxPlayers: 10,
    locationLink: 'https://www.google.com/maps/search/?api=1&query=-34.603722,-58.381592' // Default dummy coords
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreate(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-surface w-full max-w-md rounded-xl shadow-xl border border-surface-dark/10 p-6">
        <h2 className="text-xl font-bold text-primary mb-4">Nuevo Partido</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-secondary mb-1">Nombre del Evento</label>
            <input 
              required
              type="text" 
              placeholder="Ej: Futbol Martes"
              className="w-full bg-background border border-surface-dark/20 rounded-lg p-2 text-primary focus:ring-2 focus:ring-info outline-none"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-secondary mb-1">Fecha</label>
              <input 
                required
                type="date" 
                className="w-full bg-background border border-surface-dark/20 rounded-lg p-2 text-primary focus:ring-2 focus:ring-info outline-none"
                value={formData.date}
                onChange={(e) => setFormData({...formData, date: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary mb-1">Hora</label>
              <input 
                required
                type="time" 
                className="w-full bg-background border border-surface-dark/20 rounded-lg p-2 text-primary focus:ring-2 focus:ring-info outline-none"
                value={formData.time}
                onChange={(e) => setFormData({...formData, time: e.target.value})}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-secondary mb-1">Precio x Persona</label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-secondary">$</span>
                <input 
                  required
                  type="number" 
                  className="w-full bg-background border border-surface-dark/20 rounded-lg p-2 pl-6 text-primary focus:ring-2 focus:ring-info outline-none"
                  value={formData.pricePerPlayer}
                  onChange={(e) => setFormData({...formData, pricePerPlayer: Number(e.target.value)})}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary mb-1">Cupos</label>
              <input 
                required
                type="number" 
                className="w-full bg-background border border-surface-dark/20 rounded-lg p-2 text-primary focus:ring-2 focus:ring-info outline-none"
                value={formData.maxPlayers}
                onChange={(e) => setFormData({...formData, maxPlayers: Number(e.target.value)})}
              />
            </div>
          </div>

           <div>
            <label className="block text-sm font-medium text-secondary mb-1">Link Google Maps (Coords)</label>
            <input 
              type="text" 
              className="w-full bg-background border border-surface-dark/20 rounded-lg p-2 text-sm text-secondary focus:ring-2 focus:ring-info outline-none"
              value={formData.locationLink}
              readOnly
            />
            <p className="text-xs text-secondary mt-1">Ubicación fija de la Quinta Leconte.</p>
          </div>

          <div className="flex gap-3 mt-6">
            <button 
              type="button" 
              onClick={onClose}
              className="flex-1 py-2 text-primary hover:bg-surface-dark/10 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              className="flex-1 py-2 bg-primary text-surface rounded-lg font-semibold hover:opacity-90 transition-opacity"
            >
              Crear Partido
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};