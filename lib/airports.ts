import { Airport } from '@/types';

export const SPANISH_AIRPORTS: Airport[] = [
  { icao: 'LEMD', iata: 'MAD', name: 'Adolfo Suárez Madrid-Barajas', city: 'Madrid', latitude: 40.4983, longitude: -3.5676 },
  { icao: 'LEBL', iata: 'BCN', name: 'Josep Tarradellas Barcelona-El Prat', city: 'Barcelona', latitude: 41.2974, longitude: 2.0833 },
  { icao: 'LEAL', iata: 'ALC', name: 'Alicante-Elche Miguel Hernández', city: 'Alicante', latitude: 38.2822, longitude: -0.5582 },
  { icao: 'LEMG', iata: 'AGP', name: 'Málaga-Costa del Sol', city: 'Málaga', latitude: 36.675, longitude: -4.5706 },
  { icao: 'LEVX', iata: 'VLC', name: 'Valencia Airport', city: 'Valencia', latitude: 39.4893, longitude: -0.4816 },
  { icao: 'LEJR', iata: 'Jerez', name: 'Jerez Airport', city: 'Jerez de la Frontera', latitude: 36.7446, longitude: -6.0601 },
  { icao: 'LEIB', iata: 'IBZ', name: 'Ibiza Airport', city: 'Ibiza', latitude: 38.8729, longitude: 1.3731 },
  { icao: 'LEAM', iata: 'LEI', name: 'Almería Airport', city: 'Almería', latitude: 36.8439, longitude: -2.3701 },
  { icao: 'LEZL', iata: 'SVQ', name: 'Sevilla Airport', city: 'Sevilla', latitude: 37.418, longitude: -5.8931 },
  { icao: 'LEPA', iata: 'PMI', name: 'Palma de Mallorca Airport', city: 'Palma de Mallorca', latitude: 39.5537, longitude: 2.7314 },
  { icao: 'LERS', iata: 'REU', name: 'Reus Airport', city: 'Reus', latitude: 41.1474, longitude: 1.1672 },
  { icao: 'LEGR', iata: 'GRX', name: 'Federico García Lorca Granada-Jaén', city: 'Granada', latitude: 37.1887, longitude: -3.7878 },
  { icao: 'LEAS', iata: 'OVD', name: 'Asturias Airport', city: 'Oviedo', latitude: 43.5636, longitude: -6.0344 },
  { icao: 'LEBB', iata: 'BIO', name: 'Bilbao Airport', city: 'Bilbao', latitude: 43.3009, longitude: -2.9106 },
  { icao: 'LEPP', iata: 'PNA', name: 'Pamplona Airport', city: 'Pamplona', latitude: 42.7701, longitude: -1.6463 },
  { icao: 'LECO', iata: 'LCG', name: 'A Coruña Airport', city: 'A Coruña', latitude: 43.3021, longitude: -8.3773 },
  { icao: 'LEST', iata: 'SCQ', name: 'Santiago-Rosalía de Castro', city: 'Santiago de Compostela', latitude: 42.8963, longitude: -8.4151 },
  { icao: 'LEXJ', iata: 'SDR', name: 'Seve Ballesteros Santander', city: 'Santander', latitude: 43.425, longitude: -3.8208 },
  { icao: 'LEVT', iata: 'VIT', name: 'Vitoria Airport', city: 'Vitoria', latitude: 42.883, longitude: -2.7244 },
  { icao: 'LEBA', iata: 'ODB', name: 'Córdoba Airport', city: 'Córdoba', latitude: 37.8433, longitude: -4.8459 },
  { icao: 'LERI', iata: 'RJL', name: 'Logroño-Agoncillo', city: 'Logroño', latitude: 42.4544, longitude: -2.3208 },
  { icao: 'LEMO', iata: 'OZP', name: 'Morón Air Base', city: 'Morón de la Frontera', latitude: 37.1749, longitude: -5.6095 },
  { icao: 'LEGE', iata: 'GRO', name: 'Girona-Costa Brava', city: 'Girona', latitude: 41.901, longitude: 2.7606 },
  { icao: 'LETO', iata: 'TOJ', name: 'Torrejón Air Base', city: 'Torrejón de Ardoz', latitude: 40.4967, longitude: -3.4456 },
  { icao: 'LEFA', iata: 'FUE', name: 'Fuerteventura Airport', city: 'Puerto del Rosario', latitude: 28.4527, longitude: -13.8638 },
  { icao: 'GCRR', iata: 'ACE', name: 'Lanzarote-César Manrique', city: 'Arrecife', latitude: 28.9455, longitude: -13.605 },
  { icao: 'GCXO', iata: 'TFN', name: 'Tenerife Norte-Ciudad de La Laguna', city: 'San Cristóbal de La Laguna', latitude: 28.4827, longitude: -16.3416 },
  { icao: 'GCTS', iata: 'TFS', name: 'Tenerife Sur-Reina Sofía', city: 'Granadilla de Abona', latitude: 28.0444, longitude: -16.5725 },
  { icao: 'GCGM', iata: 'GMZ', name: 'La Gomera Airport', city: 'San Sebastián de La Gomera', latitude: 28.0296, longitude: -17.2146 },
  { icao: 'GCLP', iata: 'LPA', name: 'Gran Canaria Airport', city: 'Ingenio', latitude: 27.9319, longitude: -15.3866 },
  { icao: 'LEAB', iata: 'ABC', name: 'Albacete Airport', city: 'Albacete', latitude: 38.9494, longitude: -1.8636 },
  { icao: 'LEMR', iata: 'PIR', name: 'Alcantarilla Air Base', city: 'Murcia', latitude: 37.9511, longitude: -1.2308 },
  { icao: 'LERG', iata: 'RRO', name: 'Armilla Air Base', city: 'Granada', latitude: 37.1367, longitude: -3.6358 },
];

export const MAJOR_AIRPORTS = SPANISH_AIRPORTS.filter(a =>
  ['LEMD', 'LEBL', 'LEAL', 'LEMG', 'LEVX', 'LEIB', 'LEPA', 'LEZL', 'LEBB', 'LEST', 'GCXO', 'GCTS', 'GCRR', 'GCLP', 'LEFA'].includes(a.icao)
);

export function getAirportByIcao(icao: string): Airport | undefined {
  return SPANISH_AIRPORTS.find(a => a.icao === icao);
}

export function getAirportByIata(iata: string): Airport | undefined {
  return SPANISH_AIRPORTS.find(a => a.iata === iata);
}

export const AIRLINES: Record<string, string> = {
  'IBE': 'Iberia',
  'I2': 'Iberia Express',
  'IBS': 'Iberia Regional',
  'VLG': 'Vueling',
  'VUE': 'Vueling',
  'BLA': 'Air Europa',
  'AEA': 'Air Europa',
  'ANE': 'Air Nostrum',
  'RYR': 'Ryanair',
  'EZY': 'easyJet',
  'BAW': 'British Airways',
  'AFR': 'Air France',
  'DLH': 'Lufthansa',
  'KLM': 'KLM',
  'UAE': 'Emirates',
  'THY': 'Turkish Airlines',
  'TAP': 'TAP Portugal',
  'SAS': 'SAS',
  'SWR': 'Swiss',
  'AAL': 'American Airlines',
  'DAL': 'Delta',
  'UAL': 'United',
  'NAX': 'Norwegian',
  'WZZ': 'Wizz Air',
  'TVF': 'TUI Fly',
};

export function getAirlineName(callsign: string): string {
  const prefix = callsign.trim().replace(/\s/g, '').substring(0, 3).toUpperCase();
  return AIRLINES[prefix] || prefix;
}

export function getUniqueAirlines(): string[] {
  return Object.values(AIRLINES).sort();
}
