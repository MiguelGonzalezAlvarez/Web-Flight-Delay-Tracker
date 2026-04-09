export {
  createMock,
  waitFor,
  createFakeTimers,
  assertIsError,
  assertResultOk,
  assertResultFail,
  createDeferredPromise,
  createRejectionHandler,
  TestContainer,
  createEventEmitter,
  type MockFunction,
} from './utils/testHelpers';

export {
  createFlightProps,
  createFlight,
  createAirportProps,
  createAirport,
  createDelayPredictionProps,
  createDelayPrediction,
  SPANISH_AIRPORTS_FIXTURES,
  FLIGHT_FIXTURES,
  DELAY_PREDICTION_FIXTURES,
} from './fixtures/domainFixtures';
