'use client';

import { Flight } from '@/types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Plane, Clock, MapPin, ArrowRight } from 'lucide-react';
import { DelayIndicator } from './DelayIndicator';

interface FlightCardProps {
  flight: Flight;
  type: 'departure' | 'arrival';
}

export function FlightCard({ flight, type }: FlightCardProps) {
  const time = flight.departureTime || flight.arrivalTime;
  const formattedTime = time ? format(new Date(time), 'HH:mm', { locale: es }) : '--:--';
  
  const destination = type === 'departure' ? flight.destination : flight.origin;
  const location = destination !== 'Unknown' ? destination : (type === 'departure' ? 'Destino' : 'Origen');

  const statusConfig: Record<string, { label: string; className: string }> = {
    scheduled: { label: 'Programado', className: 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300' },
    boarding: { label: 'Embarcando', className: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' },
    departed: { label: 'Despegado', className: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300' },
    arrived: { label: 'Llegado', className: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' },
    delayed: { label: 'Retrasado', className: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300' },
    cancelled: { label: 'Cancelado', className: 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200' },
    unknown: { label: 'Desconocido', className: 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400' },
  };

  const status = statusConfig[flight.status] || statusConfig.unknown;

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex items-center gap-2">
              <Plane className={`w-4 h-4 text-gray-400 dark:text-gray-500 ${type === 'departure' ? '' : 'rotate-90'}`} />
              <span className="font-mono font-bold text-lg text-gray-900 dark:text-gray-100">{flight.callsign}</span>
            </div>
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${status.className}`}>
              {status.label}
            </span>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <span className="font-medium text-gray-900 dark:text-gray-200">{flight.airline}</span>
          </div>
        </div>

        {flight.delayPrediction && (
          <DelayIndicator prediction={flight.delayPrediction} size="sm" />
        )}
      </div>

      <div className="mt-4 flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-gray-400 dark:text-gray-500" />
          <span className="font-semibold text-lg text-gray-900 dark:text-gray-100">{formattedTime}</span>
        </div>

        <div className="flex-1 flex items-center gap-2">
          <div className={`flex items-center gap-1 ${type === 'departure' ? '' : 'flex-row-reverse'}`}>
            <MapPin className="w-4 h-4 text-gray-400 dark:text-gray-500" />
            <span className="font-medium text-gray-900 dark:text-gray-200">{location}</span>
          </div>
        </div>
      </div>

      {flight.delayPrediction && (
        <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>Avg. delay: {flight.delayPrediction.avgDelayMinutes} min</span>
            <span className="capitalize">{flight.delayPrediction.riskLevel} risk</span>
          </div>
        </div>
      )}
    </div>
  );
}
