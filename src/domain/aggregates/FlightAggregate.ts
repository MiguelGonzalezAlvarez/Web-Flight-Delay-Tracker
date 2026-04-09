import { Flight, FlightProps } from '../entities/Flight';
import { DelayPrediction, DelayPredictionProps } from '../entities/DelayPrediction';
import { Route } from '../entities/Route';
import { ValidationError } from '../value-objects/ValidationError';
import { Result, success, failure } from '../value-objects/Result';
import { FlightStatus } from '../value-objects/FlightStatus';
import { RiskLevel } from '../value-objects/RiskLevel';

type ValidStatusTransition = {
  from: string;
  to: string[];
};

const VALID_STATUS_TRANSITIONS: ValidStatusTransition[] = [
  { from: 'scheduled', to: ['boarding', 'delayed', 'cancelled'] },
  { from: 'boarding', to: ['departed', 'cancelled'] },
  { from: 'departed', to: ['arrived', 'delayed'] },
  { from: 'arrived', to: [] },
  { from: 'delayed', to: ['boarding', 'departed', 'cancelled'] },
  { from: 'cancelled', to: [] },
  { from: 'unknown', to: ['scheduled', 'cancelled'] },
];

export interface FlightAggregateProps {
  flight: FlightProps;
}

export class FlightAggregate {
  private _flight: Flight;
  private _prediction: DelayPrediction | null = null;

  private constructor(flight: Flight, prediction: DelayPrediction | null = null) {
    this._flight = flight;
    this._prediction = prediction;
    Object.freeze(this);
  }

  static create(props: FlightAggregateProps): Result<FlightAggregate, ValidationError> {
    const routeResult = Route.create({
      origin: props.flight.origin,
      destination: props.flight.destination,
    });
    if (!routeResult.ok) {
      return failure(routeResult.error);
    }

    if (props.flight.departureTime && props.flight.arrivalTime) {
      if (props.flight.departureTime >= props.flight.arrivalTime) {
        return failure(ValidationError.invalid('Flight times', 'Arrival time must be after departure time'));
      }
    }

    const flightResult = Flight.create(props.flight);
    if (!flightResult.ok) {
      return failure(flightResult.error);
    }

    let prediction: DelayPrediction | null = null;
    if (props.flight.delayPrediction) {
      const predResult = DelayPrediction.create(props.flight.delayPrediction);
      if (!predResult.ok) {
        return failure(predResult.error);
      }
      prediction = predResult.value;
    }

    return success(new FlightAggregate(flightResult.value, prediction));
  }

  static createFromFlight(flight: Flight, prediction: DelayPrediction | null = null): FlightAggregate {
    return new FlightAggregate(flight, prediction);
  }

  static createUnsafe(props: FlightAggregateProps): FlightAggregate {
    const result = FlightAggregate.create(props);
    if (!result.ok) {
      throw new Error(result.error.toString());
    }
    return result.value;
  }

  get flight(): Flight {
    return this._flight;
  }

  get prediction(): DelayPrediction | null {
    return this._prediction;
  }

  get route(): Route {
    return Route.createUnsafe({
      origin: this._flight.origin.toString(),
      destination: this._flight.destination.toString(),
    });
  }

  isValidTransition(newStatus: string): boolean {
    const currentStatus = this._flight.status.toString();
    const transition = VALID_STATUS_TRANSITIONS.find((t) => t.from === currentStatus);
    if (!transition) return false;
    return transition.to.includes(newStatus);
  }

  changeStatus(newStatus: string): Result<FlightAggregate, ValidationError> {
    if (!this.isValidTransition(newStatus)) {
      return failure(
        ValidationError.invalid('Flight status', `Cannot transition from '${this._flight.status.toString()}' to '${newStatus}'`)
      );
    }

    const updatedProps: FlightProps = {
      ...this._flight.toPlainObject(),
      status: newStatus as FlightProps['status'],
    };

    const updatedFlightResult = Flight.create(updatedProps);
    if (!updatedFlightResult.ok) {
      return failure(updatedFlightResult.error);
    }

    return success(new FlightAggregate(updatedFlightResult.value, this._prediction));
  }

  attachPrediction(predictionProps: DelayPredictionProps): Result<FlightAggregate, ValidationError> {
    if (!this._flight.status.isActive()) {
      return failure(ValidationError.invalid('Prediction', 'Cannot attach prediction to non-active flight'));
    }

    const predictionResult = DelayPrediction.create(predictionProps);
    if (!predictionResult.ok) {
      return failure(predictionResult.error);
    }

    return success(new FlightAggregate(this._flight, predictionResult.value));
  }

  removePrediction(): FlightAggregate {
    return new FlightAggregate(this._flight, null);
  }

  isOnTime(): boolean {
    return !this._flight.isDelayed();
  }

  getFlightDurationMinutes(): number | null {
    if (!this._flight.departureTime || !this._flight.arrivalTime) {
      return null;
    }
    return Math.round((this._flight.arrivalTime.getTime() - this._flight.departureTime.getTime()) / 60000);
  }

  getDelayRisk(): 'low' | 'medium' | 'high' | 'unknown' {
    return this._prediction?.riskLevel.value ?? 'unknown';
  }

  requiresAttention(): boolean {
    if (this._flight.requiresAttention()) {
      return true;
    }
    if (this._prediction?.requiresAction()) {
      return true;
    }
    return false;
  }

  equals(other: FlightAggregate): boolean {
    return this._flight.equals(other._flight);
  }
}
