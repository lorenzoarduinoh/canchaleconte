export enum MatchStatus {
  Open = 'Abierto',
  Full = 'Completo',
  Finished = 'Finalizado',
  Canceled = 'Cancelado'
}

export interface Player {
  id: string;
  name: string;
  phone: string;
  hasPaid: boolean;
  paymentMethod?: 'MercadoPago' | 'Cash';
}

export interface Match {
  id: string;
  name: string;
  date: string; // ISO String
  time: string;
  pricePerPlayer: number;
  maxPlayers: number;
  locationLink: string;
  status: MatchStatus;
  players: Player[];
  result?: string;
  comments?: string;
  mvp?: string; // "Lolo"
}

export interface DashboardStats {
  totalMatches: number;
  totalRevenue: number;
  totalGoals: number;
  activePlayers: number;
}