import { render, screen } from '@testing-library/react';
import { FlightList } from '@/components/FlightList';
import { Flight } from '@/types';

jest.mock('@/components/FlightCard', () => ({
  FlightCard: ({ flight }: { flight: Flight }) => (
    <div data-testid="flight-card">{flight.callsign}</div>
  ),
}));

const mockFlights: Flight[] = [
  {
    id: 'flight-1',
    icao24: 'abc123',
    callsign: 'IBE1234',
    origin: 'LEMD',
    destination: 'LEBL',
    airline: 'Iberia',
    departureTime: '2024-01-01T10:00:00Z',
    arrivalTime: '2024-01-01T12:00:00Z',
    estimatedTime: null,
    status: 'scheduled',
  },
  {
    id: 'flight-2',
    icao24: 'def456',
    callsign: 'VLG5678',
    origin: 'LEBL',
    destination: 'LEMD',
    airline: 'Vueling',
    departureTime: '2024-01-01T14:00:00Z',
    arrivalTime: '2024-01-01T16:00:00Z',
    estimatedTime: null,
    status: 'departed',
  },
];

describe('FlightList', () => {
  it('should render all flights', () => {
    render(<FlightList flights={mockFlights} type="departure" />);
    
    const cards = screen.getAllByTestId('flight-card');
    expect(cards).toHaveLength(2);
  });

  it('should render flight callsigns', () => {
    render(<FlightList flights={mockFlights} type="departure" />);
    
    expect(screen.getByText('IBE1234')).toBeInTheDocument();
    expect(screen.getByText('VLG5678')).toBeInTheDocument();
  });

  it('should show loading state', () => {
    render(<FlightList flights={[]} type="departure" loading={true} />);
    
    expect(screen.getByText('Loading flights...')).toBeInTheDocument();
  });

  it('should show default empty message', () => {
    render(<FlightList flights={[]} type="departure" loading={false} />);
    
    expect(screen.getByText('No flights found')).toBeInTheDocument();
  });

  it('should show custom empty message', () => {
    const customMessage = 'Custom empty message';
    render(
      <FlightList 
        flights={[]} 
        type="departure" 
        loading={false} 
        emptyMessage={customMessage}
      />
    );
    
    expect(screen.getByText(customMessage)).toBeInTheDocument();
  });

  it('should render departure type', () => {
    render(<FlightList flights={mockFlights} type="departure" />);
    
    const cards = screen.getAllByTestId('flight-card');
    expect(cards).toHaveLength(2);
  });

  it('should render arrival type', () => {
    render(<FlightList flights={mockFlights} type="arrival" />);
    
    const cards = screen.getAllByTestId('flight-card');
    expect(cards).toHaveLength(2);
  });

  it('should handle empty array', () => {
    render(<FlightList flights={[]} type="departure" />);
    
    expect(screen.getByText('No flights found')).toBeInTheDocument();
  });

  it('should handle single flight', () => {
    render(<FlightList flights={[mockFlights[0]]} type="departure" />);
    
    expect(screen.getByText('IBE1234')).toBeInTheDocument();
    expect(screen.queryByText('VLG5678')).not.toBeInTheDocument();
  });
});
