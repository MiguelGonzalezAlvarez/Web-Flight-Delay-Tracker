export const AIRPORTS = {
  MADRID: 'LEMD',
  BARCELONA: 'LEBL',
  PALMA: 'LEPA',
  MALAGA: 'LEMG',
  SEVILLE: 'LEZL',
  BILBAO: 'LEBB',
  VALENCIA: 'LEVC',
  TENERIFE_SUR: 'GCTS',
  GRAN_CANARIA: 'GCLP',
  LANZAROTE: 'GCRR',
} as const;

export const SPAIN_ICAO_PREFIXES = ['LE', 'GC'] as const;

export const FLIGHT_STATUS = {
  SCHEDULED: 'scheduled',
  BOARDING: 'boarding',
  DEPARTED: 'departed',
  ARRIVED: 'arrived',
  DELAYED: 'delayed',
  CANCELLED: 'cancelled',
  UNKNOWN: 'unknown',
} as const;

export const RISK_LEVEL = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
} as const;

export const CACHE_KEYS = {
  FLIGHTS_BY_AIRPORT: 'flights:airport:',
  AIRPORTS_ALL: 'airports:all',
  SPANISH_AIRPORTS: 'airports:spanish',
  DELAY_PREDICTION: 'delay:prediction:',
} as const;

export const API_ENDPOINTS = {
  OPENSKY_FLIGHTS: '/flights/all',
  OPENSKY_ARRIVALS: '/flights/arrival',
  OPENSKY_DEPARTURES: '/flights/departure',
  OPENSKY_AIRCRAFT: '/flights/aircraft',
} as const;

export const TIMEOUTS = {
  API_REQUEST: 30000,
  CACHE_FLIGHT: 30000,
  CACHE_AIRPORT: 3600000,
  REFRESH_INTERVAL: 60000,
  DEBOUNCE_DELAY: 300,
} as const;

export const LIMITS = {
  MAX_FLIGHTS_CACHE: 500,
  MAX_AIRPORTS_CACHE: 50,
  MAX_SEARCH_RESULTS: 100,
  MAX_HISTORY_ITEMS: 20,
} as const;

export const DATE_FORMATS = {
  SHORT: 'DD/MM/YYYY',
  LONG: 'DD [de] MMMM [de] YYYY',
  TIME: 'HH:mm',
  DATETIME: 'DD/MM/YYYY HH:mm',
  ISO: 'YYYY-MM-DDTHH:mm:ss',
} as const;

export const LOCAL_STORAGE_KEYS = {
  SELECTED_AIRPORT: 'selectedAirport',
  THEME: 'theme',
  LAST_SEARCH: 'lastSearch',
  FAVORITE_FLIGHTS: 'favoriteFlights',
  SETTINGS: 'settings',
} as const;

export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Unable to connect. Please check your internet connection.',
  API_ERROR: 'An error occurred while fetching flight data.',
  NOT_FOUND: 'Flight not found.',
  TIMEOUT: 'Request timed out. Please try again.',
  INVALID_AIRPORT: 'Invalid airport code.',
  UNAUTHORIZED: 'Authentication required.',
} as const;

export const SUCCESS_MESSAGES = {
  FLIGHT_ADDED: 'Flight added to favorites.',
  FLIGHT_REMOVED: 'Flight removed from favorites.',
  SETTINGS_SAVED: 'Settings saved successfully.',
  DATA_REFRESHED: 'Data refreshed.',
} as const;
