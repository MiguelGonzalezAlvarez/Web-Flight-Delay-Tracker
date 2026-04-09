'use client';

import { DelayPrediction } from '@/types';
import { AlertTriangle, AlertCircle, CheckCircle } from 'lucide-react';

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
    low: 'text-green-700 bg-green-100 border-green-300',
    medium: 'text-amber-700 bg-amber-100 border-amber-300',
    high: 'text-red-700 bg-red-100 border-red-300',
  };

  const bgColors = {
    low: 'bg-green-50',
    medium: 'bg-amber-50',
    high: 'bg-red-50',
  };

  const icons = {
    low: CheckCircle,
    medium: AlertCircle,
    high: AlertTriangle,
  };

  const labels = {
    low: 'Low risk',
    medium: 'Medium risk',
    high: 'High risk',
  };

  const Icon = icons[prediction.riskLevel];

  return (
    <div 
      className={`flex flex-col items-center gap-1 ${sizeClasses[size]}`}
      role="meter"
      aria-valuenow={prediction.percentage}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={`Delay probability: ${prediction.percentage}% (${labels[prediction.riskLevel]})`}
    >
      <div 
        className={`flex items-center gap-1 px-2 py-1 rounded-full border ${colors[prediction.riskLevel]}`}
      >
        <Icon 
          className={iconSizes[size]} 
          aria-hidden="true"
        />
        <span className="font-semibold">{prediction.percentage}%</span>
      </div>
      <span className="sr-only">{labels[prediction.riskLevel]}</span>
      {prediction.basedOnRecords > 0 && (
        <span className="text-xs text-gray-500">
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
    if (percentage < 50) return 'bg-amber-500';
    return 'bg-red-500';
  };

  const labels = {
    low: 'Low',
    medium: 'Medium',
    high: 'High',
  };

  return (
    <div 
      className="w-full"
      role="progressbar"
      aria-valuenow={prediction.percentage}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={`Delay risk: ${prediction.percentage}%`}
    >
      {showLabel && (
        <div className="flex justify-between text-xs text-gray-600 mb-1">
          <span>Delay risk ({labels[prediction.riskLevel]})</span>
          <span className="font-medium">{prediction.percentage}%</span>
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
