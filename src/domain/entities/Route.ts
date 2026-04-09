import { ValidationError } from '../value-objects/ValidationError';
import { Result, success, failure } from '../value-objects/Result';
import { IcaoCode } from '../value-objects/IcaoCode';

export interface RouteProps {
  origin: string;
  destination: string;
}

export class Route {
  public readonly origin: IcaoCode;
  public readonly destination: IcaoCode;

  private constructor(origin: IcaoCode, destination: IcaoCode) {
    this.origin = origin;
    this.destination = destination;
    Object.freeze(this);
  }

  static create(props: RouteProps): Result<Route, ValidationError> {
    if (!props.origin || !props.destination) {
      return failure(ValidationError.required('Route origin or destination'));
    }

    if (props.origin.toUpperCase() === props.destination.toUpperCase()) {
      return failure(ValidationError.invalid('Route', 'Origin and destination must be different'));
    }

    const originResult = IcaoCode.create(props.origin);
    if (!originResult.ok) {
      return failure(originResult.error);
    }

    const destinationResult = IcaoCode.create(props.destination);
    if (!destinationResult.ok) {
      return failure(destinationResult.error);
    }

    return success(new Route(originResult.value, destinationResult.value));
  }

  static createUnsafe(props: RouteProps): Route {
    const result = Route.create(props);
    if (!result.ok) {
      throw new Error(result.error.toString());
    }
    return result.value;
  }

  equals(other: Route): boolean {
    return this.origin.equals(other.origin) && this.destination.equals(other.destination);
  }

  isSameAs(other: Route): boolean {
    return this.equals(other);
  }

  toString(): string {
    return `${this.origin.toString()} → ${this.destination.toString()}`;
  }

  toCompactString(): string {
    return `${this.origin.toString()}-${this.destination.toString()}`;
  }

  isDomestic(): boolean {
    const originPrefix = this.origin.value.slice(0, 2);
    const destPrefix = this.destination.value.slice(0, 2);
    return originPrefix === destPrefix;
  }

  isInterIsland(): boolean {
    const originPrefix = this.origin.value.slice(0, 2);
    const destPrefix = this.destination.value.slice(0, 2);
    return (
      (originPrefix === 'LE' && destPrefix === 'GC') ||
      (originPrefix === 'GC' && destPrefix === 'LE')
    );
  }
}
