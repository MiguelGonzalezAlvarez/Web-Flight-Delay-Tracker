'use client';

import { Airport } from '@/types';
import { MAJOR_AIRPORTS, SPANISH_AIRPORTS } from '@/lib/airports';
import { useState } from 'react';
import { Plane, ChevronDown } from 'lucide-react';

interface AirportSelectorProps {
  value: string;
  onChange: (icao: string) => void;
  label?: string;
}

export function AirportSelector({ value, onChange, label }: AirportSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showAll, setShowAll] = useState(false);

  const airports = showAll ? SPANISH_AIRPORTS : MAJOR_AIRPORTS;
  const selectedAirport = SPANISH_AIRPORTS.find(a => a.icao === value) || MAJOR_AIRPORTS.find(a => a.icao === value);

  return (
    <div className="relative">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
      >
        <div className="flex items-center gap-3">
          <Plane className="w-5 h-5 text-gray-400" />
          {selectedAirport ? (
            <div className="text-left">
              <span className="font-medium text-gray-900">{selectedAirport.iata}</span>
              <span className="ml-2 text-sm text-gray-500">{selectedAirport.city}</span>
            </div>
          ) : (
            <span className="text-gray-500">Select airport</span>
          )}
        </div>
        <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-80 overflow-y-auto">
          <div className="p-2 border-b border-gray-100">
            <input
              type="text"
              placeholder="Search airports..."
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500"
              autoFocus
            />
          </div>
          <div className="p-2">
            {!showAll && MAJOR_AIRPORTS.length > 0 && (
              <div className="mb-2">
                <p className="px-2 py-1 text-xs font-semibold text-gray-500 uppercase">Major Airports</p>
                {MAJOR_AIRPORTS.map((airport) => (
                  <AirportOption
                    key={airport.icao}
                    airport={airport}
                    isSelected={value === airport.icao}
                    onClick={() => {
                      onChange(airport.icao);
                      setIsOpen(false);
                    }}
                  />
                ))}
              </div>
            )}
            <div>
              <div className="flex items-center justify-between px-2 py-1">
                <p className="text-xs font-semibold text-gray-500 uppercase">{showAll ? 'All Airports' : 'Other Airports'}</p>
                <button
                  onClick={() => setShowAll(!showAll)}
                  className="text-xs text-primary-600 hover:text-primary-700"
                >
                  {showAll ? 'Show less' : 'Show all'}
                </button>
              </div>
              {(showAll ? SPANISH_AIRPORTS : SPANISH_AIRPORTS.filter(a => !MAJOR_AIRPORTS.some(m => m.icao === a.icao))).map((airport) => (
                <AirportOption
                  key={airport.icao}
                  airport={airport}
                  isSelected={value === airport.icao}
                  onClick={() => {
                    onChange(airport.icao);
                    setIsOpen(false);
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function AirportOption({ airport, isSelected, onClick }: { airport: Airport; isSelected: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full flex items-center justify-between px-2 py-2 text-left rounded-md transition-colors ${
        isSelected ? 'bg-primary-50 text-primary-900' : 'hover:bg-gray-50'
      }`}
    >
      <div>
        <span className="font-medium">{airport.iata}</span>
        <span className="ml-2 text-sm text-gray-600">{airport.name}</span>
      </div>
      <span className="text-xs text-gray-400">{airport.city}</span>
    </button>
  );
}
