# Flight Tracker Spain

Monitor probable flight delays at Spanish airports. Check your flight before it happens and see the approximate probability of delay based on historical data.

![Flight Tracker](https://img.shields.io/badge/version-0.1.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Tests](https://img.shields.io/badge/tests-153%20passed-brightgreen.svg)

## Features

- Real-time flight tracking for Spanish airports
- Delay prediction based on historical statistics
- Dark mode support
- PWA support for mobile devices
- Accessible design (WCAG compliant)
- Rate limiting and security headers
- Comprehensive test coverage

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Data Fetching**: SWR
- **Database**: SQLite (via Prisma)
- **Flight Data**: OpenSky Network API
- **Testing**: Jest + Testing Library
- **E2E Testing**: Playwright

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/MiguelGonzalezAlvarez/Web-Flight-Delay-Tracker.git
cd flight-tracker

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env

# Push database schema
npm run db:push

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Environment Variables

Create a `.env` file with the following variables:

```env
# OpenSky Network API (optional - uses demo data if not set)
OPENSKY_USERNAME=your_username
OPENSKY_PASSWORD=your_password

# Redis URL for rate limiting (optional - uses in-memory store if not set)
REDIS_URL=redis://localhost:6379

# Allowed CORS origins (comma-separated)
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
```

## Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server

# Testing
npm test             # Run unit tests
npm run test:watch   # Run tests in watch mode
npm run test:coverage # Generate coverage report

# E2E Testing
npm run e2e:install  # Install Playwright browsers
npm run e2e          # Run E2E tests
npm run e2e:ui        # Run E2E tests with UI

# Database
npm run db:push      # Push schema changes to database
npm run db:studio    # Open Prisma Studio
```

## Project Structure

```
flight-tracker/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   └── health/        # Health check endpoint
│   ├── layout.tsx          # Root layout
│   └── page.tsx            # Home page
├── components/             # React components
│   ├── AirportSelector.tsx
│   ├── DelayIndicator.tsx
│   ├── FlightCard.tsx
│   ├── FlightDetail.tsx    # Modal with flight details
│   ├── FlightList.tsx      # Flight list with filtering
│   ├── FlightSearch.tsx
│   ├── LoadingSkeleton.tsx
│   ├── ThemeToggle.tsx     # Dark mode toggle
│   └── Toast.tsx
├── contexts/               # React contexts
│   └── ThemeContext.tsx    # Theme management
├── hooks/                  # Custom hooks
│   ├── useFlights.ts       # SWR data fetching
│   └── useFavorites.ts     # localStorage favorites
├── lib/                     # Utilities
│   ├── airports.ts         # Spanish airports data
│   ├── cors.ts             # CORS utilities
│   ├── delay-prediction.ts  # Delay calculation
│   ├── middleware/         # Security middleware
│   │   ├── rateLimit.ts    # Rate limiter
│   │   └── validation.ts   # Input validation
│   └── opensky.ts          # OpenSky API client
├── public/                  # Static assets
│   ├── icons/              # PWA icons
│   ├── manifest.json       # PWA manifest
│   └── sw.js               # Service worker
├── tests/                   # Test files
├── middleware.ts            # Security headers
└── prisma/                  # Database schema
```

## API Reference

### Health Check

```
GET /api/health
```

Response:
```json
{
  "status": "ok",
  "timestamp": 1710000000000
}
```

### Flight Data

Flights are fetched from the OpenSky Network API and enriched with delay predictions from historical data stored in SQLite.

For API documentation, see [API.md](./API.md).

## Features Explained

### Delay Prediction

The delay prediction system uses historical flight data stored in a SQLite database. Each prediction includes:

- **Percentage**: Probability of delay (0-100%)
- **Risk Level**: low, medium, or high
- **Average Delay**: Expected delay in minutes
- **Based On**: Number of historical records used

### Dark Mode

Toggle between light and dark themes. The preference is stored in localStorage and respects the system preference by default.

### PWA Support

Install the app on your mobile device for an app-like experience:

1. Open the app in your mobile browser
2. Tap "Add to Home Screen"
3. The app will work offline with cached data

## Testing

### Unit Tests

```bash
npm test
```

### E2E Tests

```bash
npm run e2e:install
npm run e2e
```

## Contributing

Please read [CONTRIBUTING.md](./CONTRIBUTING.md) for details on how to contribute.

## Changelog

See [CHANGELOG.md](./CHANGELOG.md) for version history.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [OpenSky Network](https://opensky-network.org/) for flight data
- [AENA](https://www.aena.es/) for airport information
- [Next.js](https://nextjs.org/) team for the framework
