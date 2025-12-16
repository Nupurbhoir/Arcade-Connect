import { state } from '../state.js';

export async function getQueueStats(req, res) {
  const byGame = {};
  for (const p of state.queue) {
    byGame[p.game] = (byGame[p.game] || 0) + 1;
  }

  res.json({
    length: state.queue.length,
    byGame,
  });
}
