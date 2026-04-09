import { Flight, FlightProps } from '../../src/domain/entities/Flight';
import { Airport, AirportProps } from '../../src/domain/entities/Airport';
import { DelayPrediction, DelayPredictionProps } from '../../src/domain/entities/DelayPrediction';

export const createFlightProps = (overrides: Partial<FlightProps> = {}): FlightProps => ({
  id: `flight-${Math.random().toString(36).substring(7)}`,
  callsign: 'IBE1234',
  airline: 'Iberia',
  origin: 'LEMD',
  destination: 'LEBL',
  departureTime: new Date('2024-03-15T10:00:00Z'),
  arrivalTime: new Date('2024-03-15T11:30:00Z'),
  status: 'scheduled',
  ...overrides,
});

export const createFlight = (overrides: Partial<FlightProps> = {}): Flight => {
  return Flight.createUnsafe(createFlightProps(overrides));
};

export const createAirportProps = (overrides: Partial<AirportProps> = {}): AirportProps => ({
  icao: 'LEMD',
  iata: 'MAD',
  name: 'Adolfo Suárez Madrid-Barajas Airport',
  city: 'Madrid',
  country: 'Spain',
  ...overrides,
});

export const createAirport = (overrides: Partial<AirportProps> = {}): Airport => {
  const props = createAirportProps(overrides);
  const result = Airport.create(props);
  if (!result.ok) {
    throw new Error(`Failed to create airport: ${result.error.message}`);
  }
  return result.value;
};

export const createDelayPredictionProps = (
  overrides: Partial<DelayPredictionProps> = {}
): DelayPredictionProps => ({
  percentage: 25,
  riskLevel: 'low',
  avgDelayMinutes: 15,
  basedOnRecords: 10,
  ...overrides,
});

export const createDelayPrediction = (
  overrides: Partial<DelayPredictionProps> = {}
): DelayPrediction => {
  const props = createDelayPredictionProps(overrides);
  const result = DelayPrediction.create(props);
  if (!result.ok) {
    throw new Error(`Failed to create delay prediction: ${result.error.message}`);
  }
  return result.value;
};

export const SPANISH_AIRPORTS_FIXTURES: AirportProps[] = [
  { icao: 'LEMD', iata: 'MAD', name: 'Adolfo Suárez Madrid-Barajas', city: 'Madrid', country: 'Spain' },
  { icao: 'LEBL', iata: 'BCN', name: 'Josep Tarradellas Barcelona-El Prat', city: 'Barcelona', country: 'Spain' },
  { icao: 'LEPA', iata: 'PMI', name: 'Palma de Mallorca', city: 'Palma', country: 'Spain' },
  { icao: 'LEMG', iata: 'AGP', name: 'Málaga-Costa del Sol', city: 'Málaga', country: 'Spain' },
  { icao: 'LEZL', iata: 'SVQ', name: 'Sevilla', city: 'Seville', country: 'Spain' },
  { icao: 'LEBB', iata: 'BIO', name: 'Bilbao', city: 'Bilbao', country: 'Spain' },
  { icao: 'LEVC', iata: 'VLC', name: 'Valencia', city: 'Valencia', country: 'Spain' },
  { icao: 'GCTS', iata: 'TFS', name: 'Tenerife Sur', city: 'Tenerife', country: 'Spain' },
  { icao: 'GCLP', iata: 'LPA', name: 'Gran Canaria', city: 'Gran Canaria', country: 'Spain' },
  { icao: 'GCXO', iata: 'TFN', name: 'Tenerife Norte', city: 'Tenerife', country: 'Spain' },
];

export const FLIGHT_FIXTURES: FlightProps[] = [
  createFlightProps({ id: 'flight-1', callsign: 'IBE1234', origin: 'LEMD', destination: 'LEBL' }),
  createFlightProps({ id: 'flight-2', callsign: 'VLG5678', origin: 'LEBL', destination: 'LEMD' }),
  createFlightProps({ id: 'flight-3', callsign: 'RYR1111', origin: 'LEMD', destination: 'LEPA' }),
  createFlightProps({ id: 'flight-4', callsign: 'EJU2222', origin: 'LEMG', destination: 'LEBL' }),
  createFlightProps({ id: 'flight-5', callsign: 'IBE3333', origin: 'LEBL', destination: 'LEZL', status: 'delayed' }),
];

export const DELAY_PREDICTION_FIXTURES: DelayPredictionProps[] = [
  createDelayPredictionProps({ percentage: 10, riskLevel: 'low' }),
  createDelayPredictionProps({ percentage: 35, riskLevel: 'medium' }),
  createDelayPredictionProps({ percentage: 75, riskLevel: 'high' }),
];
