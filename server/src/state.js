export const state = {
  queue: [],
  lobbies: new Map(),
  users: new Map(),
  matches: [],
  lobbyChats: new Map(),
};

// Initialize demo data for leaderboard when MongoDB is not available
state.users.set('ex1', { id: 'ex1', username: 'Phoenix', rank: 'Diamond', region: 'NA' });
state.users.set('ex2', { id: 'ex2', username: 'Viper', rank: 'Platinum', region: 'EU' });
state.users.set('ex3', { id: 'ex3', username: 'Shadow', rank: 'Gold', region: 'ASIA' });
state.users.set('ex4', { id: 'ex4', username: 'Blaze', rank: 'Gold', region: 'Global' });
state.users.set('ex5', { id: 'ex5', username: 'Storm', rank: 'Silver', region: 'EU' });
state.users.set('ex6', { id: 'ex6', username: 'Frost', rank: 'Silver', region: 'NA' });
state.users.set('ex7', { id: 'ex7', username: 'Ghost', rank: 'Bronze', region: 'ASIA' });
state.users.set('ex8', { id: 'ex8', username: 'Neon', rank: 'Bronze', region: 'Global' });

// Create some demo matches for the leaderboard
state.matches = [
  {
    players: [
      { userId: 'ex1', username: 'Phoenix' },
      { userId: 'ex2', username: 'Viper' },
      { userId: 'ex3', username: 'Shadow' },
      { userId: 'ex4', username: 'Blaze' }
    ]
  },
  {
    players: [
      { userId: 'ex1', username: 'Phoenix' },
      { userId: 'ex5', username: 'Storm' },
      { userId: 'ex6', username: 'Frost' }
    ]
  },
  {
    players: [
      { userId: 'ex2', username: 'Viper' },
      { userId: 'ex3', username: 'Shadow' },
      { userId: 'ex7', username: 'Ghost' },
      { userId: 'ex8', username: 'Neon' }
    ]
  },
  {
    players: [
      { userId: 'ex1', username: 'Phoenix' },
      { userId: 'ex4', username: 'Blaze' },
      { userId: 'ex5', username: 'Storm' }
    ]
  },
  {
    players: [
      { userId: 'ex2', username: 'Viper' },
      { userId: 'ex6', username: 'Frost' },
      { userId: 'ex7', username: 'Ghost' }
    ]
  }
];

export function publicLobby(lobby) {
  return {
    id: lobby.id,
    game: lobby.game,
    players: lobby.players.map((p) => ({
      userId: p.userId,
      username: p.username,
      team: p.team,
      ready: p.ready,
    })),
    createdAt: lobby.createdAt,
  };
}
