import useSWR from 'swr';
import { Flight } from '@/types';

interface FlightsResponse {
  airport: string;
  type: string;
  count: number;
  flights: Flight[];
}

interface UseFlightsOptions {
  airport: string;
  type: 'departures' | 'arrivals';
  refreshInterval?: number;
  revalidateOnFocus?: boolean;
  dedupingInterval?: number;
}

interface UseFlightsReturn {
  flights: Flight[];
  isLoading: boolean;
  isValidating: boolean;
  error: Error | null;
  mutate: () => void;
  lastUpdated: Date | null;
}

const fetcher = async (url: string): Promise<FlightsResponse> => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch flights: ${response.statusText}`);
  }
  return response.json();
};

export function useFlights({
  airport,
  type,
  refreshInterval = 120000,
  revalidateOnFocus = true,
  dedupingInterval = 5000,
}: UseFlightsOptions): UseFlightsReturn {
  const key = `/api/flights?airport=${airport}&type=${type}`;

  const { data, error, isLoading, isValidating, mutate } = useSWR<FlightsResponse>(
    key,
    fetcher,
    {
      refreshInterval,
      revalidateOnFocus,
      revalidateOnReconnect: true,
      dedupingInterval,
      fallbackData: {
        airport,
        type,
        count: 0,
        flights: [],
      },
    }
  );

  return {
    flights: data?.flights || [],
    isLoading,
    isValidating,
    error: error as Error | null,
    mutate,
    lastUpdated: data ? new Date() : null,
  };
}

export function useFlightSearch(
  airport: string,
  type: 'departures' | 'arrivals',
  callsign: string
) {
  const key = callsign ? `/api/flights?airport=${airport}&type=${type}` : null;

  const { data, error, isLoading } = useSWR<FlightsResponse>(
    key,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 10000,
    }
  );

  const foundFlight = data?.flights?.find((f: Flight) =>
    f.callsign.replace(/\s/g, '').toUpperCase().includes(callsign.toUpperCase())
  );

  return {
    flight: foundFlight || null,
    isLoading,
    error: error as Error | null,
  };
}
