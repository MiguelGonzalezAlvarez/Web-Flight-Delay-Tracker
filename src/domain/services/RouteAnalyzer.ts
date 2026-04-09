import { Flight } from '../entities/Flight';
import { Airport } from '../entities/Airport';
import { Route } from '../entities/Route';
import { FlightRepository } from '../repositories/FlightRepository';
import { AirportRepository } from '../repositories/AirportRepository';

export interface RouteInfo {
  route: string;
  flightCount: number;
  origin: string;
  destination: string;
  isPopular: boolean;
  isDomestic: boolean;
  isInterIsland: boolean;
}

export interface HubAnalysis {
  airport: Airport;
  totalFlights: number;
  destinations: string[];
  origins: string[];
  uniqueRoutes: number;
  isHub: boolean;
}

export class RouteAnalyzer {
  constructor(
    private readonly flightRepository: FlightRepository,
    private readonly airportRepository: AirportRepository
  ) {}

  async analyzeRoute(origin: string, destination: string): Promise<RouteInfo> {
    const results = await this.flightRepository.findByRoute(origin, destination);
    const route = Route.createUnsafe({ origin, destination });

    return {
      route: route.toString(),
      flightCount: results.length,
      origin,
      destination,
      isPopular: results.length >= 10,
      isDomestic: route.isDomestic(),
      isInterIsland: route.isInterIsland(),
    };
  }

  async findPopularRoutes(limit: number = 10): Promise<RouteInfo[]> {
    const allFlights = await this.flightRepository.findAll();
    const routeCounts: Record<string, { origin: string; destination: string; count: number }> = {};

    for (const result of allFlights) {
      if (!result.ok) continue;

      const flight = result.value;
      const origin = flight.origin.toString();
      const destination = flight.destination.toString();
      const key = `${origin}-${destination}`;

      if (!routeCounts[key]) {
        routeCounts[key] = { origin, destination, count: 0 };
      }
      routeCounts[key].count++;
    }

    const sortedRoutes = Object.values(routeCounts)
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);

    return sortedRoutes.map((r) => ({
      route: `${r.origin} → ${r.destination}`,
      flightCount: r.count,
      origin: r.origin,
      destination: r.destination,
      isPopular: r.count >= 10,
      isDomestic: r.origin.slice(0, 2) === r.destination.slice(0, 2),
      isInterIsland:
        (r.origin.startsWith('LE') && r.destination.startsWith('GC')) ||
        (r.origin.startsWith('GC') && r.destination.startsWith('LE')),
    }));
  }

  async analyzeHubConnections(airportIcao: string): Promise<HubAnalysis | null> {
    const airportResult = await this.airportRepository.findByIcao(airportIcao);
    if (!airportResult) {
      return null;
    }

    const departures = await this.flightRepository.findByOrigin(airportIcao);
    const arrivals = await this.flightRepository.findByDestination(airportIcao);

    const destinations = new Set<string>();
    const origins = new Set<string>();

    for (const result of departures) {
      if (result.ok) {
        destinations.add(result.value.destination.toString());
      }
    }

    for (const result of arrivals) {
      if (result.ok) {
        origins.add(result.value.origin.toString());
      }
    }

    const uniqueRoutes = destinations.size + origins.size;
    const isHub = uniqueRoutes >= 10;
    const airport = (airportResult as { ok: true; value: Airport }).value;

    return {
      airport,
      totalFlights: departures.length + arrivals.length,
      destinations: Array.from(destinations),
      origins: Array.from(origins),
      uniqueRoutes,
      isHub,
    };
  }

  async findRoutesByAirline(airline: string): Promise<RouteInfo[]> {
    const allFlights = await this.flightRepository.findAll();
    const airlineRoutes: Record<string, { origin: string; destination: string; count: number }> = {};

    for (const result of allFlights) {
      if (!result.ok) continue;

      const flight = result.value;
      if (flight.airline !== airline) continue;

      const origin = flight.origin.toString();
      const destination = flight.destination.toString();
      const key = `${origin}-${destination}`;

      if (!airlineRoutes[key]) {
        airlineRoutes[key] = { origin, destination, count: 0 };
      }
      airlineRoutes[key].count++;
    }

    return Object.values(airlineRoutes).map((r) => ({
      route: `${r.origin} → ${r.destination}`,
      flightCount: r.count,
      origin: r.origin,
      destination: r.destination,
      isPopular: r.count >= 5,
      isDomestic: r.origin.slice(0, 2) === r.destination.slice(0, 2),
      isInterIsland: false,
    }));
  }
}
