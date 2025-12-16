import jwt from 'jsonwebtoken';

export function requireAuth(req, res, next) {
  const auth = req.headers.authorization || '';
  const [, token] = auth.split(' ');

  if (!token) {
    return res.status(401).json({ error: 'missing token' });
  }

  const secret = process.env.JWT_SECRET || 'dev_secret_change_me';

  try {
    const decoded = jwt.verify(token, secret);
    req.user = { id: decoded.userId, username: decoded.username };
    next();
  } catch {
    return res.status(401).json({ error: 'invalid token' });
  }
}
