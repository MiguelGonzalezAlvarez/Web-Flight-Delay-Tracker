import { useMemo } from 'react';
import { DelayPrediction } from '@/src/domain/entities/DelayPrediction';
import { DelayPredictionMapper, DelayPredictionDTO } from '@/src/infrastructure/mappers';

export interface UseDelayRiskResult {
  prediction: DelayPrediction | null;
  requiresWarning: boolean;
  requiresAction: boolean;
  confidenceLevel: 'low' | 'medium' | 'high';
  formattedDelay: string;
  isReliable: boolean;
}

export function useDelayRisk(dto: DelayPredictionDTO | undefined): UseDelayRiskResult {
  return useMemo(() => {
    if (!dto) {
      return {
        prediction: null,
        requiresWarning: false,
        requiresAction: false,
        confidenceLevel: 'low',
        formattedDelay: '-',
        isReliable: false,
      };
    }

    const result = DelayPredictionMapper.toEntity(dto);
    const prediction = result.ok ? result.value : null;

    return {
      prediction,
      requiresWarning: prediction?.requiresWarning() ?? false,
      requiresAction: prediction?.requiresAction() ?? false,
      confidenceLevel: prediction?.getConfidenceLevel() ?? 'low',
      formattedDelay: prediction?.getFormattedDelay() ?? '-',
      isReliable: prediction?.isReliable() ?? false,
    };
  }, [dto]);
}

export function useDelayRiskBatch(dtos: (DelayPredictionDTO | undefined)[]): UseDelayRiskResult[] {
  return useMemo(() => {
    return dtos.map(dto => {
      if (!dto) {
        return {
          prediction: null,
          requiresWarning: false,
          requiresAction: false,
          confidenceLevel: 'low' as const,
          formattedDelay: '-',
          isReliable: false,
        };
      }

      const result = DelayPredictionMapper.toEntity(dto);
      const prediction = result.ok ? result.value : null;

      return {
        prediction,
        requiresWarning: prediction?.requiresWarning() ?? false,
        requiresAction: prediction?.requiresAction() ?? false,
        confidenceLevel: prediction?.getConfidenceLevel() ?? 'low',
        formattedDelay: prediction?.getFormattedDelay() ?? '-',
        isReliable: prediction?.isReliable() ?? false,
      };
    });
  }, [dtos]);
}
