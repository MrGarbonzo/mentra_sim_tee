import type { DisplayContent, GlassesModel } from '../types';

interface GlassesDisplayProps {
  model: GlassesModel;
  displayContent: DisplayContent;
}

export default function GlassesDisplay({ model, displayContent }: GlassesDisplayProps) {
  const renderContent = () => {
    if (!displayContent.type) {
      return (
        <div className="flex items-center justify-center h-full text-gray-500">
          <p className="text-center">
            No content displayed
            <br />
            <span className="text-sm">Waiting for SDK messages...</span>
          </p>
        </div>
      );
    }

    switch (displayContent.type) {
      case 'textWall':
        return (
          <div className="flex items-center justify-center h-full p-6">
            <p className="text-xl text-center font-mono leading-relaxed">
              {displayContent.data.text}
            </p>
          </div>
        );

      case 'doubleTextWall':
        return (
          <div className="flex flex-col items-center justify-center h-full p-6 gap-8">
            <p className="text-xl text-center font-mono">
              {displayContent.data.topText}
            </p>
            <div className="w-full border-t border-gray-600"></div>
            <p className="text-xl text-center font-mono">
              {displayContent.data.bottomText}
            </p>
          </div>
        );

      case 'referenceCard':
        return (
          <div className="flex flex-col h-full p-6">
            <h3 className="text-2xl font-bold mb-4 border-b border-gray-600 pb-2">
              {displayContent.data.title}
            </h3>
            <div className="flex-1 overflow-y-auto">
              <p className="text-lg font-mono leading-relaxed whitespace-pre-wrap">
                {displayContent.data.text}
              </p>
            </div>
          </div>
        );

      case 'dashboardCard':
        return (
          <div className="flex items-center justify-between h-full p-6">
            <div className="flex-1 text-left">
              <p className="text-2xl font-mono font-bold">
                {displayContent.data.leftText}
              </p>
            </div>
            <div className="w-px bg-gray-600 h-16 mx-4"></div>
            <div className="flex-1 text-right">
              <p className="text-2xl font-mono font-bold">
                {displayContent.data.rightText}
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
      <div className="text-center mb-4">
        <h2 className="text-2xl font-semibold">Display</h2>
        <div className="text-sm text-gray-400 mt-1">
          {displayContent.view === 'dashboard' ? 'Dashboard View' : 'Main View'}
        </div>
      </div>

      {!model.capabilities.display ? (
        <div className="bg-gray-700 rounded-lg p-8 text-center">
          <p className="text-gray-500">
            This model does not have a display
          </p>
        </div>
      ) : (
        <>
          {/* Simulated glasses display */}
          <div className="relative">
            {/* Display frame */}
            <div className="bg-black rounded-lg border-4 border-gray-700 aspect-video min-h-[400px] relative overflow-hidden">
              {/* Screen content */}
              <div className="absolute inset-0 bg-gradient-to-b from-gray-900 to-black text-green-400">
                {renderContent()}
              </div>

              {/* Scanline effect for retro look */}
              <div className="absolute inset-0 pointer-events-none opacity-10">
                {[...Array(20)].map((_, i) => (
                  <div
                    key={i}
                    className="h-px bg-white"
                    style={{ marginTop: '5%' }}
                  ></div>
                ))}
              </div>
            </div>

            {/* Display info */}
            {displayContent.type && (
              <div className="mt-2 text-sm text-gray-400 text-center">
                Layout: {displayContent.type}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
