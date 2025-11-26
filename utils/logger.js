const fs = require('fs');
const path = require('path');

/**
 * Simple logging utility
 */
class Logger {
  constructor() {
    this.logDir = path.join(__dirname, '../logs');
    this.ensureLogDirectory();
  }

  ensureLogDirectory() {
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  formatMessage(level, message, meta = {}) {
    const timestamp = new Date().toISOString();
    const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
    return `[${timestamp}] ${level.toUpperCase()}: ${message}${metaStr}`;
  }

  writeToFile(filename, message) {
    const logFile = path.join(this.logDir, filename);
    fs.appendFileSync(logFile, message + '\n');
  }

  info(message, meta = {}) {
    const formattedMessage = this.formatMessage('info', message, meta);
    console.log("\n",formattedMessage);
    this.writeToFile('app.log', formattedMessage);
  }

  error(message, meta = {}) {
    const formattedMessage = this.formatMessage('error', message, meta);
    console.error("\n",formattedMessage);
    this.writeToFile('error.log', formattedMessage);
  }

  warn(message, meta = {}) {
    const formattedMessage = this.formatMessage('warn', message, meta);
    console.warn("\n",formattedMessage);
    this.writeToFile('app.log', formattedMessage);
  }

  debug(message, meta = {}) {
    if ('development') {
      const formattedMessage = this.formatMessage('debug', message, meta);
      console.log("\n",formattedMessage);
      this.writeToFile('debug.log', formattedMessage);
    }
  }
}

module.exports = new Logger();
