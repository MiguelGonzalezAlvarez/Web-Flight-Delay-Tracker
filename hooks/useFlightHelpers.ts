import { useMemo } from 'react';
import { Flight } from '@/src/domain/entities/Flight';
import { FlightMapper, FlightDTO } from '@/src/infrastructure/mappers';

export interface UseFlightHelpersResult {
  flight: Flight | null;
  isDelayed: boolean;
  isActive: boolean;
  isCompleted: boolean;
  requiresAttention: boolean;
  route: string;
  hasPrediction: boolean;
  hasDeparted: boolean;
  hasArrived: boolean;
  statusLabel: string;
  statusColor: string;
}

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  scheduled: { label: 'Programado', className: 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300' },
  boarding: { label: 'Embarcando', className: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' },
  departed: { label: 'Despegado', className: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300' },
  arrived: { label: 'Llegado', className: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' },
  delayed: { label: 'Retrasado', className: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300' },
  cancelled: { label: 'Cancelado', className: 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200' },
  unknown: { label: 'Desconocido', className: 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400' },
};

export function useFlightHelpers(dto: FlightDTO | undefined): UseFlightHelpersResult {
  return useMemo(() => {
    if (!dto) {
      return {
        flight: null,
        isDelayed: false,
        isActive: false,
        isCompleted: false,
        requiresAttention: false,
        route: '-',
        hasPrediction: false,
        hasDeparted: false,
        hasArrived: false,
        statusLabel: 'Desconocido',
        statusColor: '',
      };
    }

    const result = FlightMapper.toEntity(dto);
    const flight = result.ok ? result.value : null;
    const statusStr = dto.status || 'unknown';
    const config = STATUS_CONFIG[statusStr] || STATUS_CONFIG.unknown;

    return {
      flight,
      isDelayed: flight?.isDelayed() ?? false,
      isActive: flight?.isActive() ?? false,
      isCompleted: flight?.isCompleted() ?? false,
      requiresAttention: flight?.requiresAttention() ?? false,
      route: flight?.getRoute() ?? '-',
      hasPrediction: flight?.hasPrediction() ?? false,
      hasDeparted: flight?.hasDeparted() ?? false,
      hasArrived: flight?.hasArrived() ?? false,
      statusLabel: config.label,
      statusColor: config.className,
    };
  }, [dto]);
}

export function useFlightHelpersBatch(dtos: FlightDTO[]): UseFlightHelpersResult[] {
  return useMemo(() => {
    return dtos.map(dto => {
      const result = FlightMapper.toEntity(dto);
      const flight = result.ok ? result.value : null;
      const statusStr = dto.status || 'unknown';
      const config = STATUS_CONFIG[statusStr] || STATUS_CONFIG.unknown;

      return {
        flight,
        isDelayed: flight?.isDelayed() ?? false,
        isActive: flight?.isActive() ?? false,
        isCompleted: flight?.isCompleted() ?? false,
        requiresAttention: flight?.requiresAttention() ?? false,
        route: flight?.getRoute() ?? '-',
        hasPrediction: flight?.hasPrediction() ?? false,
        hasDeparted: flight?.hasDeparted() ?? false,
        hasArrived: flight?.hasArrived() ?? false,
        statusLabel: config.label,
        statusColor: config.className,
      };
    });
  }, [dtos]);
}
