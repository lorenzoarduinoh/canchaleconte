import { supabase } from './supabase';
import { Match, Player, MatchStatus } from '../types';

// Helper to map DB Match to Frontend Match
const mapMatchFromDB = (data: any): Match => ({
  id: data.id,
  name: data.name,
  date: data.date,
  time: data.time,
  pricePerPlayer: data.price_per_player,
  maxPlayers: data.max_players,
  locationLink: data.location_link,
  status: data.status as MatchStatus,
  result: data.result,
  team_a: data.team_a,
  team_b: data.team_b,
  score_a: data.score_a,
  score_b: data.score_b,
  mvp: data.mvp,
  comments: data.comments,
  players: data.players ? data.players.map(mapPlayerFromDB) : []
});

// Helper to map DB Player to Frontend Player
const mapPlayerFromDB = (data: any): Player => ({
  id: data.id,
  name: data.name,
  phone: data.phone,
  hasPaid: data.has_paid,
  paymentMethod: data.payment_method
});

export const matchService = {
  async getMatches(): Promise<Match[]> {
    const { data, error } = await supabase
      .from('matches')
      .select(`
        *,
        players (*)
      `)
      .order('date', { ascending: false });

    if (error) {
      console.error('Error fetching matches:', error);
      return [];
    }

    return data.map(mapMatchFromDB);
  },

  async getMatchById(matchId: string): Promise<Match | null> {
    const { data, error } = await supabase
      .from('matches')
      .select(`
        *,
        players (*)
      `)
      .eq('id', matchId)
      .single();

    if (error) {
      console.error('Error fetching match by id:', error);
      return null;
    }

    return mapMatchFromDB(data);
  },

  async createMatch(match: Omit<Match, 'id' | 'players' | 'status'>): Promise<Match | null> {
    const { data, error } = await supabase
      .from('matches')
      .insert([{
        name: match.name,
        date: match.date,
        time: match.time,
        price_per_player: match.pricePerPlayer,
        max_players: match.maxPlayers,
        location_link: match.locationLink,
        status: 'Abierto'
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating match:', error);
      return null;
    }

    return { ...mapMatchFromDB(data), players: [] };
  },

  async updateMatch(match: Match): Promise<boolean> {
    // 1. Update Match Details
    const { error: matchError } = await supabase
      .from('matches')
      .update({
        name: match.name,
        date: match.date,
        time: match.time,
        price_per_player: match.pricePerPlayer,
        max_players: match.maxPlayers,
        location_link: match.locationLink,
        status: match.status,
        result: match.result,
        team_a: match.team_a,
        team_b: match.team_b,
        score_a: match.score_a,
        score_b: match.score_b,
        mvp: match.mvp,
        comments: match.comments
      })
      .eq('id', match.id);

    if (matchError) {
      console.error('Error updating match:', matchError);
      return false;
    }

    return true;
  },

  async deleteMatch(matchId: string): Promise<boolean> {
    const { error } = await supabase
      .from('matches')
      .delete()
      .eq('id', matchId);

    if (error) {
      console.error('Error deleting match:', error);
      return false;
    }
    return true;
  },

  // Player/Participant Methods
  async addPlayer(matchId: string, player: Omit<Player, 'id' | 'hasPaid'>): Promise<Player | null> {
    const { data, error } = await supabase
      .from('players')
      .insert([{
        match_id: matchId,
        name: player.name,
        phone: player.phone,
        has_paid: false
      }])
      .select()
      .single();

    if (error) {
      console.error('Error adding player:', error);
      return null;
    }

    return mapPlayerFromDB(data);
  },

  async updatePlayerPayment(playerId: string, hasPaid: boolean): Promise<boolean> {
    const { error } = await supabase
      .from('players')
      .update({ has_paid: hasPaid })
      .eq('id', playerId);
    
    if (error) {
      console.error('Error updating payment:', error);
      return false;
    }
    return true;
  },

  async removePlayer(playerId: string): Promise<boolean> {
    const { error } = await supabase
      .from('players')
      .delete()
      .eq('id', playerId);

    if (error) {
      console.error('Error removing player:', error);
      return false;
    }
    return true;
  }
};
