import { ValidationError } from '../value-objects/ValidationError';
import { Result, success, failure } from '../value-objects/Result';
import { IcaoCode } from '../value-objects/IcaoCode';
import { IataCode } from '../value-objects/IataCode';

export const SPANISH_AIRPORTS_PREFIXES = ['LE', 'GC', 'LE'];
export const SPANISH_COUNTRY_CODE = 'ES';

export interface AirportProps {
  icao: string;
  iata?: string;
  name: string;
  city: string;
  country?: string;
}

export class Airport {
  public readonly icao: IcaoCode;
  public readonly iata?: IataCode;
  public readonly name: string;
  public readonly city: string;
  public readonly country: string;

  private constructor(props: {
    icao: IcaoCode;
    iata?: IataCode;
    name: string;
    city: string;
    country: string;
  }) {
    this.icao = props.icao;
    this.iata = props.iata;
    this.name = props.name;
    this.city = props.city;
    this.country = props.country;
    Object.freeze(this);
  }

  static create(props: AirportProps): Result<Airport, ValidationError> {
    const icaoResult = IcaoCode.create(props.icao);
    if (!icaoResult.ok) {
      return failure(icaoResult.error);
    }

    let iataResult: IataCode | undefined;
    if (props.iata) {
      const iataCreateResult = IataCode.create(props.iata);
      if (!iataCreateResult.ok) {
        return failure(iataCreateResult.error);
      }
      iataResult = iataCreateResult.value;
    }

    if (!props.name || typeof props.name !== 'string') {
      return failure(ValidationError.required('Airport name'));
    }

    if (!props.city || typeof props.city !== 'string') {
      return failure(ValidationError.required('Airport city'));
    }

    const country = props.country || 'Spain';

    return success(
      new Airport({
        icao: icaoResult.value,
        iata: iataResult,
        name: props.name,
        city: props.city,
        country,
      })
    );
  }

  static createUnsafe(props: AirportProps): Airport {
    const result = Airport.create(props);
    if (!result.ok) {
      throw new Error(result.error.toString());
    }
    return result.value;
  }

  static createSpanish(icao: string, iata: string, name: string, city: string): Result<Airport, ValidationError> {
    return Airport.create({
      icao,
      iata,
      name,
      city,
      country: 'Spain',
    });
  }

  isSpanish(): boolean {
    const prefix = this.icao.value.slice(0, 2);
    return SPANISH_AIRPORTS_PREFIXES.includes(prefix) || this.country === 'Spain';
  }

  isMajor(): boolean {
    const majorAirports = ['LEMD', 'LEBL', 'LEAL', 'LEPA', 'LEM G', 'GCXO', 'LEXJ', 'LEVC'];
    return majorAirports.includes(this.icao.value);
  }

  matches(query: string): boolean {
    const lowerQuery = query.toLowerCase().trim();
    if (!lowerQuery) return false;

    return (
      this.icao.value.toLowerCase().includes(lowerQuery) ||
      this.iata?.value.toLowerCase().includes(lowerQuery) ||
      this.name.toLowerCase().includes(lowerQuery) ||
      this.city.toLowerCase().includes(lowerQuery)
    );
  }

  getDisplayCode(format: 'icao' | 'iata' | 'auto' = 'auto'): string {
    if (format === 'icao') return this.icao.value;
    if (format === 'iata') return this.iata?.value || this.icao.value;
    return this.iata?.value || this.icao.value;
  }

  getLocation(): string {
    return `${this.city}, ${this.country}`;
  }

  equals(other: Airport): boolean {
    return this.icao.equals(other.icao);
  }

  toString(): string {
    const code = this.iata?.value || this.icao.value;
    return `${code} - ${this.name} (${this.city})`;
  }

  toPlainObject(): AirportProps {
    return {
      icao: this.icao.toString(),
      iata: this.iata?.toString(),
      name: this.name,
      city: this.city,
      country: this.country,
    };
  }
}
