import { state, publicLobby } from '../state.js';

export async function getLobbyById(req, res) {
  const lobby = state.lobbies.get(req.params.id);
  if (!lobby) {
    return res.status(404).json({ error: 'Lobby not found' });
  }

  return res.json({ lobby: publicLobby(lobby) });
}
