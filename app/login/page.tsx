'use client';

import React, { useState } from 'react';
import { login } from './actions';
import { Lock } from 'lucide-react';

export default function LoginPage() {
  // const router = useRouter(); // Not needed with server actions redirect
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (formData: FormData) => {
    setIsLoading(true);
    setError('');
    
    const result = await login(formData);
    
    if (result?.error) {
        setError('Credenciales inválidas. Verifica email y contraseña.');
        setIsLoading(false);
    }
    // If success, the server action will redirect, so no need to set loading false manually
  };

  return (
    <div className="min-h-screen w-full bg-background flex items-center justify-center p-4">
      <div className="bg-surface w-full max-w-md rounded-xl shadow-xl border border-surface-dark/10 p-8">
        
        <div className="flex flex-col items-center mb-8">
            <div className="w-12 h-12 bg-primary/5 rounded-full flex items-center justify-center mb-4">
                <Lock className="w-6 h-6 text-primary" />
            </div>
            <h1 className="text-2xl font-black tracking-tighter text-primary">
              CANCHA <span className="text-success">LECONTE</span>
            </h1>
            <p className="text-secondary text-sm mt-1">Acceso administrativo</p>
        </div>

        <form action={handleSubmit} className="space-y-5">
          {error && (
            <div className="p-3 rounded-lg bg-danger/10 border border-danger/20 text-danger text-sm text-center">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-secondary mb-1">
              Email
            </label>
            <input 
              required
              name="email"
              type="email" 
              placeholder="admin@canchaleconte.com"
              className="w-full bg-background border border-surface-dark/20 rounded-lg p-3 text-primary placeholder:text-secondary/50 focus:ring-2 focus:ring-info outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary mb-1">
              Contraseña
            </label>
            <input 
              required
              name="password"
              type="password" 
              placeholder="••••••••"
              className="w-full bg-background border border-surface-dark/20 rounded-lg p-3 text-primary placeholder:text-secondary/50 focus:ring-2 focus:ring-info outline-none transition-all"
            />
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full py-3 bg-primary text-surface rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed mt-2"
          >
            {isLoading ? 'Ingresando...' : 'Iniciar Sesión'}
          </button>
        </form>
        
        <div className="mt-6 text-center">
            <p className="text-xs text-secondary/60">
                Solo personal autorizado.
            </p>
        </div>
      </div>
    </div>
  );
}
