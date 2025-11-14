import { createServer } from 'http';
import { Server } from 'socket.io';
import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

// Serve static files from dist directory
app.use(express.static(join(__dirname, 'dist')));

// Serve index.html for all routes (SPA)
app.get('*', (req, res) => {
  res.sendFile(join(__dirname, 'dist', 'index.html'));
});

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Store active sessions
const sessions = new Map();
// Store pairing codes
const pairingCodes = new Map();

// Hardware specs for each model
const HARDWARE_SPECS = {
  'demo-all': {
    name: 'Demo Glasses (All Features)',
    capabilities: {
      textDisplay: true,
      imageDisplay: true,
      camera: true,
      microphone: true,
      speaker: true
    }
  },
  'even-g1': {
    name: 'Even Realities G1',
    capabilities: {
      textDisplay: true,
      imageDisplay: true,
      camera: false,
      microphone: true,
      speaker: true
    }
  },
  'mentra-live': {
    name: 'Mentra Live',
    capabilities: {
      textDisplay: false,
      imageDisplay: false,
      camera: true,
      microphone: true,
      speaker: true
    }
  },
  'mentra-mach1': {
    name: 'Mentra Mach 1',
    capabilities: {
      textDisplay: true,
      imageDisplay: false,
      camera: false,
      microphone: false, // via phone
      speaker: false
    }
  },
  'vuzix-z100': {
    name: 'Vuzix Z100',
    capabilities: {
      textDisplay: true,
      imageDisplay: false,
      camera: false,
      microphone: false, // via phone
      speaker: false
    }
  }
};

// Generate 6-digit pairing code
function generatePairingCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Create initial pairing code
let currentPairingCode = generatePairingCode();
let currentModel = 'demo-all'; // Default model
console.log(`🔑 Initial pairing code: ${currentPairingCode}`);

io.on('connection', (socket) => {
  console.log(`📱 Client connected: ${socket.id}`);

  // Handle simulator (web UI) connection
  socket.on('simulator:register', () => {
    socket.isSimulator = true;
    socket.emit('simulator:registered', {
      pairingCode: currentPairingCode
    });
    console.log(`🖥️  Simulator registered: ${socket.id}`);
  });

  // Handle model selection from simulator
  socket.on('simulator:model-changed', (data) => {
    if (socket.isSimulator) {
      currentModel = data.model;
      console.log(`🔄 Model changed to: ${HARDWARE_SPECS[currentModel]?.name || currentModel}`);
    }
  });

  // Handle SDK app connection
  socket.on('sdk:connect', (data) => {
    const { code, appInfo } = data.payload;

    if (code === currentPairingCode) {
      // Valid pairing code
      socket.isSDK = true;
      socket.appInfo = appInfo;

      // Find simulator client
      const simulatorSocket = Array.from(io.sockets.sockets.values())
        .find(s => s.isSimulator);

      if (simulatorSocket) {
        // Link SDK and simulator
        socket.simulatorId = simulatorSocket.id;
        simulatorSocket.sdkId = socket.id;

        // Get current model capabilities
        const modelSpec = HARDWARE_SPECS[currentModel] || HARDWARE_SPECS['even-g1'];
        
        // Send connected response to SDK with actual model
        socket.emit('connected', {
          sessionId: socket.id,
          model: currentModel,
          capabilities: {
            camera: modelSpec.capabilities.camera,
            display: modelSpec.capabilities.textDisplay || modelSpec.capabilities.imageDisplay
          }
        });

        // Notify simulator
        simulatorSocket.emit('sdk:connected', {
          appInfo,
          sdkId: socket.id
        });

        console.log(`✅ SDK connected: ${appInfo.packageName} (Model: ${modelSpec.name})`);

        // Generate new pairing code for next connection
        currentPairingCode = generatePairingCode();
        console.log(`🔑 New pairing code: ${currentPairingCode}`);
        simulatorSocket.emit('pairing:updated', {
          pairingCode: currentPairingCode
        });
      } else {
        socket.emit('error', {
          code: 'NO_SIMULATOR',
          message: 'Simulator not connected'
        });
      }
    } else {
      socket.emit('error', {
        code: 'INVALID_PAIRING_CODE',
        message: 'Invalid pairing code'
      });
    }
  });

  // Route messages from SDK to simulator
  socket.on('message', (message) => {
    if (socket.isSDK && socket.simulatorId) {
      const simulatorSocket = io.sockets.sockets.get(socket.simulatorId);
      if (simulatorSocket) {
        // Convert message object to JSON string for browser
        const messageStr = typeof message === 'string' ? message : JSON.stringify(message);
        simulatorSocket.emit('sdk:message', messageStr);
      }
    }
  });

  // Route messages from simulator to SDK
  socket.on('simulator:message', (message) => {
    if (socket.isSimulator && socket.sdkId) {
      const sdkSocket = io.sockets.sockets.get(socket.sdkId);
      if (sdkSocket) {
        sdkSocket.emit('message', JSON.stringify(message));
      }
    }
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    if (socket.isSDK) {
      console.log(`❌ SDK disconnected: ${socket.appInfo?.packageName || socket.id}`);

      // Notify simulator
      if (socket.simulatorId) {
        const simulatorSocket = io.sockets.sockets.get(socket.simulatorId);
        if (simulatorSocket) {
          simulatorSocket.emit('sdk:disconnected');
          simulatorSocket.sdkId = null;
        }
      }
    } else if (socket.isSimulator) {
      console.log(`❌ Simulator disconnected: ${socket.id}`);
    }
  });
});

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 WebSocket server running on http://0.0.0.0:${PORT}`);
  console.log(`🔑 Pairing code: ${currentPairingCode}`);
});

// Keep the process alive
process.on('SIGTERM', () => {
  console.log('Received SIGTERM, shutting down...');
  httpServer.close(() => {
    console.log('HTTP server closed');
    io.close(() => {
      console.log('Socket.IO server closed');
      process.exit(0);
    });
  });
});

process.on('SIGINT', () => {
  console.log('Received SIGINT, shutting down...');
  httpServer.close(() => {
    console.log('HTTP server closed');
    io.close(() => {
      console.log('Socket.IO server closed');
      process.exit(0);
    });
  });
});

console.log('Server is running. Press Ctrl+C to exit.');
