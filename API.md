# API Documentation

## Overview

This document describes the API endpoints available in the Flight Tracker application.

## Base URL

```
http://localhost:3000/api
```

## Rate Limiting

All API endpoints are rate-limited:
- **Flights endpoint**: 100 requests per minute per IP
- **Predict endpoint**: 100 requests per minute per IP
- **Health endpoint**: 60 requests per minute per IP

Rate limit headers are included in all responses:
- `X-RateLimit-Limit`: Maximum requests allowed
- `X-RateLimit-Remaining`: Requests remaining in window
- `X-RateLimit-Reset`: Unix timestamp when limit resets

## Health Check

### GET /api/health

Check API health status.

**Response**

```json
{
  "status": "ok",
  "timestamp": 1710000000000
}
```

## Security Headers

All responses include security headers:
- `X-DNS-Prefetch-Control: on`
- `X-Frame-Options: SAMEORIGIN`
- `X-Content-Type-Options: nosniff`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: camera=(), microphone=(), geolocation=()`

## CORS

Cross-Origin Resource Sharing is configured for specific origins. See `ALLOWED_ORIGINS` environment variable.

## Error Responses

### 400 Bad Request

Invalid parameters or missing required fields.

```json
{
  "error": "Error description",
  "message": "Detailed error message"
}
```

### 429 Too Many Requests

Rate limit exceeded.

```json
{
  "error": "Too many requests",
  "retryAfter": 60
}
```

Headers:
- `Retry-After`: Seconds until rate limit resets

### 500 Internal Server Error

Server error.

```json
{
  "error": "Failed to fetch flights",
  "message": "An unexpected error occurred"
}
```

## Types

### Flight

```typescript
interface Flight {
  id: string;
  callsign: string;
  airline: string;
  origin: string;
  destination: string;
  departureTime?: string;
  arrivalTime?: string;
  status: 'scheduled' | 'boarding' | 'departed' | 'arrived' | 'delayed' | 'cancelled' | 'unknown';
  delayPrediction?: DelayPrediction;
}
```

### DelayPrediction

```typescript
interface DelayPrediction {
  percentage: number;      // 0-100
  riskLevel: 'low' | 'medium' | 'high';
  avgDelayMinutes: number;
  basedOnRecords: number;
}
```

### Airport

```typescript
interface Airport {
  icao: string;           // e.g., "LEMD"
  iata: string;            // e.g., "MAD"
  name: string;            // e.g., "Adolfo Suárez Madrid–Barajas Airport"
  city: string;            // e.g., "Madrid"
  country: string;         // e.g., "Spain"
}
```

## Supported Airports

The application supports all major Spanish airports including:

| ICAO | IATA | Name | City |
|------|------|------|------|
| LEMD | MAD | Adolfo Suárez Madrid–Barajas | Madrid |
| LEBL | BCN | Josep Tarradellas Barcelona–El Prat | Barcelona |
| LEMG | AGP | Málaga–Costa del Sol | Málaga |
| LIRF | FCO | Leonardo da Vinci–Fiumicino | Rome (Italy) |
| LEPA | PMI | Palma de Mallorca | Palma de Mallorca |
| LEXJ | SDR | Seve Ballesteros–Santander | Santander |
| LEAL | ALC | Alicante–Elche | Alicante |
| LEVC | VLC | Valencia | Valencia |
| GCLA | LPA | Gran Canaria | Las Palmas |
| GCXO | TFS | Tenerife Sur | Tenerife |

For the complete list, see `lib/airports.ts`.

## Future Endpoints

The following endpoints are planned for future releases:

- `GET /api/flights` - Fetch flights by airport
- `GET /api/predict` - Get delay prediction for specific parameters
- `GET /api/airports` - List all supported airports
