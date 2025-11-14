import type { ConnectionState } from '../types';

interface ConnectionPanelProps {
  connectionState: ConnectionState;
}

export default function ConnectionPanel({ connectionState }: ConnectionPanelProps) {
  const { connected, pairingCode, appInfo } = connectionState;

  return (
    <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
      <h2 className="text-2xl font-semibold mb-4">Connection</h2>

      {!connected ? (
        <div className="space-y-4">
          <div>
            <p className="text-gray-400 mb-2">Enter this pairing code when starting your app:</p>
            <div className="bg-gray-700 rounded-lg p-6 text-center">
              <code className="text-4xl font-mono font-bold tracking-widest text-blue-400">
                {pairingCode || 'Loading...'}
              </code>
            </div>
            <p className="text-sm text-gray-500 mt-2 text-center">
              Run: <code className="bg-gray-700 px-2 py-1 rounded">npm start {pairingCode}</code>
            </p>
          </div>

          <div className="bg-blue-900/30 border border-blue-700 rounded-lg p-3">
            <p className="text-sm text-blue-300">
              Waiting for SDK connection...
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-green-900/30 border border-green-700 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-green-400 font-semibold">Connected</span>
          </div>
          {appInfo && (
            <div className="text-sm text-gray-300 space-y-1">
              <p>
                <span className="text-gray-500">App:</span> {appInfo.name}
              </p>
              <p>
                <span className="text-gray-500">Package:</span> {appInfo.packageName}
              </p>
              <p>
                <span className="text-gray-500">Version:</span> {appInfo.version}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
