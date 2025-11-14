import { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import type { ConnectionState, DisplayContent, LogEntry, Message } from './types';
import { GLASSES_MODELS, DEFAULT_MODEL } from './lib/hardware-specs';
import ConnectionPanel from './components/ConnectionPanel';
import ModelSelector from './components/ModelSelector';
import GlassesDisplay from './components/GlassesDisplay';
import CameraCapture from './components/CameraCapture';
import TranscriptionInput from './components/TranscriptionInput';
import DebugConsole from './components/DebugConsole';

function App() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connectionState, setConnectionState] = useState<ConnectionState>({
    connected: false,
    pairingCode: '',
  });
  const [selectedModel, setSelectedModel] = useState(DEFAULT_MODEL);
  const [displayContent, setDisplayContent] = useState<DisplayContent>({
    type: null,
    data: null,
    view: 'main',
    timestamp: 0,
  });
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [pendingCameraRequest, setPendingCameraRequest] = useState<Message | null>(null);

  const socketRef = useRef<Socket | null>(null);

  // Initialize WebSocket connection
  useEffect(() => {
    // Use direct IP for WebSocket to work with ngrok
    const wsUrl = window.location.hostname.includes('ngrok')
      ? 'http://104.131.104.100:3001'
      : `http://${window.location.hostname}:3001`;
    const newSocket = io(wsUrl);
    socketRef.current = newSocket;
    setSocket(newSocket);

    // Register as simulator
    newSocket.emit('simulator:register');

    // Handle registration response
    newSocket.on('simulator:registered', (data: { pairingCode: string }) => {
      addLog('info', 'Simulator registered', { pairingCode: data.pairingCode });
      setConnectionState({
        connected: false,
        pairingCode: data.pairingCode,
      });
    });

    // Handle pairing code updates
    newSocket.on('pairing:updated', (data: { pairingCode: string }) => {
      addLog('info', 'Pairing code updated', { pairingCode: data.pairingCode });
      setConnectionState((prev) => ({
        ...prev,
        pairingCode: data.pairingCode,
      }));
    });

    // Handle SDK connection
    newSocket.on('sdk:connected', (data: { appInfo: any; sdkId: string }) => {
      addLog('info', 'SDK app connected', data.appInfo);
      setConnectionState({
        connected: true,
        pairingCode: connectionState.pairingCode,
        appInfo: data.appInfo,
      });
    });

    // Handle SDK disconnection
    newSocket.on('sdk:disconnected', () => {
      addLog('warn', 'SDK app disconnected');
      setConnectionState((prev) => ({
        ...prev,
        connected: false,
        appInfo: undefined,
      }));
      setDisplayContent({
        type: null,
        data: null,
        view: 'main',
        timestamp: 0,
      });
    });

    // Handle messages from SDK
    newSocket.on('sdk:message', (message: string) => {
      try {
        const msg: Message = JSON.parse(message);
        handleSDKMessage(msg);
      } catch (error) {
        addLog('error', 'Failed to parse SDK message', { error });
      }
    });

    return () => {
      newSocket.close();
    };
  }, []);

  const addLog = (level: LogEntry['level'], message: string, context?: any) => {
    const entry: LogEntry = {
      level,
      message,
      context,
      timestamp: Date.now(),
    };
    setLogs((prev) => [...prev, entry]);
  };

  const handleSDKMessage = (message: Message) => {
    addLog('debug', `Received: ${message.type}`, message.payload);

    // Handle layout messages
    if (message.type === 'layout.showTextWall') {
      setDisplayContent({
        type: 'textWall',
        data: message.payload,
        view: message.payload.options?.view || 'main',
        timestamp: message.timestamp,
      });
    } else if (message.type === 'layout.showDoubleTextWall') {
      setDisplayContent({
        type: 'doubleTextWall',
        data: message.payload,
        view: message.payload.options?.view || 'main',
        timestamp: message.timestamp,
      });
    } else if (message.type === 'layout.showReferenceCard') {
      setDisplayContent({
        type: 'referenceCard',
        data: message.payload,
        view: message.payload.options?.view || 'main',
        timestamp: message.timestamp,
      });
    } else if (message.type === 'layout.showDashboardCard') {
      setDisplayContent({
        type: 'dashboardCard',
        data: message.payload,
        view: message.payload.options?.view || 'main',
        timestamp: message.timestamp,
      });
    } else if (message.type === 'layout.clear') {
      setDisplayContent({
        type: null,
        data: null,
        view: 'main',
        timestamp: message.timestamp,
      });
    } else if (message.type === 'camera.requestPhoto') {
      // Store pending request for user interaction
      setPendingCameraRequest(message);
      addLog('info', 'Camera request activated - upload photo now!');
    }
  };

  const sendMessageToSDK = (message: Message) => {
    if (socket && connectionState.connected) {
      addLog('debug', `Sending: ${message.type}`, message.payload);
      socket.emit('simulator:message', message);
    }
  };

  const handleCameraPhoto = (base64Data: string, mimeType: string) => {
    if (pendingCameraRequest) {
      const response: Message = {
        id: pendingCameraRequest.id,
        type: 'camera.photoResult',
        timestamp: Date.now(),
        payload: {
          buffer: base64Data,
          mimeType,
          size: base64Data.length,
        },
      };

      sendMessageToSDK(response);
      setPendingCameraRequest(null);
    }
  };

  const handleTranscription = (text: string, isFinal: boolean, language?: string) => {
    const message: Message = {
      id: `trans-${Date.now()}`,
      type: 'event.transcription',
      timestamp: Date.now(),
      payload: {
        text,
        isFinal,
        transcribeLanguage: language,
      },
    };
    sendMessageToSDK(message);
  };

  const handleModelChange = (modelId: string) => {
    setSelectedModel(modelId);
    // Notify server of model change
    if (socket) {
      socket.emit('simulator:model-changed', { model: modelId });
      addLog('info', `Model changed to: ${GLASSES_MODELS[modelId].name}`);
    }
  };

  const currentModel = GLASSES_MODELS[selectedModel];

  return (
    <div className="min-h-screen bg-gray-900 text-white overflow-x-hidden">
      <div className="container mx-auto px-6 py-8 max-w-full">
        <header className="mb-8">
          <h1 className="text-4xl font-bold mb-2">MentraOS Glasses Simulator</h1>
          <p className="text-gray-400">
            Test your MentraOS apps without physical hardware
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Column: Model Selector */}
          <div className="lg:col-span-1">
            <ModelSelector
              selectedModel={selectedModel}
              onModelChange={handleModelChange}
              disabled={connectionState.connected}
            />
          </div>

          {/* Main Display - Takes up 2 columns */}
          <div className="lg:col-span-2">
            <GlassesDisplay
              model={currentModel}
              displayContent={displayContent}
            />
          </div>

          {/* Right Column: Controls */}
          <div className="space-y-6 lg:col-span-1">
            {currentModel.capabilities.camera && (
              <CameraCapture
                onPhotoCapture={handleCameraPhoto}
                isPending={!!pendingCameraRequest}
              />
            )}
            {currentModel.capabilities.microphone && (
              <TranscriptionInput onTranscription={handleTranscription} />
            )}
          </div>
        </div>

        {/* Bottom Section: Connection & Debug */}
        <div className="mt-6 space-y-6">
          <ConnectionPanel connectionState={connectionState} />
          <DebugConsole logs={logs} onClear={() => setLogs([])} />
        </div>
      </div>
    </div>
  );
}

export default App;
