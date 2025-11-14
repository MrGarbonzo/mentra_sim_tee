import type { GlassesModel } from '../types';

export const GLASSES_MODELS: Record<string, GlassesModel> = {
  'demo-all': {
    id: 'demo-all',
    name: 'Demo Glasses (All Features)',
    capabilities: {
      camera: true,
      display: true,
      imageDisplay: true,
      microphone: true,
      speaker: true
    },
    price: 'Demo Only'
  },
  'even-g1': {
    id: 'even-g1',
    name: 'Even Realities G1',
    capabilities: {
      camera: false,
      display: true,
      imageDisplay: true,
      microphone: true,
      speaker: true
    },
    price: '~$600'
  },
  'mentra-live': {
    id: 'mentra-live',
    name: 'Mentra Live',
    capabilities: {
      camera: true,
      display: false,
      imageDisplay: false,
      microphone: true,
      speaker: true
    },
    price: '$249'
  },
  'mentra-mach1': {
    id: 'mentra-mach1',
    name: 'Mentra Mach 1',
    capabilities: {
      camera: false,
      display: true,
      imageDisplay: false,
      microphone: false, // Via phone
      speaker: false
    },
    price: 'TBD'
  },
  'vuzix-z100': {
    id: 'vuzix-z100',
    name: 'Vuzix Z100',
    capabilities: {
      camera: false,
      display: true,
      imageDisplay: false,
      microphone: false, // Via phone
      speaker: false
    },
    price: '~$500'
  }
};

export const DEFAULT_MODEL = 'demo-all';
