import { NextFunction, Request, Response } from 'express';

const safeMethods = new Set(['GET', 'HEAD', 'OPTIONS']);

function requestOrigin(req: Request): string | undefined {
  const origin = req.get('origin');
  if (origin) {
    try {
      const parsed = new URL(origin);
      if ((parsed.protocol === 'http:' || parsed.protocol === 'https:') && parsed.origin === origin) {
        return parsed.origin;
      }
    } catch {
      return undefined;
    }
    return undefined;
  }

  const referer = req.get('referer');
  if (!referer) return undefined;
  try {
    const parsed = new URL(referer);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:' ? parsed.origin : undefined;
  } catch {
    return undefined;
  }
}

/**
 * Cookie-authenticated browser writes must originate from an explicitly
 * configured site. Native clients that use bearer tokens are not affected.
 */
export function csrfProtection(allowedOrigins: ReadonlySet<string>) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (safeMethods.has(req.method.toUpperCase()) || !req.cookies?.token) return next();

    const origin = requestOrigin(req);
    if (origin && allowedOrigins.has(origin)) return next();

    return res.status(403).json({
      success: false,
      error: {
        code: 'CSRF_ORIGIN_REJECTED',
        message: 'Request origin is not allowed.'
      }
    });
  };
}
