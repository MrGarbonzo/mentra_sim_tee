import { useRef, useState, useEffect } from 'react';

interface CameraCaptureProps {
  onPhotoCapture: (base64Data: string, mimeType: string) => void;
  isPending: boolean;
}

export default function CameraCapture({ onPhotoCapture, isPending }: CameraCaptureProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [useWebcam, setUseWebcam] = useState(false);
  const [webcamStream, setWebcamStream] = useState<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target?.result as string;
        setSelectedImage(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  // Set up video stream when webcam stream is available
  useEffect(() => {
    if (webcamStream && videoRef.current && useWebcam) {
      videoRef.current.srcObject = webcamStream;

      // Explicitly play the video
      videoRef.current.play()
        .catch(err => console.error('Failed to play video:', err));
    }
  }, [webcamStream, useWebcam]);

  const handleStartWebcam = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720 },
      });

      setWebcamStream(stream);
      setUseWebcam(true);
    } catch (error) {
      console.error('Failed to access webcam:', error);
      alert('Failed to access webcam. Please check permissions.');
    }
  };

  const handleStopWebcam = () => {
    if (webcamStream) {
      webcamStream.getTracks().forEach((track) => track.stop());
      setWebcamStream(null);
    }
    setUseWebcam(false);
  };

  const handleCaptureFromWebcam = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;

      // Check if video has valid dimensions
      if (video.videoWidth === 0 || video.videoHeight === 0) {
        alert('Webcam not ready yet! Please wait a moment and try again.');
        console.error('Video dimensions are 0 - webcam not ready');
        return;
      }

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0);
        const base64 = canvas.toDataURL('image/jpeg');
        setSelectedImage(base64);
        handleStopWebcam();
      }
    }
  };

  const handleSendPhoto = () => {
    if (selectedImage) {
      // Extract base64 data without the data:image/jpeg;base64, prefix
      const base64Data = selectedImage.split(',')[1] || '';
      const mimeType = selectedImage.split(';')[0].split(':')[1] || '';

      onPhotoCapture(base64Data, mimeType);
      setSelectedImage(null);
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
      <h2 className="text-2xl font-semibold mb-4">Camera</h2>

      {isPending && (
        <div className="bg-yellow-900/30 border border-yellow-700 rounded-lg p-4 mb-4">
          <p className="text-yellow-300 font-semibold mb-2">
            Camera photo requested by SDK
          </p>
          <p className="text-sm text-yellow-200">
            Upload an image or use your webcam to respond
          </p>
        </div>
      )}

      <div className="space-y-4">
        {/* Upload or Webcam buttons */}
        {!useWebcam && (
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Upload Image
            </button>
            <button
              onClick={handleStartWebcam}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Use Webcam
            </button>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          className="hidden"
        />

        {/* Webcam view */}
        {useWebcam && (
          <div className="space-y-3">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full rounded-lg bg-black"
            />
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleCaptureFromWebcam}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Capture Photo
              </button>
              <button
                onClick={handleStopWebcam}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Preview selected image */}
        {selectedImage && !useWebcam && (
          <div className="space-y-3">
            <div className="border border-gray-700 rounded-lg overflow-hidden">
              <img
                src={selectedImage}
                alt="Selected"
                className="w-full"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleSendPhoto}
                disabled={!isPending}
                className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg transition-colors"
              >
                Send to SDK
              </button>
              <button
                onClick={() => setSelectedImage(null)}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Clear
              </button>
            </div>
          </div>
        )}

        {/* Hidden canvas for webcam capture */}
        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  );
}
