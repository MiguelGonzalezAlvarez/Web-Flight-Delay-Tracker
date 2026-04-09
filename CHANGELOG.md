# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2026-04-09

### Added

#### Phase 1: Testing Coverage
- Comprehensive test suite with 143 unit tests
- API route tests
- Middleware tests
- Component tests
- Library function tests

#### Phase 2: Accessibility & UX
- Skip-to-content link for keyboard navigation
- Focus indicators with CSS
- ARIA attributes (meter, progressbar roles)
- LoadingSkeleton components for async states
- Toast notification system
- Dark mode preparation in Tailwind config

#### Phase 3: Performance
- SWR integration for data fetching
- useFlights hook with caching
- stale-while-revalidate headers
- Reduced polling interval to 120s

#### Phase 4: Dark Mode
- ThemeContext with localStorage persistence
- ThemeToggle component with sun/moon icons
- Dark mode classes for all components
- Flash prevention script in layout

#### Phase 5: Security
- Security headers middleware (X-Frame-Options, XSS protection, etc.)
- RateLimiter class with Redis support and in-memory fallback
- CORS utilities with origin validation
- Input sanitization functions
- API utility helpers (withRateLimit HOC)
- Health endpoint (/api/health)
- Security tests (162 total tests)

#### Phase 6: Feature Enhancements
- FlightDetail modal component
- Airline filter in FlightList
- useFavorites hook for localStorage-based favorites
- PWA manifest and service worker
- SVG icons for PWA
- Clickable FlightCard to open details

#### Phase 7: Documentation
- README.md with comprehensive documentation
- API.md with API reference
- CONTRIBUTING.md with contribution guidelines
- CHANGELOG.md

### Components

- `AirportSelector` - Airport dropdown with search
- `DelayIndicator` - Delay probability display
- `DelayBar` - Progress bar visualization
- `FlightCard` - Individual flight display
- `FlightDetail` - Modal with full flight details
- `FlightList` - List with airline filtering
- `FlightSearch` - Callsign search form
- `LoadingSkeleton` - Skeleton loaders
- `ThemeToggle` - Dark/light mode switch
- `Toast` - Notification system
- `ErrorBoundary` - Error handling

### Hooks

- `useFlights` - SWR-based flight data fetching
- `useFlightSearch` - Callsign search
- `useFavorites` - localStorage favorites management
- `useTheme` - Theme state management

### APIs

- `GET /api/health` - Health check endpoint

### Dependencies

- Next.js 15.1.6
- React 19.0.0
- TypeScript 5.7.3
- Tailwind CSS 3.4.17
- SWR 2.4.1
- Prisma 6.5.0
- Lucide React 0.474.0
- date-fns 4.1.0

### Dev Dependencies

- Jest 30.3.0
- Testing Library 16.3.2
- Playwright 1.59.1
- ESLint 9.19.0

## [Unreleased]

### Planned Features

- API endpoints for flights and predictions
- Real-time WebSocket updates
- Airport favorites
- Push notifications for delays
- Mobile app (React Native)
- Multi-language support

### Known Issues

- None

## Migration Guides

### Upgrading from 0.0.x to 0.1.0

1. Run `npm install` to update dependencies
2. Update environment variables (see README.md)
3. Run `npm run db:push` to update database schema
4. Review breaking changes in components

---

Last updated: 2026-04-09
