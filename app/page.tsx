'use client';

import { useState, useCallback } from 'react';
import { AirportSelector, FlightList, FlightSearch, ToastContainer, useToast } from '@/components';
import { Plane, RefreshCw, Info } from 'lucide-react';
import { getAirportByIcao } from '@/lib/airports';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { useFlights } from '@/hooks';
import { Flight } from '@/types';

export default function HomePage() {
  const [selectedAirport, setSelectedAirport] = useState('LEMD');
  const [flightType, setFlightType] = useState<'departures' | 'arrivals'>('departures');
  const [searchCallsign, setSearchCallsign] = useState('');
  const [searchResult, setSearchResult] = useState<Flight | null>(null);
  const { toasts, dismissToast, success, error: showError } = useToast();

  const airport = getAirportByIcao(selectedAirport);

  const {
    flights,
    isLoading,
    isValidating,
    mutate,
    lastUpdated,
  } = useFlights({
    airport: selectedAirport,
    type: flightType,
    refreshInterval: 120000,
    revalidateOnFocus: true,
    dedupingInterval: 5000,
  });

  const handleRefresh = useCallback(async () => {
    await mutate();
    success('Flights refreshed');
  }, [mutate, success]);

  const handleSearch = useCallback((callsign: string) => {
    const sanitizedCallsign = callsign.replace(/[^A-Z0-9]/gi, '').toUpperCase();
    
    const foundFlight = flights.find((f: Flight) =>
      f.callsign.replace(/\s/g, '').toUpperCase().includes(sanitizedCallsign)
    );

    if (foundFlight) {
      setSearchResult(foundFlight);
      setSearchCallsign(callsign);
      success(`Found flight: ${foundFlight.callsign}`);
    } else {
      setSearchResult(null);
      setSearchCallsign('');
      showError(`No flight found with callsign: ${callsign}`);
    }
  }, [flights, success, showError]);

  const handleAirportChange = useCallback((icao: string) => {
    setSelectedAirport(icao);
    setSearchResult(null);
    setSearchCallsign('');
  }, []);

  const handleFlightTypeChange = useCallback((type: 'departures' | 'arrivals') => {
    setFlightType(type);
    setSearchResult(null);
    setSearchCallsign('');
  }, []);

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
                  <RefreshCw className={`w-4 h-4 ${isValidating ? 'animate-spin' : ''}`} aria-hidden="true" />
                  <span>Updated: {formattedLastUpdated}</span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <AirportSelector
                value={selectedAirport}
                onChange={handleAirportChange}
                label="Select Airport"
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" id="flight-type-label">
                  Flight Type
                </label>
                <div className="flex gap-2" role="group" aria-labelledby="flight-type-label">
                  <button
                    onClick={() => handleFlightTypeChange('departures')}
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
                    onClick={() => handleFlightTypeChange('arrivals')}
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

        <main id="main-content" className="max-w-5xl mx-auto px-4 py-6">
          <div className="mb-6">
            <FlightSearch onSearch={handleSearch} loading={isLoading} />
          </div>

          {airport && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg" role="status">
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

          {searchResult && (
            <div className="mb-6 animate-fade-in">
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
              onClick={handleRefresh}
              disabled={isLoading || isValidating}
              className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
              aria-label="Refresh flights"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading || isValidating ? 'animate-spin' : ''}`} aria-hidden="true" />
              Refresh
            </button>
          </div>

          {isLoading && flights.length === 0 ? (
            <div className="space-y-3" aria-label="Loading flights">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="bg-white border border-gray-200 rounded-xl p-4 animate-pulse">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-5 bg-gray-200 rounded" />
                        <div className="w-20 h-5 bg-gray-200 rounded" />
                      </div>
                      <div className="w-32 h-4 bg-gray-200 rounded" />
                    </div>
                    <div className="w-16 h-10 bg-gray-200 rounded-lg" />
                  </div>
                  <div className="mt-4 flex items-center gap-4">
                    <div className="w-20 h-6 bg-gray-200 rounded" />
                    <div className="flex-1 flex items-center gap-2">
                      <div className="w-12 h-4 bg-gray-200 rounded" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <FlightList
              flights={flights}
              type={flightType === 'departures' ? 'departure' : 'arrival'}
              loading={isLoading || isValidating}
              emptyMessage="No flights available at this time. Flights are typically available 2 hours before departure."
            />
          )}

          <div className="mt-8 p-6 bg-white border border-gray-200 rounded-xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">About Delay Predictions</h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              The delay probability shown is calculated based on historical flight data collected over time.
              Factors include airline performance, route patterns, and time of day. The prediction becomes
              more accurate as more data is collected for each specific flight pattern.
            </p>
            <div className="mt-4 grid grid-cols-3 gap-4 text-center">
              <div className="p-3 bg-green-100 rounded-lg border border-green-200">
                <p className="text-lg font-bold text-green-700">Less than 20%</p>
                <p className="text-xs text-green-600 mt-1">Low Risk</p>
              </div>
              <div className="p-3 bg-amber-100 rounded-lg border border-amber-200">
                <p className="text-lg font-bold text-amber-700">20-50%</p>
                <p className="text-xs text-amber-600 mt-1">Medium Risk</p>
              </div>
              <div className="p-3 bg-red-100 rounded-lg border border-red-200">
                <p className="text-lg font-bold text-red-700">More than 50%</p>
                <p className="text-xs text-red-600 mt-1">High Risk</p>
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

        <ToastContainer toasts={toasts} onDismiss={dismissToast} />
      </div>
    </ErrorBoundary>
  );
}
