const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS?.split(',') || [
  'http://localhost:3000',
  'http://localhost:3001',
];

const ALLOWED_METHODS = ['GET', 'POST', 'OPTIONS'];
const ALLOWED_HEADERS = ['Content-Type', 'Authorization', 'X-Requested-With'];

export interface CorsOptions {
  origin?: string;
  methods?: string[];
  headers?: string[];
  credentials?: boolean;
  maxAge?: number;
}

export function getCorsHeaders(request: Request, options: CorsOptions = {}): Record<string, string> {
  const origin = request.headers.get('Origin');
  const allowedOrigin = getAllowedOrigin(origin);

  const headers: Record<string, string> = {
    'Access-Control-Allow-Origin': allowedOrigin || '',
    'Access-Control-Allow-Methods': (options.methods || ALLOWED_METHODS).join(', '),
    'Access-Control-Allow-Headers': (options.headers || ALLOWED_HEADERS).join(', '),
    'Access-Control-Max-Age': String(options.maxAge || 86400),
  };

  if (options.credentials !== false) {
    headers['Access-Control-Allow-Credentials'] = 'true';
  }

  return headers;
}

function getAllowedOrigin(origin: string | null): string | null {
  if (!origin) return null;
  if (ALLOWED_ORIGINS.includes(origin)) return origin;
  if (process.env.NODE_ENV === 'development') return origin;
  return null;
}

export function isCorsPreflightRequest(request: Request): boolean {
  return request.method === 'OPTIONS' && request.headers.has('Access-Control-Request-Method');
}
