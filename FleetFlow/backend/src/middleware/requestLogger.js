/**
 * FleetFlow — Request Logger Middleware (Morgan wrapper)
 *
 * Uses "dev" format in development and "combined" (Apache-style) in production.
 * Easy to extend with a file transport if needed.
 */

'use strict';

const morgan = require('morgan');

const format = process.env.NODE_ENV === 'production' ? 'combined' : 'dev';

module.exports = morgan(format);
