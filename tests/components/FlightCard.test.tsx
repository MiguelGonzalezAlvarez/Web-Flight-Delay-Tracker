import { render, screen } from '@testing-library/react';
import { FlightCard } from '@/components/FlightCard';
import { Flight } from '@/types';

describe('FlightCard', () => {
  const mockFlight: Flight = {
    id: 'test-flight-1',
    icao24: 'abc123',
    callsign: 'IBE1234',
    origin: 'LEMD',
    destination: 'LEBL',
    airline: 'Iberia',
    departureTime: '2024-01-01T10:00:00Z',
    arrivalTime: '2024-01-01T12:00:00Z',
    estimatedTime: null,
    status: 'scheduled',
  };

  it('should render flight callsign', () => {
    render(<FlightCard flight={mockFlight} type="departure" />);
    expect(screen.getByText('IBE1234')).toBeInTheDocument();
  });

  it('should render airline name', () => {
    render(<FlightCard flight={mockFlight} type="departure" />);
    expect(screen.getByText('Iberia')).toBeInTheDocument();
  });

  it('should render scheduled status', () => {
    render(<FlightCard flight={mockFlight} type="departure" />);
    expect(screen.getByText('Programado')).toBeInTheDocument();
  });

  it('should render delayed status', () => {
    const delayedFlight = { ...mockFlight, status: 'delayed' as const };
    render(<FlightCard flight={delayedFlight} type="departure" />);
    expect(screen.getByText('Retrasado')).toBeInTheDocument();
  });

  it('should render cancelled status', () => {
    const cancelledFlight = { ...mockFlight, status: 'cancelled' as const };
    render(<FlightCard flight={cancelledFlight} type="departure" />);
    expect(screen.getByText('Cancelado')).toBeInTheDocument();
  });

  it('should render destination for departure', () => {
    render(<FlightCard flight={mockFlight} type="departure" />);
    expect(screen.getByText('LEBL')).toBeInTheDocument();
  });

  it('should render origin for arrival', () => {
    render(<FlightCard flight={mockFlight} type="arrival" />);
    expect(screen.getByText('LEMD')).toBeInTheDocument();
  });

  it('should render delay prediction when provided', () => {
    const flightWithPrediction = {
      ...mockFlight,
      delayPrediction: { percentage: 25, avgDelayMinutes: 15, basedOnRecords: 50, riskLevel: 'medium' as const },
    };
    render(<FlightCard flight={flightWithPrediction} type="departure" />);
    expect(screen.getByText('25%')).toBeInTheDocument();
  });

  it('should render avg delay info when prediction exists', () => {
    const flightWithPrediction = {
      ...mockFlight,
      delayPrediction: { percentage: 30, avgDelayMinutes: 20, basedOnRecords: 75, riskLevel: 'medium' as const },
    };
    render(<FlightCard flight={flightWithPrediction} type="departure" />);
    expect(screen.getByText('Avg. delay: 20 min')).toBeInTheDocument();
  });
});
