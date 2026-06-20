const admin = require('../firebase/index.js');

const decodeJwtPayload = (token) => {
  try {
    const payload = token.split('.')[1];
    const normalizedPayload = payload.replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(Buffer.from(normalizedPayload, 'base64').toString('utf8'));
  } catch (error) {
    return null;
  }
};

const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: 'Missing token' });
  }

  const rawToken = authHeader
    .trim()
    .replace(/^(bearer\s+)+/i, '')
    .replace(/^["']|["']$/g, '')
    .replace(/\s/g, '')
    .trim();

  const jwtMatch = rawToken.match(/[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/);
  const idToken = jwtMatch ? jwtMatch[0] : rawToken;

  if (!idToken || idToken.split('.').length !== 3) {
    return res.status(401).json({
      error: 'Invalid token format. Use the Firebase idToken only, not refreshToken or the full login response.'
    });
  }

  try {
    const decoded = await admin.auth().verifyIdToken(idToken);

    req.user = {
      uid: decoded.uid,
      email: decoded.email,
      name: decoded.name || decoded.email,
      avatarUrl: decoded.picture || null,
      phone: decoded.phone_number || null,
    };

    next();
  } catch (err) {
    const payload = decodeJwtPayload(idToken);
    console.error('Firebase token verification failed:', {
      code: err.code,
      message: err.message,
      tokenProject: payload?.aud,
      issuer: payload?.iss,
      expiresAt: payload?.exp ? new Date(payload.exp * 1000).toISOString() : null,
    });
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

module.exports = verifyToken;
