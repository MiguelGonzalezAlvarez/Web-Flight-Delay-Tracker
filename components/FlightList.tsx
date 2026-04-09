'use client';

import { useState, useMemo } from 'react';
import { Flight } from '@/types';
import { FlightCard } from './FlightCard';
import { FlightDetail } from './FlightDetail';
import { Plane, Loader2, Filter, X } from 'lucide-react';

interface FlightListProps {
  flights: Flight[];
  type: 'departure' | 'arrival';
  loading?: boolean;
  emptyMessage?: string;
}

export function FlightList({ flights, type, loading, emptyMessage }: FlightListProps) {
  const [selectedFlight, setSelectedFlight] = useState<Flight | null>(null);
  const [airlineFilter, setAirlineFilter] = useState<string>('');
  const [showFilter, setShowFilter] = useState(false);

  const airlines = useMemo(() => {
    const airlineSet = new Set(flights.map(f => f.airline).filter(Boolean));
    return Array.from(airlineSet).sort();
  }, [flights]);

  const filteredFlights = useMemo(() => {
    if (!airlineFilter) return flights;
    return flights.filter(f => f.airline === airlineFilter);
  }, [flights, airlineFilter]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-gray-400 dark:text-gray-500">
        <Loader2 className="w-8 h-8 animate-spin mb-3" />
        <span>Loading flights...</span>
      </div>
    );
  }

  if (flights.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-gray-400 dark:text-gray-500">
        <Plane className="w-8 h-8 mb-3" />
        <span>{emptyMessage || 'No flights found'}</span>
      </div>
    );
  }

  return (
    <>
      {airlines.length > 1 && (
        <div className="mb-4">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowFilter(!showFilter)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors ${
                showFilter || airlineFilter
                  ? 'bg-primary-50 dark:bg-primary-900/30 border-primary-300 dark:border-primary-600 text-primary-700 dark:text-primary-300'
                  : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-gray-400 dark:hover:border-gray-500'
              }`}
            >
              <Filter className="w-4 h-4" />
              <span className="text-sm font-medium">Filter by airline</span>
            </button>
            {airlineFilter && (
              <button
                type="button"
                onClick={() => setAirlineFilter('')}
                className="flex items-center gap-1 px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                <span className="text-sm">{airlineFilter}</span>
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {showFilter && (
            <div className="mt-2 p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-48 overflow-y-auto">
              <div className="space-y-1">
                {airlines.map(airline => (
                  <button
                    key={airline}
                    type="button"
                    onClick={() => {
                      setAirlineFilter(airline);
                      setShowFilter(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                      airlineFilter === airline
                        ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                        : 'hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {airline}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="space-y-3">
        {filteredFlights.map((flight) => (
          <FlightCard
            key={flight.id}
            flight={flight}
            type={type}
            onClick={() => setSelectedFlight(flight)}
          />
        ))}
      </div>

      {filteredFlights.length === 0 && airlineFilter && (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <p>No flights found for {airlineFilter}</p>
        </div>
      )}

      {selectedFlight && (
        <FlightDetail
          flight={selectedFlight}
          type={type}
          onClose={() => setSelectedFlight(null)}
        />
      )}
    </>
  );
}
