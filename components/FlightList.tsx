'use client';

import { Flight } from '@/types';
import { FlightCard } from './FlightCard';
import { Plane, Loader2 } from 'lucide-react';

interface FlightListProps {
  flights: Flight[];
  type: 'departure' | 'arrival';
  loading?: boolean;
  emptyMessage?: string;
}

export function FlightList({ flights, type, loading, emptyMessage }: FlightListProps) {
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
    <div className="space-y-3">
      {flights.map((flight) => (
        <FlightCard key={flight.id} flight={flight} type={type} />
      ))}
    </div>
  );
}
