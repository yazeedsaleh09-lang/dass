import { createDemoPlatform, createUnavailablePlatform } from './demo-platform.js';
import type { PlatformServices, StorageLike } from './types.js';

declare const DASS_DEMO_MODE: boolean;

const memory = new Map<string, string>();
const fallbackStorage: StorageLike = {
  getItem: (key) => memory.get(key) ?? null,
  setItem: (key, value) => { memory.set(key, value); },
  removeItem: (key) => { memory.delete(key); },
};

const storage = typeof localStorage === 'undefined' ? fallbackStorage : localStorage;
const configuredDemoMode = typeof DASS_DEMO_MODE === 'undefined' ? true : DASS_DEMO_MODE;

export const platform: PlatformServices = configuredDemoMode
  ? createDemoPlatform(storage)
  : createUnavailablePlatform();

export const demoMode = configuredDemoMode;
