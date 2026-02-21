/**
 * FleetFlow — Role-Based Authorization Middleware
 *
 * Must always be used AFTER the `authenticate` middleware so req.user exists.
 *
 * Two exported helpers:
 *
 *  1. authorizeRole(role)
 *     Single-role guard. Matches the exact role string.
 *     Usage:
 *       router.get('/route', authenticate, authorizeRole('FleetManager'), controller);
 *
 *  2. authorize(...roles)
 *     Multi-role guard. Passes if the user has ANY of the listed roles.
 *     Usage:
 *       router.get('/route', authenticate, authorize('FleetManager', 'SafetyOfficer'), controller);
 *
 * Error codes returned:
 *   401 TOKEN_MISSING — authenticate() was not run before this middleware
 *   403 FORBIDDEN     — user is authenticated but their role is not permitted
 */

'use strict';

// Valid roles — mirrors the DB ENUM; used for upfront validation
const VALID_ROLES = [
    'FleetManager',
    'Dispatcher',
    'SafetyOfficer',
    'FinancialAnalyst',
];

// ── Internal factory ──────────────────────────────────────────────────────────
/**
 * Core middleware factory shared by both exported helpers.
 * @param {string[]} allowedRoles  Roles that are permitted through
 * @returns {Function}             Express middleware (req, res, next)
 */
function _buildRoleMiddleware(allowedRoles) {
    return function roleGuard(req, res, next) {

        // Safety-net: authenticate() must have run first
        if (!req.user) {
            return res.status(401).json({
                success: false,
                error: {
                    message: 'Authentication required. Please log in.',
                    code: 'TOKEN_MISSING',
                },
            });
        }

        // Check role membership
        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                error: {
                    message: `Access denied. This resource requires the role: ${allowedRoles.join(' or ')}.`,
                    code: 'FORBIDDEN',
                    requiredRoles: allowedRoles,
                    yourRole: req.user.role,
                },
            });
        }

        next();   // ✅ role is allowed — proceed
    };
}

// ── authorizeRole(role) ───────────────────────────────────────────────────────
/**
 * Single-role guard.
 * Returns 403 if req.user.role does not exactly match the given role.
 *
 * @param {string} role  One of: 'FleetManager' | 'Dispatcher' | 'SafetyOfficer' | 'FinancialAnalyst'
 * @returns {Function}   Express middleware
 *
 * @example
 *   router.delete('/vehicles/:id', authenticate, authorizeRole('FleetManager'), controller);
 */
function authorizeRole(role) {
    if (!VALID_ROLES.includes(role)) {
        throw new Error(
            `authorizeRole(): "${role}" is not a valid role. ` +
            `Valid roles are: ${VALID_ROLES.join(', ')}.`
        );
    }
    return _buildRoleMiddleware([role]);
}

// ── authorize(...roles) ───────────────────────────────────────────────────────
/**
 * Multi-role guard.
 * Returns 403 if req.user.role is not in the given list.
 *
 * @param  {...string} roles  One or more roles to allow
 * @returns {Function}        Express middleware
 *
 * @example
 *   router.get('/reports', authenticate, authorize('FleetManager', 'FinancialAnalyst'), controller);
 */
function authorize(...roles) {
    if (roles.length === 0) {
        throw new Error('authorize() requires at least one role argument.');
    }
    const invalid = roles.filter((r) => !VALID_ROLES.includes(r));
    if (invalid.length > 0) {
        throw new Error(
            `authorize(): Invalid role(s): ${invalid.join(', ')}. ` +
            `Valid roles are: ${VALID_ROLES.join(', ')}.`
        );
    }
    return _buildRoleMiddleware(roles);
}

module.exports = { authorizeRole, authorize, VALID_ROLES };
