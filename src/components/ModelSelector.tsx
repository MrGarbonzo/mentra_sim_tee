import { GLASSES_MODELS } from '../lib/hardware-specs';

interface ModelSelectorProps {
  selectedModel: string;
  onModelChange: (modelId: string) => void;
  disabled: boolean;
}

export default function ModelSelector({
  selectedModel,
  onModelChange,
  disabled,
}: ModelSelectorProps) {
  const currentModel = GLASSES_MODELS[selectedModel];

  return (
    <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
      <h2 className="text-2xl font-semibold mb-4">Glasses Model</h2>

      <div className="space-y-4">
        <div>
          <label htmlFor="model-select" className="block text-sm text-gray-400 mb-2">
            Hardware model:
          </label>
          <select
            id="model-select"
            value={selectedModel}
            onChange={(e) => onModelChange(e.target.value)}
            disabled={disabled}
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white disabled:opacity-50 disabled:cursor-not-allowed focus:border-blue-500 focus:outline-none"
          >
            {Object.values(GLASSES_MODELS).map((model) => (
              <option key={model.id} value={model.id}>
                {model.name} ({model.price})
              </option>
            ))}
          </select>
          {disabled && (
            <p className="text-xs text-gray-500 mt-1">
              Disconnect app to change models
            </p>
          )}
        </div>

        {/* Hardware Capabilities */}
        <div className="border-t border-gray-700 pt-4">
          <h3 className="text-sm font-semibold text-gray-400 mb-2">Capabilities</h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex items-center gap-2">
              <span className={currentModel.capabilities.camera ? 'text-green-400' : 'text-gray-500'}>
                {currentModel.capabilities.camera ? '✓' : '✗'}
              </span>
              <span>Camera</span>
            </div>
            <div className="flex items-center gap-2">
              <span className={currentModel.capabilities.display ? 'text-green-400' : 'text-gray-500'}>
                {currentModel.capabilities.display ? '✓' : '✗'}
              </span>
              <span>Display</span>
            </div>
            <div className="flex items-center gap-2">
              <span className={currentModel.capabilities.imageDisplay ? 'text-green-400' : 'text-gray-500'}>
                {currentModel.capabilities.imageDisplay ? '✓' : '✗'}
              </span>
              <span>Image Display</span>
            </div>
            <div className="flex items-center gap-2">
              <span className={currentModel.capabilities.microphone ? 'text-green-400' : 'text-gray-500'}>
                {currentModel.capabilities.microphone ? '✓' : '✗'}
              </span>
              <span>Microphone</span>
            </div>
            <div className="flex items-center gap-2">
              <span className={currentModel.capabilities.speaker ? 'text-green-400' : 'text-gray-500'}>
                {currentModel.capabilities.speaker ? '✓' : '✗'}
              </span>
              <span>Speaker</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
