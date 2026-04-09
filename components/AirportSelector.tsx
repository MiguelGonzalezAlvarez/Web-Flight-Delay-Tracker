'use client';

import { Airport } from '@/types';
import { MAJOR_AIRPORTS, SPANISH_AIRPORTS } from '@/lib/airports';
import { useState, useMemo } from 'react';
import { Plane, ChevronDown } from 'lucide-react';

interface AirportSelectorProps {
  value: string;
  onChange: (icao: string) => void;
  label?: string;
}

export function AirportSelector({ value, onChange, label }: AirportSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredAirports = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return null;
    return SPANISH_AIRPORTS.filter(
      a =>
        a.icao.toLowerCase().includes(query) ||
        a.iata.toLowerCase().includes(query) ||
        a.name.toLowerCase().includes(query) ||
        a.city.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  const selectedAirport = SPANISH_AIRPORTS.find(a => a.icao === value);

  const handleSelect = (icao: string) => {
    onChange(icao);
    setIsOpen(false);
    setSearchQuery('');
  };

  const closeDropdown = () => {
    setIsOpen(false);
    setSearchQuery('');
  };

  return (
    <div className="relative">
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {label}
        </label>
      )}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className="w-full flex items-center justify-between px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
      >
        <div className="flex items-center gap-3">
          <Plane className="w-5 h-5 text-gray-400 dark:text-gray-500" aria-hidden="true" />
          {selectedAirport ? (
            <div className="text-left">
              <span className="font-medium text-gray-900 dark:text-gray-100">{selectedAirport.iata}</span>
              <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">{selectedAirport.city}</span>
            </div>
          ) : (
            <span className="text-gray-500 dark:text-gray-400">Select airport</span>
          )}
        </div>
        <ChevronDown
          className={`w-5 h-5 text-gray-400 dark:text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          aria-hidden="true"
        />
      </button>

      {isOpen && (
        <div
          className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-80 overflow-y-auto"
          role="listbox"
        >
          <div className="p-2 border-b border-gray-100 dark:border-gray-700">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search airports..."
              className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-primary-500"
              aria-label="Search airports"
              autoFocus
            />
          </div>
          <div className="p-2">
            {filteredAirports !== null ? (
              filteredAirports.length > 0 ? (
                filteredAirports.map((airport) => (
                  <AirportOption
                    key={airport.icao}
                    airport={airport}
                    isSelected={value === airport.icao}
                    onClick={() => handleSelect(airport.icao)}
                  />
                ))
              ) : (
                <p className="px-2 py-3 text-sm text-gray-500 dark:text-gray-400 text-center">No airports found</p>
              )
            ) : (
              <>
                {MAJOR_AIRPORTS.length > 0 && (
                  <div className="mb-2">
                    <p className="px-2 py-1 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Major Airports</p>
                    {MAJOR_AIRPORTS.map((airport) => (
                      <AirportOption
                        key={airport.icao}
                        airport={airport}
                        isSelected={value === airport.icao}
                        onClick={() => handleSelect(airport.icao)}
                      />
                    ))}
                  </div>
                )}
                <div>
                  <p className="px-2 py-1 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Other Airports</p>
                  {SPANISH_AIRPORTS.filter(a => !MAJOR_AIRPORTS.some(m => m.icao === a.icao)).map((airport) => (
                    <AirportOption
                      key={airport.icao}
                      airport={airport}
                      isSelected={value === airport.icao}
                      onClick={() => handleSelect(airport.icao)}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}
      {isOpen && (
        <div
          className="fixed inset-0 z-0"
          onClick={closeDropdown}
          onKeyDown={(e) => e.key === 'Escape' && closeDropdown()}
          role="button"
          tabIndex={-1}
          aria-label="Close airport selector"
        />
      )}
    </div>
  );
}

function AirportOption({ airport, isSelected, onClick }: { airport: Airport; isSelected: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      role="option"
      aria-selected={isSelected}
      className={`w-full flex items-center justify-between px-2 py-2 text-left rounded-md transition-colors ${
        isSelected ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-900 dark:text-primary-100' : 'hover:bg-gray-50 dark:hover:bg-gray-700'
      }`}
    >
      <div>
        <span className="font-medium text-gray-900 dark:text-gray-100">{airport.iata}</span>
        <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">{airport.name}</span>
      </div>
      <span className="text-xs text-gray-400 dark:text-gray-500">{airport.city}</span>
    </button>
  );
}
