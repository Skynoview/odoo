/**
 * FleetFlow — Express Application Entry Point
 *
 * Responsibilities:
 *  1. Load environment variables
 *  2. Create and configure the Express app
 *  3. Connect to MySQL and start the HTTP server
 *  4. Handle graceful shutdown on SIGTERM / SIGINT
 */

'use strict';

// ── 1. Load env before anything else ─────────────────────────────────────────
const dotenv = require('dotenv');
dotenv.config();

// ── 2. Core dependencies ──────────────────────────────────────────────────────
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// Internal
const { testConnection, closePool } = require('./config/database');
const requestLogger = require('./middleware/requestLogger');
const errorHandler = require('./middleware/errorHandler');
const apiRouter = require('./routes/index');

// ── 3. App instance ───────────────────────────────────────────────────────────
const app = express();
const PORT = parseInt(process.env.PORT, 10) || 5000;

// ── 4. Security & utility middleware ──────────────────────────────────────────
// Helmet — set secure HTTP headers
app.use(helmet());

// CORS — allow specified origins
const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:5173')
    .split(',')
    .map((o) => o.trim());

app.use(
    cors({
        origin: (origin, callback) => {
            // Allow requests with no origin (e.g., curl, mobile apps) in dev
            if (!origin || allowedOrigins.includes(origin)) {
                callback(null, true);
            } else {
                callback(new Error(`CORS policy: origin ${origin} not allowed`));
            }
        },
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
        credentials: true,
    })
);

// Rate limiting — global limiter
app.use(
    rateLimit({
        windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000,
        max: parseInt(process.env.RATE_LIMIT_MAX, 10) || 100,
        standardHeaders: true,
        legacyHeaders: false,
        message: {
            success: false,
            error: { message: 'Too many requests — please try again later.' },
        },
    })
);

// Request logger
app.use(requestLogger);

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ── 5. API routes ─────────────────────────────────────────────────────────────
app.use('/api', apiRouter);

// Catch-all for unknown routes
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: { message: `Route not found: ${req.method} ${req.originalUrl}` },
    });
});

// ── 6. Error handler (must be last) ──────────────────────────────────────────
app.use(errorHandler);

// ── 7. Start server ───────────────────────────────────────────────────────────
async function startServer() {
    // Try DB — warn but do NOT crash if unavailable (useful during development)
    try {
        await testConnection();
    } catch (err) {
        console.warn('\n⚠️   MySQL unavailable — server will start WITHOUT database.');
        console.warn('    Fix your credentials in backend/.env, then restart.\n');
    }

    const server = app.listen(PORT, () => {
        console.log(`\n🚀  FleetFlow API server running`);
        console.log(`   ➜  Environment : ${process.env.NODE_ENV || 'development'}`);
        console.log(`   ➜  Local       : http://localhost:${PORT}`);
        console.log(`   ➜  Health      : http://localhost:${PORT}/api/health\n`);
    });

    // ── 8. Graceful shutdown ──────────────────────────────────────────────────
    const shutdown = async (signal) => {
        console.log(`\n⚠️   Received ${signal}. Shutting down gracefully…`);
        server.close(async () => {
            await closePool();
            console.log('👋  Server closed. Goodbye!');
            process.exit(0);
        });
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
}

startServer();
