'use client';

import { DelayPrediction } from '@/types';
import { AlertTriangle, AlertCircle, CheckCircle, Minus } from 'lucide-react';

interface DelayIndicatorProps {
  prediction: DelayPrediction;
  size?: 'sm' | 'md' | 'lg';
}

export function DelayIndicator({ prediction, size = 'md' }: DelayIndicatorProps) {
  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  const colors = {
    low: 'text-green-600 bg-green-50 border-green-200',
    medium: 'text-yellow-600 bg-yellow-50 border-yellow-200',
    high: 'text-red-600 bg-red-50 border-red-200',
  };

  const icons = {
    low: CheckCircle,
    medium: AlertCircle,
    high: AlertTriangle,
  };

  const Icon = icons[prediction.riskLevel];

  return (
    <div className={`flex flex-col items-center gap-1 ${sizeClasses[size]}`}>
      <div className={`flex items-center gap-1 px-2 py-1 rounded-full border ${colors[prediction.riskLevel]}`}>
        <Icon className={iconSizes[size]} />
        <span className="font-semibold">{prediction.percentage}%</span>
      </div>
      {prediction.basedOnRecords > 0 && (
        <span className="text-xs text-gray-400">
          Based on {prediction.basedOnRecords} flights
        </span>
      )}
    </div>
  );
}

interface DelayBarProps {
  prediction: DelayPrediction;
  showLabel?: boolean;
}

export function DelayBar({ prediction, showLabel = true }: DelayBarProps) {
  const getColor = (percentage: number) => {
    if (percentage < 20) return 'bg-green-500';
    if (percentage < 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>Delay risk</span>
          <span>{prediction.percentage}%</span>
        </div>
      )}
      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-full ${getColor(prediction.percentage)} transition-all duration-500`}
          style={{ width: `${Math.max(prediction.percentage, 5)}%` }}
        />
      </div>
    </div>
  );
}
