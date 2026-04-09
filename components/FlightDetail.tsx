'use client';

import { useEffect, useRef } from 'react';
import { Flight } from '@/types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { X, Plane, Clock, Building2, Navigation, Calendar, AlertTriangle, CheckCircle } from 'lucide-react';
import { DelayBar } from './DelayIndicator';
import { useFlightHelpers } from '@/hooks/useFlightHelpers';
import { useDelayRisk } from '@/hooks/useDelayRisk';

interface FlightDetailProps {
  flight: Flight;
  type: 'departure' | 'arrival';
  onClose: () => void;
}

export function FlightDetail({ flight, type, onClose }: FlightDetailProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const helpers = useFlightHelpers(flight);
  const delayRisk = useDelayRisk(flight.delayPrediction);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', handleEscape);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  const time = flight.departureTime || flight.arrivalTime;
  const formattedDate = time ? format(new Date(time), 'EEEE, d MMMM yyyy', { locale: es }) : '';
  const formattedTime = time ? format(new Date(time), 'HH:mm') : '--:--';

  const origin = flight.origin || 'Unknown';
  const destination = flight.destination || 'Unknown';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="flight-detail-title"
    >
      <div
        ref={modalRef}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-modal-enter"
      >
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <div className="flex items-center gap-3">
            <Plane className={`w-5 h-5 text-primary-600 dark:text-primary-400 ${type === 'arrival' ? 'rotate-90' : ''}`} />
            <h2 id="flight-detail-title" className="font-bold text-xl text-gray-900 dark:text-gray-100">
              {flight.callsign}
            </h2>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${helpers.statusColor}`}>
              {helpers.statusLabel}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label="Cerrar"
          >
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="flex items-center gap-4">
            <div className="flex-1 text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                {type === 'departure' ? 'Origen' : 'Origen'}
              </p>
              <p className="font-bold text-2xl text-gray-900 dark:text-gray-100">
                {type === 'departure' ? origin : origin}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-primary-600 dark:bg-primary-400" />
              <Navigation className={`w-6 h-6 text-primary-600 dark:text-primary-400 ${type === 'arrival' ? 'rotate-90' : '-rotate-90'}`} />
              <div className="w-3 h-3 rounded-full bg-primary-600 dark:bg-primary-400" />
            </div>
            <div className="flex-1 text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                {type === 'departure' ? 'Destino' : 'Destino'}
              </p>
              <p className="font-bold text-2xl text-gray-900 dark:text-gray-100">
                {type === 'departure' ? destination : destination}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
              <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-2">
                <Calendar className="w-4 h-4" />
                <span className="text-sm">Fecha</span>
              </div>
              <p className="font-semibold text-gray-900 dark:text-gray-100 capitalize">{formattedDate}</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
              <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-2">
                <Clock className="w-4 h-4" />
                <span className="text-sm">Hora</span>
              </div>
              <p className="font-semibold text-gray-900 dark:text-gray-100">{formattedTime}</p>
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-3">
              <Building2 className="w-4 h-4" />
              <span className="text-sm">Informacion del vuelo</span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">Aerolinea</span>
                <span className="font-medium text-gray-900 dark:text-gray-100">{flight.airline}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">Tipo</span>
                <span className="font-medium text-gray-900 dark:text-gray-100 capitalize">
                  {type === 'departure' ? 'Salida' : 'Llegada'}
                </span>
              </div>
            </div>
          </div>

          {helpers.hasPrediction && flight.delayPrediction && (
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
              <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-3">
                <AlertTriangle className="w-4 h-4" />
                <span className="text-sm">Prediccion de retraso</span>
              </div>
              <div className="mb-4">
                <DelayBar prediction={flight.delayPrediction} showLabel />
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Retraso promedio</p>
                  <p className="font-semibold text-gray-900 dark:text-gray-100">
                    {delayRisk.formattedDelay}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Basado en</p>
                  <p className="font-semibold text-gray-900 dark:text-gray-100">
                    {flight.delayPrediction.basedOnRecords} vuelos
                  </p>
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2">
                {delayRisk.confidenceLevel === 'low' ? (
                  <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                ) : delayRisk.confidenceLevel === 'medium' ? (
                  <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
                )}
                <span className={`font-medium capitalize ${
                  delayRisk.confidenceLevel === 'low' ? 'text-green-700 dark:text-green-300' :
                  delayRisk.confidenceLevel === 'medium' ? 'text-amber-700 dark:text-amber-300' :
                  'text-red-700 dark:text-red-300'
                }`}>
                  {delayRisk.confidenceLevel === 'low' ? 'Bajo riesgo' :
                   delayRisk.confidenceLevel === 'medium' ? 'Riesgo medio' :
                   'Alto riesgo'}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
