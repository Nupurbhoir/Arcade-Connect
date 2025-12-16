import { state } from '../state.js';

export async function getMyMatches(req, res) {
  const userId = req.user?.id;

  const matches = state.matches
    .filter((m) => m.players.some((p) => p.userId === userId))
    .sort((a, b) => (a.startedAt < b.startedAt ? 1 : -1))
    .slice(0, 50);

  return res.json({ matches });
}
