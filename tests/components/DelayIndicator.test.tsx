import { render, screen } from '@testing-library/react';
import { DelayIndicator, DelayBar } from '@/components/DelayIndicator';

describe('DelayIndicator', () => {
  it('should render low risk indicator correctly', () => {
    const prediction = { percentage: 15, avgDelayMinutes: 10, basedOnRecords: 50, riskLevel: 'low' as const };
    render(<DelayIndicator prediction={prediction} />);
    
    expect(screen.getByText('15%')).toBeInTheDocument();
    expect(screen.getByText('Based on 50 flights')).toBeInTheDocument();
  });

  it('should render medium risk indicator correctly', () => {
    const prediction = { percentage: 35, avgDelayMinutes: 25, basedOnRecords: 100, riskLevel: 'medium' as const };
    render(<DelayIndicator prediction={prediction} />);
    
    expect(screen.getByText('35%')).toBeInTheDocument();
  });

  it('should render high risk indicator correctly', () => {
    const prediction = { percentage: 75, avgDelayMinutes: 60, basedOnRecords: 200, riskLevel: 'high' as const };
    render(<DelayIndicator prediction={prediction} />);
    
    expect(screen.getByText('75%')).toBeInTheDocument();
  });

  it('should not show records text when basedOnRecords is 0', () => {
    const prediction = { percentage: 15, avgDelayMinutes: 12, basedOnRecords: 0, riskLevel: 'low' as const };
    render(<DelayIndicator prediction={prediction} />);
    
    expect(screen.getByText('15%')).toBeInTheDocument();
    expect(screen.queryByText(/Based on/)).not.toBeInTheDocument();
  });

  it('should support different sizes', () => {
    const prediction = { percentage: 25, avgDelayMinutes: 15, basedOnRecords: 50, riskLevel: 'medium' as const };
    
    const { rerender } = render(<DelayIndicator prediction={prediction} size="sm" />);
    expect(screen.getByText('25%')).toBeInTheDocument();

    rerender(<DelayIndicator prediction={prediction} size="lg" />);
    expect(screen.getByText('25%')).toBeInTheDocument();
  });
});

describe('DelayBar', () => {
  it('should render with correct percentage', () => {
    const prediction = { percentage: 30, avgDelayMinutes: 20, basedOnRecords: 75, riskLevel: 'medium' as const };
    render(<DelayBar prediction={prediction} />);
    
    expect(screen.getByText('Delay risk')).toBeInTheDocument();
    expect(screen.getByText('30%')).toBeInTheDocument();
  });

  it('should hide label when showLabel is false', () => {
    const prediction = { percentage: 15, avgDelayMinutes: 10, basedOnRecords: 25, riskLevel: 'low' as const };
    render(<DelayBar prediction={prediction} showLabel={false} />);
    
    expect(screen.queryByText('Delay risk')).not.toBeInTheDocument();
  });
});
