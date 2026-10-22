const pino = require('pino');

// Structured JSON Logger with metadata
const logger = pino({
    level: process.env.LOG_LEVEL || 'info',
    timestamp: pino.stdTimeFunctions.isoTime,
    formatters: {
        level: (label) => ({ level: label.toUpperCase() }),
    },
    base: {
        service: 'instaatrim-api',
        env: process.env.NODE_ENV || 'production'
    }
});

module.exports = logger;
