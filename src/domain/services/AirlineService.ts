export const AIRLINE_CODES: Record<string, string> = {
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
  'ROT': 'Blue Air',
  'WZA': 'Wizz Air Abu Dhabi',
  'LOT': 'LOT Polish Airlines',
  'FIN': 'Finnair',
  'DLM': 'Deipeyter',
  'BER': 'Eurowings',
  'EJU': 'easyJet Europe',
  'EZS': 'easyJet Switzerland',
  'TUI': 'TUI Airways',
  'SEY': 'Air Seychelles',
  'QTR': 'Qatar Airways',
  'ETH': 'Ethiopian Airlines',
  'KQA': 'Kenya Airways',
  'CPA': 'Cathay Pacific',
  'CAL': 'China Airlines',
  'CSN': 'China Southern',
  'CCA': 'Air China',
  'CES': 'China Eastern',
  'CXA': 'XiamenAir',
  'OAL': 'Olympic Air',
  'AEE': 'Aegean Airlines',
  'FRY': 'Ryanair Sun',
  'EVE': 'Air Nostrum',
};

export class AirlineService {
  private static instance: AirlineService;
  private airlineCodes: Map<string, string>;

  private constructor() {
    this.airlineCodes = new Map(Object.entries(AIRLINE_CODES));
  }

  static getInstance(): AirlineService {
    if (!AirlineService.instance) {
      AirlineService.instance = new AirlineService();
    }
    return AirlineService.instance;
  }

  getAirlineName(callsign: string): string {
    const cleaned = callsign.trim().replace(/\s/g, '').toUpperCase();
    if (cleaned.length >= 3) {
      const code = cleaned.substring(0, 3);
      return this.airlineCodes.get(code) || code;
    }
    return 'Unknown';
  }

  getAirlineCode(callsign: string): string {
    const cleaned = callsign.trim().replace(/\s/g, '').toUpperCase();
    if (cleaned.length >= 3) {
      return cleaned.substring(0, 3);
    }
    return 'UNK';
  }

  isKnownAirline(callsign: string): boolean {
    const code = this.getAirlineCode(callsign);
    return this.airlineCodes.has(code);
  }

  getAllAirlines(): string[] {
    return [...new Set(this.airlineCodes.values())].sort();
  }

  addAirlineCode(code: string, name: string): void {
    this.airlineCodes.set(code.toUpperCase(), name);
  }
}

export function getAirlineName(callsign: string): string {
  return AirlineService.getInstance().getAirlineName(callsign);
}

export function getAirlineCode(callsign: string): string {
  return AirlineService.getInstance().getAirlineCode(callsign);
}

export function isKnownAirline(callsign: string): boolean {
  return AirlineService.getInstance().isKnownAirline(callsign);
}
