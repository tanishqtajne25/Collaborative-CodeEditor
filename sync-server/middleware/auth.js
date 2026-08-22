const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "collaborative-code-editor-secret-key-2026";

/**
 * Middleware requiring a valid JWT token
 */
function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ success: false, error: "Access denied. Authentication token required." });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, error: "Invalid or expired token." });
  }
}

/**
 * Optional auth middleware (attaches req.user if token is present and valid, otherwise continues)
 */
function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;
    } catch {
      // Ignore invalid token in optional auth
    }
  }

  next();
}

module.exports = {
  requireAuth,
  optionalAuth,
  JWT_SECRET,
};
