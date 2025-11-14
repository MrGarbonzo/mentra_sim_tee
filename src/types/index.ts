export interface Message {
  id: string;
  type: string;
  timestamp: number;
  payload: any;
}

export interface HardwareCapabilities {
  camera: boolean;
  display: boolean;
  imageDisplay: boolean;
  microphone: boolean;
  speaker: boolean;
}

export interface GlassesModel {
  id: string;
  name: string;
  capabilities: HardwareCapabilities;
  price: string;
}

export interface ConnectionState {
  connected: boolean;
  pairingCode: string;
  appInfo?: {
    packageName: string;
    name: string;
    version: string;
  };
}

export interface DisplayContent {
  type: 'textWall' | 'doubleTextWall' | 'referenceCard' | 'dashboardCard' | null;
  data: any;
  view: 'main' | 'dashboard';
  timestamp: number;
}

export interface DashboardContent {
  main: string | null;
  expanded: string | null;
}

export interface LogEntry {
  level: 'info' | 'error' | 'debug' | 'warn';
  message: string;
  context?: any;
  timestamp: number;
}
