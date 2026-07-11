type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogFields {
  [key: string]: unknown;
}

/**
 * Lightweight structured logger — ready for future APM / metrics / tracing sinks.
 * Does not couple business logic to a specific monitoring vendor.
 */
export function createLogger(scope: string) {
  const write = (level: LogLevel, event: string, fields?: LogFields): void => {
    const payload = {
      ts: new Date().toISOString(),
      level,
      scope,
      event,
      ...fields,
    };

    const line = JSON.stringify(payload);
    switch (level) {
      case 'error':
        console.error(line);
        break;
      case 'warn':
        console.warn(line);
        break;
      case 'debug':
        if (process.env.LOG_LEVEL === 'debug') {
          console.debug(line);
        }
        break;
      default:
        console.info(line);
    }
  };

  return {
    debug: (event: string, fields?: LogFields) => write('debug', event, fields),
    info: (event: string, fields?: LogFields) => write('info', event, fields),
    warn: (event: string, fields?: LogFields) => write('warn', event, fields),
    error: (event: string, fields?: LogFields) => write('error', event, fields),
    /**
     * Timing helper for future metrics integration.
     */
    timed<T>(event: string, fields: LogFields | undefined, fn: () => Promise<T>): Promise<T> {
      const started = Date.now();
      return fn()
        .then((result) => {
          write('info', event, { ...fields, durationMs: Date.now() - started, ok: true });
          return result;
        })
        .catch((err: unknown) => {
          write('error', event, {
            ...fields,
            durationMs: Date.now() - started,
            ok: false,
            error: err instanceof Error ? err.message : String(err),
          });
          throw err;
        });
    },
  };
}
