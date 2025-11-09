const Sentry = require('@sentry/node');

const initSentry = (app) => {
  if (process.env.SENTRY_DSN) {
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      environment: process.env.NODE_ENV || 'development',
      tracesSampleRate: 0.1,
    });

    // Request handler must be the first middleware
    app.use(Sentry.Handlers.requestHandler());

    // Tracing handler
    app.use(Sentry.Handlers.tracingHandler());

    console.log('Sentry initialized');
  }
};

const sentryErrorHandler = () => {
  if (process.env.SENTRY_DSN) {
    return Sentry.Handlers.errorHandler();
  }
  return (err, req, res, next) => next(err);
};

module.exports = {
  initSentry,
  sentryErrorHandler,
};
