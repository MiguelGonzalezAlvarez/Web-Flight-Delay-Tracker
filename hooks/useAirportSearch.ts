import { useMemo } from 'react';
import { Airport as DomainAirport } from '@/src/domain/entities/Airport';
import { Airport } from '@/types';

export interface UseAirportHelpersResult {
  airport: DomainAirport | null;
  isSpanish: boolean;
  isMajor: boolean;
  displayCode: string;
  location: string;
  matches: (query: string) => boolean;
}

export function useAirportHelpers(dto: Airport | undefined): UseAirportHelpersResult {
  return useMemo(() => {
    if (!dto) {
      return {
        airport: null,
        isSpanish: false,
        isMajor: false,
        displayCode: '-',
        location: '-',
        matches: () => false,
      };
    }

    const result = DomainAirport.create({
      icao: dto.icao,
      iata: dto.iata,
      name: dto.name,
      city: dto.city,
    });

    const airport = result.ok ? result.value : null;

    return {
      airport,
      isSpanish: airport?.isSpanish() ?? false,
      isMajor: airport?.isMajor() ?? false,
      displayCode: airport?.getDisplayCode() ?? '-',
      location: airport?.getLocation() ?? '-',
      matches: (query: string) => airport?.matches(query) ?? false,
    };
  }, [dto]);
}

export function useAirportSearch(airports: Airport[], query: string): Airport[] {
  return useMemo(() => {
    const trimmedQuery = query.toLowerCase().trim();
    if (!trimmedQuery) return airports;

    return airports.filter(airport => {
      const icaoMatch = airport.icao.toLowerCase().includes(trimmedQuery);
      const iataMatch = airport.iata.toLowerCase().includes(trimmedQuery);
      const nameMatch = airport.name.toLowerCase().includes(trimmedQuery);
      const cityMatch = airport.city.toLowerCase().includes(trimmedQuery);
      return icaoMatch || iataMatch || nameMatch || cityMatch;
    });
  }, [airports, query]);
}

export function useSpanishAirports(airports: Airport[]): Airport[] {
  return useMemo(() => {
    return airports.filter(airport => {
      const icao = airport.icao.toUpperCase();
      return icao.startsWith('LE') || icao.startsWith('GC');
    });
  }, [airports]);
}

export function useMajorAirports(airports: Airport[]): Airport[] {
  const MAJOR_ICAOS = [
    'LEMD', 'LEBL', 'LEAL', 'LEMG', 'LEVX', 'LEIB', 'LEPA', 'LEZL',
    'LEBB', 'LEST', 'GCXO', 'GCTS', 'GCRR', 'GCLP', 'LEFA'
  ];

  return useMemo(() => {
    return airports.filter(airport => MAJOR_ICAOS.includes(airport.icao));
  }, [airports]);
}
