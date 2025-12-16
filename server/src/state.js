export const state = {
  queue: [],
  lobbies: new Map(),
  users: new Map(),
  matches: [],
  lobbyChats: new Map(),
};

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
