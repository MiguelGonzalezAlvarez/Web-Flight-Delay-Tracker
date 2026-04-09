import { ValidationError } from '../value-objects/ValidationError';
import { Result, success, failure, isSuccess } from '../value-objects/Result';
import { IcaoCode } from '../value-objects/IcaoCode';
import { Callsign } from '../value-objects/Callsign';
import { FlightStatus } from '../value-objects/FlightStatus';
import { DelayPrediction } from './DelayPrediction';

export type FlightType = 'departure' | 'arrival';

export interface FlightProps {
  id: string;
  callsign: string;
  airline: string;
  origin: string;
  destination: string;
  departureTime?: Date;
  arrivalTime?: Date;
  status?: string;
  delayPrediction?: {
    percentage: number;
    riskLevel: 'low' | 'medium' | 'high';
    avgDelayMinutes: number;
    basedOnRecords: number;
  };
}

export class Flight {
  public readonly id: string;
  public readonly callsign: Callsign;
  public readonly airline: string;
  public readonly origin: IcaoCode;
  public readonly destination: IcaoCode;
  public readonly departureTime?: Date;
  public readonly arrivalTime?: Date;
  public readonly status: FlightStatus;
  public readonly delayPrediction?: DelayPrediction;

  private constructor(props: {
    id: string;
    callsign: Callsign;
    airline: string;
    origin: IcaoCode;
    destination: IcaoCode;
    departureTime?: Date;
    arrivalTime?: Date;
    status: FlightStatus;
    delayPrediction?: DelayPrediction;
  }) {
    this.id = props.id;
    this.callsign = props.callsign;
    this.airline = props.airline;
    this.origin = props.origin;
    this.destination = props.destination;
    this.departureTime = props.departureTime;
    this.arrivalTime = props.arrivalTime;
    this.status = props.status;
    this.delayPrediction = props.delayPrediction;
    Object.freeze(this);
  }

  static create(props: FlightProps): Result<Flight, ValidationError> {
    if (!props.id || typeof props.id !== 'string') {
      return failure(ValidationError.required('Flight id'));
    }

    const callsignResult = Callsign.create(props.callsign);
    if (!callsignResult.ok) {
      return failure(callsignResult.error);
    }

    const originResult = IcaoCode.create(props.origin);
    if (!originResult.ok) {
      return failure(originResult.error);
    }

    const destinationResult = IcaoCode.create(props.destination);
    if (!destinationResult.ok) {
      return failure(destinationResult.error);
    }

    const statusResult = FlightStatus.create(props.status || 'unknown');
    if (!statusResult.ok) {
      return failure(statusResult.error);
    }

    let delayPrediction: DelayPrediction | undefined;
    if (props.delayPrediction) {
      const predResult = DelayPrediction.create(props.delayPrediction);
      if (!predResult.ok) {
        return failure(predResult.error);
      }
      delayPrediction = predResult.value;
    }

    return success(
      new Flight({
        id: props.id,
        callsign: callsignResult.value,
        airline: props.airline,
        origin: originResult.value,
        destination: destinationResult.value,
        departureTime: props.departureTime,
        arrivalTime: props.arrivalTime,
        status: statusResult.value,
        delayPrediction,
      })
    );
  }

  static createUnsafe(props: FlightProps): Flight {
    const result = Flight.create(props);
    if (!result.ok) {
      throw new Error(result.error.toString());
    }
    return result.value;
  }

  hasPrediction(): boolean {
    return this.delayPrediction !== undefined;
  }

  isDelayed(): boolean {
    return this.status.isDelayed();
  }

  isActive(): boolean {
    return this.status.isActive();
  }

  isCompleted(): boolean {
    return this.status.isCompleted();
  }

  requiresAttention(): boolean {
    return this.status.requiresAttention() || (this.delayPrediction?.requiresWarning() ?? false);
  }

  getRoute(): string {
    return `${this.origin.toString()} → ${this.destination.toString()}`;
  }

  getScheduledTime(): Date | undefined {
    return this.departureTime || this.arrivalTime;
  }

  hasDeparted(): boolean {
    return this.status.value === 'departed' || this.status.value === 'arrived';
  }

  hasArrived(): boolean {
    return this.status.value === 'arrived';
  }

  equals(other: Flight): boolean {
    return this.id === other.id;
  }

  toString(): string {
    return `Flight ${this.callsign.toString()} (${this.getRoute()})`;
  }

  toPlainObject(): FlightProps {
    return {
      id: this.id,
      callsign: this.callsign.toString(),
      airline: this.airline,
      origin: this.origin.toString(),
      destination: this.destination.toString(),
      departureTime: this.departureTime,
      arrivalTime: this.arrivalTime,
      status: this.status.toString(),
      delayPrediction: this.delayPrediction?.toPlainObject(),
    };
  }
}
