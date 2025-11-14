import { useState, useRef, useEffect } from 'react';

interface TranscriptionInputProps {
  onTranscription: (text: string, isFinal: boolean, language?: string) => void;
}

// Declare webkit speech recognition for TypeScript
declare global {
  interface Window {
    webkitSpeechRecognition: any;
    SpeechRecognition: any;
  }
}

export default function TranscriptionInput({ onTranscription }: TranscriptionInputProps) {
  const [text, setText] = useState('');
  const [language, setLanguage] = useState('en-US');
  const [isListening, setIsListening] = useState(false);
  const [liveTranscript, setLiveTranscript] = useState('');
  const [error, setError] = useState('');
  const recognitionRef = useRef<any>(null);

  // Check if speech recognition is supported
  const speechRecognitionSupported = typeof window !== 'undefined' &&
    (window.SpeechRecognition || window.webkitSpeechRecognition);

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const handleSend = () => {
    if (text.trim()) {
      onTranscription(text.trim(), true, language);
      setText('');
    }
  };

  const startListening = () => {
    if (!speechRecognitionSupported) {
      setError('Speech recognition not supported in this browser. Use Chrome or Edge.');
      return;
    }

    setError('');
    setLiveTranscript('');

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = language;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: any) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;

        if (event.results[i].isFinal) {
          finalTranscript += transcript + ' ';
          // Send final transcription
          onTranscription(transcript.trim(), true, language);
        } else {
          interimTranscript += transcript;
          // Send interim transcription
          onTranscription(transcript.trim(), false, language);
        }
      }

      // Update live display
      if (interimTranscript) {
        setLiveTranscript(interimTranscript);
      } else if (finalTranscript) {
        setLiveTranscript(prev => prev + finalTranscript);
      }
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      if (event.error === 'not-allowed') {
        setError('Microphone access denied. Please allow microphone permission in your browser settings.');
      } else if (event.error === 'no-speech') {
        setError('No speech detected. Try speaking louder or check your microphone.');
      } else {
        setError(`Error: ${event.error}`);
      }
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsListening(false);
  };

  return (
    <div className="bg-gray-800 rounded-lg p-4 shadow-lg">
      <h2 className="text-xl font-semibold mb-3">Transcription</h2>

      <div className="space-y-3">
        {/* Language selector */}
        <div>
          <label htmlFor="language-select" className="block text-xs text-gray-400 mb-1">
            Language:
          </label>
          <select
            id="language-select"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            disabled={isListening}
            className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-1.5 text-sm text-white disabled:opacity-50 disabled:cursor-not-allowed focus:border-blue-500 focus:outline-none"
          >
            <option value="en-US">English (US)</option>
            <option value="en-GB">English (UK)</option>
            <option value="es-ES">Spanish</option>
            <option value="fr-FR">French</option>
            <option value="de-DE">German</option>
            <option value="it-IT">Italian</option>
            <option value="pt-BR">Portuguese (Brazil)</option>
            <option value="ja-JP">Japanese</option>
            <option value="ko-KR">Korean</option>
            <option value="zh-CN">Chinese (Simplified)</option>
          </select>
        </div>

        {/* Microphone Section */}
        {speechRecognitionSupported && (
          <div className="flex items-center gap-2">
            <label className="text-xs text-gray-400">Voice:</label>
            {!isListening ? (
              <button
                onClick={startListening}
                className="bg-red-600 hover:bg-red-700 text-white px-2 py-0.5 rounded transition-colors text-xs flex items-center gap-1"
              >
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
                </svg>
                Start
              </button>
            ) : (
              <button
                onClick={stopListening}
                className="bg-gray-600 hover:bg-gray-700 text-white px-2 py-0.5 rounded transition-colors text-xs"
              >
                Stop
              </button>
            )}
          </div>
        )}

        {/* Live transcription display */}
        {isListening && (
          <div className="bg-red-900/30 border border-red-700 rounded p-2">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-red-400 text-xs font-semibold">Listening...</span>
            </div>
            {liveTranscript && (
              <p className="text-xs text-gray-300 mt-1 italic">
                "{liveTranscript}"
              </p>
            )}
          </div>
        )}

        {/* Error display */}
        {error && (
          <div className="bg-red-900/30 border border-red-700 rounded p-2">
            <p className="text-xs text-red-300">{error}</p>
          </div>
        )}

        {/* Manual text input */}
        <div className="border-t border-gray-700 pt-2">
          <label htmlFor="transcription-text" className="block text-xs text-gray-400 mb-1">
            Or type manually:
          </label>
          <textarea
            id="transcription-text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type text..."
            rows={2}
            disabled={isListening}
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 disabled:opacity-50 disabled:cursor-not-allowed focus:border-blue-500 focus:outline-none resize-none"
          />
          <button
            onClick={handleSend}
            disabled={!text.trim() || isListening}
            className="w-full mt-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-3 py-2 rounded-lg transition-colors text-sm"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
