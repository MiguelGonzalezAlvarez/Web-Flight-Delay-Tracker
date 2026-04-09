export function sanitizeString(input: string): string {
  return input.trim().replace(/[<>\"'&]/g, '');
}

export function sanitizeCallsign(input: string): string {
  return input.trim().toUpperCase().replace(/[^A-Z0-9]/g, '').substring(0, 10);
}

export function sanitizeIcao(input: string): string {
  return input.trim().toUpperCase().replace(/[^A-Z0-9]/g, '').substring(0, 4);
}

export function validateIcao(icao: string): boolean {
  return /^[A-Z0-9]{4}$/.test(icao.toUpperCase());
}

export function validateIata(iata: string): boolean {
  return /^[A-Z0-9]{2,3}$/.test(iata.toUpperCase());
}

export function validateCallsign(callsign: string): boolean {
  return callsign.length >= 2 && callsign.length <= 10 && /^[A-Z0-9 ]+$/i.test(callsign);
}

export function validateFlightType(type: string): type is 'departures' | 'arrivals' {
  return type === 'departures' || type === 'arrivals';
}

export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}
