/**
 * FleetFlow — JWT Authentication Middleware
 *
 * Verifies the Bearer token from the Authorization header,
 * decodes the payload, and attaches it to req.user so
 * downstream controllers can access userId, name, email, role.
 *
 * Usage (single route):
 *   router.get('/protected', authenticate, controller);
 *
 * Usage (all routes in a router):
 *   router.use(authenticate);
 *
 * Error codes returned:
 *   401 TOKEN_MISSING      — No Authorization header / no Bearer token
 *   401 TOKEN_EXPIRED      — Valid token but past expiry (jwt.verify throws TokenExpiredError)
 *   401 TOKEN_INVALID      — Signature mismatch, malformed, or other jwt error
 */

'use strict';

const jwt = require('jsonwebtoken');

// Read once at module load — same value used in auth.controller.js
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined. Check your .env file.');
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Extract the raw token string from the Authorization header.
 * Expects the format:  Authorization: Bearer <token>
 * Returns null if the header is absent or malformed.
 */
function extractBearerToken(req) {
    const authHeader = req.headers['authorization'] || req.headers['Authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return null;
    }
    return authHeader.slice(7).trim();   // remove "Bearer " prefix
}

// ── Middleware ────────────────────────────────────────────────────────────────

function authenticate(req, res, next) {
    // 1. Extract token
    const token = extractBearerToken(req);

    if (!token) {
        return res.status(401).json({
            success: false,
            error: {
                message: 'Access denied. No token provided.',
                code: 'TOKEN_MISSING',
            },
        });
    }

    // 2. Verify token
    try {
        const decoded = jwt.verify(token, JWT_SECRET, {
            algorithms: ['HS256'],   // pin algorithm — reject alg:none attacks
        });

        // 3. Attach decoded payload to request
        //    Shape: { sub, name, email, role, iat, exp }
        req.user = {
            id: decoded.sub,
            name: decoded.name,
            email: decoded.email,
            role: decoded.role,
        };

        next();   // proceed to the next middleware / controller

    } catch (err) {

        // Token is valid JWT but has passed its expiry time
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                error: {
                    message: 'Token has expired. Please log in again.',
                    code: 'TOKEN_EXPIRED',
                    expiredAt: err.expiredAt,
                },
            });
        }

        // Signature mismatch, malformed string, wrong algorithm, etc.
        return res.status(401).json({
            success: false,
            error: {
                message: 'Invalid token. Please log in again.',
                code: 'TOKEN_INVALID',
            },
        });
    }
}

module.exports = authenticate;
