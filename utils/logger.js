/**
 * Simple logging utility (console only, no file logging)
 */
class Logger {
  formatMessage(level, message, meta = {}) {
    const timestamp = new Date().toISOString();
    const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
    return `[${timestamp}] ${level.toUpperCase()}: ${message}${metaStr}`;
  }

  info(message, meta = {}) {
    const formattedMessage = this.formatMessage('info', message, meta);
    console.log("\n", formattedMessage);
  }

  error(message, meta = {}) {
    const formattedMessage = this.formatMessage('error', message, meta);
    console.error("\n", formattedMessage);
  }

  warn(message, meta = {}) {
    const formattedMessage = this.formatMessage('warn', message, meta);
    console.warn("\n", formattedMessage);
  }

  debug(message, meta = {}) {
    if ('development') {
      const formattedMessage = this.formatMessage('debug', message, meta);
      console.log("\n", formattedMessage);
    }
  }
}

module.exports = new Logger();
