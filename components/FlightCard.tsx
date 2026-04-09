'use client';

import { Flight } from '@/types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Plane, Clock, MapPin } from 'lucide-react';
import { DelayIndicator } from './DelayIndicator';
import { useFlightHelpers } from '@/hooks/useFlightHelpers';
import { useDelayRisk } from '@/hooks/useDelayRisk';

interface FlightCardProps {
  flight: Flight;
  type: 'departure' | 'arrival';
  onClick?: () => void;
}

export function FlightCard({ flight, type, onClick }: FlightCardProps) {
  const helpers = useFlightHelpers(flight);
  const delayRisk = useDelayRisk(flight.delayPrediction);

  const time = flight.departureTime || flight.arrivalTime;
  const formattedTime = time ? format(new Date(time), 'HH:mm', { locale: es }) : '--:--';
  
  const destination = type === 'departure' ? flight.destination : flight.origin;
  const location = destination !== 'Unknown' ? destination : (type === 'departure' ? 'Destino' : 'Origen');

  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full text-left bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 hover:shadow-md hover:border-primary-300 dark:hover:border-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex items-center gap-2">
              <Plane className={`w-4 h-4 text-gray-400 dark:text-gray-500 ${type === 'departure' ? '' : 'rotate-90'}`} />
              <span className="font-mono font-bold text-lg text-gray-900 dark:text-gray-100">{flight.callsign}</span>
            </div>
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${helpers.statusColor}`}>
              {helpers.statusLabel}
            </span>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <span className="font-medium text-gray-900 dark:text-gray-200">{flight.airline}</span>
          </div>
        </div>

        {helpers.hasPrediction && flight.delayPrediction && (
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

      {helpers.hasPrediction && flight.delayPrediction && (
        <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>Avg. delay: {flight.delayPrediction.avgDelayMinutes} min</span>
            <span className="capitalize">{flight.delayPrediction.riskLevel} risk</span>
          </div>
        </div>
      )}
    </button>
  );
}
