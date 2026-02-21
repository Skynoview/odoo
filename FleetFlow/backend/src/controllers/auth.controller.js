/**
 * FleetFlow — Auth Controller
 *
 * Handles authentication-related request/response logic.
 * All queries go through the shared MySQL connection pool.
 *
 * Exported handlers:
 *   register  — POST /api/auth/register
 *   login     — POST /api/auth/login
 */

'use strict';

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/database');

// ── Constants ─────────────────────────────────────────────────────────────────
const BCRYPT_SALT_ROUNDS = 12;  // OWASP recommended minimum

// Read JWT config once at startup — fail fast if secret is missing
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';

if (!JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined in environment variables.');
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Find a user by email — returns the full row (including hashed password)
 * so the login handler can run bcrypt.compare().
 */
async function findUserByEmail(email) {
    const [rows] = await pool.execute(
        `SELECT id, name, email, password, role, is_active
         FROM   users
         WHERE  email = ?
         LIMIT  1`,
        [email]
    );
    return rows[0];   // undefined when not found
}

// ── register ──────────────────────────────────────────────────────────────────
/**
 * POST /api/auth/register
 *
 * Body (JSON):
 *   { name, email, password, role? }
 *
 * Responses:
 *   201 — user created successfully
 *   409 — email already in use
 *   500 — unexpected server error
 */
async function register(req, res, next) {
    try {
        const {
            name,
            email,
            password,
            role = 'Dispatcher',       // default role if not supplied
        } = req.body;

        // ── 1. Email uniqueness check ─────────────────────────────────────────
        const existingUser = await findUserByEmail(email);
        if (existingUser) {
            return res.status(409).json({
                success: false,
                error: {
                    message: 'An account with this email already exists.',
                    code: 'EMAIL_ALREADY_EXISTS',
                    field: 'email',
                },
            });
        }

        // ── 2. Hash password ──────────────────────────────────────────────────
        const hashedPassword = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);

        // ── 3. Insert user ────────────────────────────────────────────────────
        const [result] = await pool.execute(
            `INSERT INTO users (name, email, password, role)
       VALUES (?, ?, ?, ?)`,
            [name.trim(), email, hashedPassword, role]
        );

        const newUserId = result.insertId;

        // ── 4. Fetch the created user (sans password) to return ───────────────
        const [newUserRows] = await pool.execute(
            `SELECT id, name, email, role, is_active, created_at
       FROM users
       WHERE id = ?
       LIMIT 1`,
            [newUserId]
        );

        const newUser = newUserRows[0];

        // ── 5. Respond ────────────────────────────────────────────────────────
        return res.status(201).json({
            success: true,
            message: 'Account registered successfully.',
            data: {
                user: newUser,
            },
        });

    } catch (err) {
        // MySQL duplicate-key error (race condition safety net)
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({
                success: false,
                error: {
                    message: 'An account with this email already exists.',
                    code: 'EMAIL_ALREADY_EXISTS',
                    field: 'email',
                },
            });
        }

        // Let the centralised error handler deal with everything else
        next(err);
    }
}

// ── login ─────────────────────────────────────────────────────────────────────
/**
 * POST /api/auth/login
 *
 * Body (JSON):
 *   { email, password }
 *
 * Responses:
 *   200 — authenticated; returns JWT token + user info
 *   401 — invalid credentials (intentionally generic to prevent enumeration)
 *   403 — account is disabled
 *   500 — unexpected server error
 */
async function login(req, res, next) {
    try {
        const { email, password } = req.body;

        // ── 1. Look up user ───────────────────────────────────────────────────
        const user = await findUserByEmail(email);

        // Always run bcrypt.compare even when user not found to prevent
        // timing-based user-enumeration attacks.
        const dummyHash = '$2b$12$invalidhashusedtopreventsidetimingenumeration00000';
        const passwordMatch = await bcrypt.compare(
            password,
            user ? user.password : dummyHash
        );

        if (!user || !passwordMatch) {
            return res.status(401).json({
                success: false,
                error: {
                    message: 'Invalid email or password.',
                    code: 'INVALID_CREDENTIALS',
                },
            });
        }

        // ── 2. Account active check ───────────────────────────────────────────
        if (!user.is_active) {
            return res.status(403).json({
                success: false,
                error: {
                    message: 'Your account has been disabled. Please contact an administrator.',
                    code: 'ACCOUNT_DISABLED',
                },
            });
        }

        // ── 3. Sign JWT ───────────────────────────────────────────────────────
        const payload = {
            sub: user.id,          // subject  — standard JWT claim
            name: user.name,
            email: user.email,
            role: user.role,
        };

        const token = jwt.sign(payload, JWT_SECRET, {
            expiresIn: JWT_EXPIRES_IN,
            algorithm: 'HS256',
        });

        // ── 4. Respond ────────────────────────────────────────────────────────
        return res.status(200).json({
            success: true,
            message: 'Login successful.',
            data: {
                token,
                expiresIn: JWT_EXPIRES_IN,
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                },
            },
        });

    } catch (err) {
        next(err);
    }
}

module.exports = { register, login };
