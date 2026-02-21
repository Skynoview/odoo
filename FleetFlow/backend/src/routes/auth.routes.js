/**
 * FleetFlow — Auth Routes
 *
 * Base path (mounted in routes/index.js): /api/auth
 *
 * Endpoints:
 *   POST /api/auth/register  — create a new user account
 *   POST /api/auth/login     — authenticate user and return JWT
 *   GET  /api/auth/me        — return current user (protected)
 */

'use strict';

const express = require('express');
const { registerValidator, loginValidator } = require('../validators/auth.validator');
const validate = require('../middleware/validate');
const authenticate = require('../middleware/authenticate');
const { authorizeRole } = require('../middleware/authorize');
const { register, login } = require('../controllers/auth.controller');

const router = express.Router();

// ── POST /api/auth/register ───────────────────────────────────────────────────
//   1. registerValidator  — sanitise & validate request body
//   2. validate           — halt with 422 if any rule failed
//   3. register           — controller: hash → insert → respond
router.post(
    '/register',
    registerValidator,
    validate,
    register
);

// ── POST /api/auth/login ──────────────────────────────────────────────────────
//   1. loginValidator — sanitise & validate request body
//   2. validate       — halt with 422 if any rule failed
//   3. login          — controller: lookup → bcrypt compare → sign JWT → respond
router.post('/login', loginValidator, validate, login);

// ── GET /api/auth/me ───────────────────────────────────────────────────────
//   Protected: requires a valid Bearer token.
//   Returns the decoded token payload (req.user) — no DB hit needed.
router.get('/me', authenticate, (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Token is valid.',
        data: {
            user: req.user,
        },
    });
});

// ── GET /api/auth/me/fleet-manager-only ──────────────────────────────────────
//   Protected + role-gated using authorizeRole('FleetManager').
//   Only users whose JWT role === 'FleetManager' can proceed.
router.get(
    '/me/fleet-manager-only',
    authenticate,
    authorizeRole('FleetManager'),
    (req, res) => {
        res.status(200).json({
            success: true,
            message: 'Welcome, Fleet Manager! You have full access.',
            data: { user: req.user },
        });
    }
);

// ── GET /api/auth/me/dispatcher-only ─────────────────────────────────────────
router.get(
    '/me/dispatcher-only',
    authenticate,
    authorizeRole('Dispatcher'),
    (req, res) => {
        res.status(200).json({
            success: true,
            message: 'Welcome, Dispatcher!',
            data: { user: req.user },
        });
    }
);

// ── GET /api/auth/me/safety-officer-only ─────────────────────────────────────
router.get(
    '/me/safety-officer-only',
    authenticate,
    authorizeRole('SafetyOfficer'),
    (req, res) => {
        res.status(200).json({
            success: true,
            message: 'Welcome, Safety Officer!',
            data: { user: req.user },
        });
    }
);

// ── GET /api/auth/me/analyst-only ────────────────────────────────────────────
router.get(
    '/me/analyst-only',
    authenticate,
    authorizeRole('FinancialAnalyst'),
    (req, res) => {
        res.status(200).json({
            success: true,
            message: 'Welcome, Financial Analyst!',
            data: { user: req.user },
        });
    }
);


// Future:
// router.post('/logout',          authenticate,               logout);
// router.post('/refresh-token',                             refreshToken);
// router.post('/forgot-password', forgotPasswordValidator, validate, forgotPassword);

module.exports = router;
