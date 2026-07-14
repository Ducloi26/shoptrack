import type { CarrierId } from '@shared';
import { SpxTracker } from './spx';
import { GhnTracker } from './ghn';
import type { CarrierTracker } from './base';

const registry: Partial<Record<CarrierId, CarrierTracker>> = {
  SPX: new SpxTracker(),
  GHN: new GhnTracker(),
};

export function getTracker(carrierId: CarrierId): CarrierTracker | null {
  return registry[carrierId] ?? null;
}

export function getSupportedCarriers(): CarrierId[] {
  return Object.keys(registry) as CarrierId[];
}
