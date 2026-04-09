'use client';

import { useState, useEffect, useCallback } from 'react';
import { AirportSelector, FlightList, FlightSearch } from '@/components';
import { Flight } from '@/types';
import { Plane, RefreshCw, Info } from 'lucide-react';
import { getAirportByIcao } from '@/lib/airports';
import { ErrorBoundary } from '@/components/ErrorBoundary';

export default function HomePage() {
  const [selectedAirport, setSelectedAirport] = useState('LEMD');
  const [flightType, setFlightType] = useState<'departures' | 'arrivals'>('departures');
  const [flights, setFlights] = useState<Flight[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [searchResult, setSearchResult] = useState<Flight | null>(null);
  const [error, setError] = useState<string | null>(null);

  const airport = getAirportByIcao(selectedAirport);

  const fetchFlights = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/flights?airport=${selectedAirport}&type=${flightType}`);

      if (!response.ok) {
        throw new Error(`Failed to fetch flights: ${response.statusText}`);
      }

      const data = await response.json();
      setFlights(data.flights || []);
      setLastUpdated(new Date());
    } catch (err) {
      setError('Unable to fetch flights. Please try again later.');
      setFlights([]);
    } finally {
      setLoading(false);
    }
  }, [selectedAirport, flightType]);

  const handleSearch = useCallback(async (callsign: string) => {
    setLoading(true);
    setError(null);
    setFlights([]);
    setSearchResult(null);

    try {
      const sanitizedCallsign = callsign.replace(/[^A-Z0-9]/gi, '').toUpperCase();
      const response = await fetch(`/api/flights?airport=${selectedAirport}&type=${flightType}`);

      if (!response.ok) {
        throw new Error('Failed to search flights');
      }

      const data = await response.json();
      const foundFlight = data.flights?.find((f: Flight) =>
        f.callsign.replace(/\s/g, '').toUpperCase().includes(sanitizedCallsign)
      );

      if (foundFlight) {
        setSearchResult(foundFlight);
      } else {
        setError(`No flight found with callsign: ${callsign}`);
      }
    } catch (err) {
      setError('Unable to search flight. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [selectedAirport, flightType]);

  useEffect(() => {
    fetchFlights();
  }, [fetchFlights]);

  useEffect(() => {
    const interval = setInterval(fetchFlights, 60000);
    return () => clearInterval(interval);
  }, [fetchFlights]);

  const formattedLastUpdated = lastUpdated
    ? lastUpdated.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
    : null;

  return (
    <ErrorBoundary>
      <div className="min-h-screen">
        <header className="bg-white border-b border-gray-200 sticky top-0 z-20">
          <div className="max-w-5xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
                  <Plane className="w-6 h-6 text-white" aria-hidden="true" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Flight Tracker Spain</h1>
                  <p className="text-sm text-gray-500">Monitor probable flight delays</p>
                </div>
              </div>
              {lastUpdated && (
                <div className="flex items-center gap-2 text-sm text-gray-500" aria-live="polite">
                  <RefreshCw className="w-4 h-4" aria-hidden="true" />
                  <span>Last updated: {formattedLastUpdated}</span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <AirportSelector
                value={selectedAirport}
                onChange={setSelectedAirport}
                label="Select Airport"
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" id="flight-type-label">
                  Flight Type
                </label>
                <div className="flex gap-2" role="group" aria-labelledby="flight-type-label">
                  <button
                    onClick={() => setFlightType('departures')}
                    aria-pressed={flightType === 'departures'}
                    className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
                      flightType === 'departures'
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Departures
                  </button>
                  <button
                    onClick={() => setFlightType('arrivals')}
                    aria-pressed={flightType === 'arrivals'}
                    className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
                      flightType === 'arrivals'
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Arrivals
                  </button>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-5xl mx-auto px-4 py-6">
          <div className="mb-6">
            <FlightSearch onSearch={handleSearch} loading={loading} />
          </div>

          {airport && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-100 rounded-lg" role="status">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-blue-600 mt-0.5" aria-hidden="true" />
                <div>
                  <h3 className="font-medium text-blue-900">{airport.name}</h3>
                  <p className="text-sm text-blue-700">
                    Showing {flightType} for {airport.city}.
                    Data provided by OpenSky Network.
                  </p>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-lg" role="alert">
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {searchResult && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Search Result</h2>
              <FlightList flights={[searchResult]} type={flightType === 'departures' ? 'departure' : 'arrival'} />
            </div>
          )}

          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              {flightType === 'departures' ? 'Departures' : 'Arrivals'}
              <span className="ml-2 text-sm font-normal text-gray-500">
                ({flights.length} flights)
              </span>
            </h2>
            <button
              onClick={fetchFlights}
              disabled={loading}
              className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
              aria-label="Refresh flights"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} aria-hidden="true" />
              Refresh
            </button>
          </div>

          <FlightList
            flights={flights}
            type={flightType === 'departures' ? 'departure' : 'arrival'}
            loading={loading}
            emptyMessage="No flights available at this time. Flights are typically available 2 hours before departure."
          />

          <div className="mt-8 p-6 bg-white border border-gray-200 rounded-xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">About Delay Predictions</h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              The delay probability shown is calculated based on historical flight data collected over time.
              Factors include airline performance, route patterns, and time of day. The prediction becomes
              more accurate as more data is collected for each specific flight pattern.
            </p>
            <div className="mt-4 grid grid-cols-3 gap-4 text-center">
              <div className="p-3 bg-green-50 rounded-lg">
                <p className="text-2xl font-bold text-green-600">Less than 20%</p>
                <p className="text-xs text-green-700">Low Risk</p>
              </div>
              <div className="p-3 bg-yellow-50 rounded-lg">
                <p className="text-2xl font-bold text-yellow-600">20-50%</p>
                <p className="text-xs text-yellow-700">Medium Risk</p>
              </div>
              <div className="p-3 bg-red-50 rounded-lg">
                <p className="text-2xl font-bold text-red-600">More than 50%</p>
                <p className="text-xs text-red-700">High Risk</p>
              </div>
            </div>
          </div>
        </main>

        <footer className="border-t border-gray-200 mt-12 py-6">
          <div className="max-w-5xl mx-auto px-4 text-center text-sm text-gray-500">
            <p>Flight Tracker Spain - Monitor probable flight delays</p>
            <p className="mt-1">Data provided by OpenSky Network</p>
          </div>
        </footer>
      </div>
    </ErrorBoundary>
  );
}
