'use client';

import { useState, useEffect } from 'react';
import { AirportSelector, FlightList, FlightSearch } from '@/components';
import { Flight } from '@/types';
import { Plane, RefreshCw, Info } from 'lucide-react';
import { getAirportByIcao } from '@/lib/airports';

export default function HomePage() {
  const [selectedAirport, setSelectedAirport] = useState('LEMD');
  const [flightType, setFlightType] = useState<'departures' | 'arrivals'>('departures');
  const [flights, setFlights] = useState<Flight[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [searchResult, setSearchResult] = useState<Flight | null>(null);
  const [error, setError] = useState<string | null>(null);

  const airport = getAirportByIcao(selectedAirport);

  const fetchFlights = async () => {
    setLoading(true);
    setError(null);
    setSearchResult(null);
    
    try {
      const response = await fetch(`/api/flights?airport=${selectedAirport}&type=${flightType}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch flights');
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
  };

  const handleSearch = async (callsign: string) => {
    setLoading(true);
    setError(null);
    setFlights([]);
    
    try {
      const response = await fetch(`/api/flights?airport=${selectedAirport}&type=${flightType}`);
      
      if (!response.ok) {
        throw new Error('Failed to search flights');
      }
      
      const data = await response.json();
      const foundFlight = data.flights?.find((f: Flight) => 
        f.callsign.toUpperCase().includes(callsign)
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
  };

  useEffect(() => {
    fetchFlights();
  }, [selectedAirport, flightType]);

  useEffect(() => {
    const interval = setInterval(fetchFlights, 60000);
    return () => clearInterval(interval);
  }, [selectedAirport, flightType]);

  return (
    <div className="min-h-screen">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
                <Plane className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Flight Tracker Spain</h1>
                <p className="text-sm text-gray-500">Monitor probable flight delays</p>
              </div>
            </div>
            {lastUpdated && (
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <RefreshCw className="w-4 h-4" />
                <span>Updates every minute</span>
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
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Flight Type
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => setFlightType('departures')}
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
          <div className="mb-6 p-4 bg-blue-50 border border-blue-100 rounded-lg">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-600 mt-0.5" />
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
          <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-lg">
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
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
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
              <p className="text-2xl font-bold text-green-600">{'<20%'}</p>
              <p className="text-xs text-green-700">Low Risk</p>
            </div>
            <div className="p-3 bg-yellow-50 rounded-lg">
              <p className="text-2xl font-bold text-yellow-600">20-50%</p>
              <p className="text-xs text-yellow-700">Medium Risk</p>
            </div>
            <div className="p-3 bg-red-50 rounded-lg">
              <p className="text-2xl font-bold text-red-600">{'>50%'}</p>
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
  );
}
