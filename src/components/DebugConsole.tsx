import { useEffect, useRef, useState } from 'react';
import type { LogEntry } from '../types';

interface DebugConsoleProps {
  logs: LogEntry[];
  onClear: () => void;
}

export default function DebugConsole({ logs, onClear }: DebugConsoleProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [filterLevel, setFilterLevel] = useState<LogEntry['level'] | 'all'>('all');
  const logsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isExpanded) {
      logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, isExpanded]);

  const filteredLogs = logs.filter(
    (log) => filterLevel === 'all' || log.level === filterLevel
  );

  const getLevelColor = (level: LogEntry['level']) => {
    switch (level) {
      case 'info':
        return 'text-blue-400';
      case 'error':
        return 'text-red-400';
      case 'warn':
        return 'text-yellow-400';
      case 'debug':
        return 'text-gray-400';
      default:
        return 'text-white';
    }
  };

  const getLevelBadge = (level: LogEntry['level']) => {
    const colors = {
      info: 'bg-blue-900/50 text-blue-300',
      error: 'bg-red-900/50 text-red-300',
      warn: 'bg-yellow-900/50 text-yellow-300',
      debug: 'bg-gray-700 text-gray-300',
    };

    return (
      <span className={`px-2 py-1 rounded text-xs font-mono ${colors[level]}`}>
        {level.toUpperCase()}
      </span>
    );
  };

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      fractionalSecondDigits: 3,
    });
  };

  return (
    <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gray-700 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-semibold">Debug Console</h2>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-sm text-gray-400 hover:text-white transition-colors"
          >
            {isExpanded ? 'Collapse' : 'Expand'}
          </button>
        </div>

        <div className="flex items-center gap-3">
          {/* Filter */}
          <select
            value={filterLevel}
            onChange={(e) => setFilterLevel(e.target.value as any)}
            className="bg-gray-600 border border-gray-500 rounded px-3 py-1 text-sm text-white focus:border-blue-500 focus:outline-none"
          >
            <option value="all">All Levels</option>
            <option value="info">Info</option>
            <option value="warn">Warnings</option>
            <option value="error">Errors</option>
            <option value="debug">Debug</option>
          </select>

          {/* Clear button */}
          <button
            onClick={onClear}
            className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm transition-colors"
          >
            Clear
          </button>

          {/* Log count badge */}
          <div className="bg-gray-600 px-3 py-1 rounded text-sm">
            {filteredLogs.length} logs
          </div>
        </div>
      </div>

      {/* Logs */}
      {isExpanded && (
        <div className="bg-gray-900 p-4 font-mono text-sm max-h-96 overflow-y-auto">
          {filteredLogs.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              No logs to display
            </div>
          ) : (
            <div className="space-y-2">
              {filteredLogs.map((log, index) => (
                <div
                  key={index}
                  className={`border-l-2 pl-3 py-1 ${
                    log.level === 'error'
                      ? 'border-red-500'
                      : log.level === 'warn'
                      ? 'border-yellow-500'
                      : log.level === 'info'
                      ? 'border-blue-500'
                      : 'border-gray-600'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <span className="text-gray-500 text-xs">
                      {formatTimestamp(log.timestamp)}
                    </span>
                    {getLevelBadge(log.level)}
                    <span className={getLevelColor(log.level)}>
                      {log.message}
                    </span>
                  </div>
                  {log.context && (
                    <div className="mt-1 ml-24 text-xs text-gray-400 bg-gray-800 rounded p-2 overflow-x-auto">
                      <pre>{JSON.stringify(log.context, null, 2)}</pre>
                    </div>
                  )}
                </div>
              ))}
              <div ref={logsEndRef} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
