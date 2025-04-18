
import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Camera, RotateCcw, Check } from 'lucide-react';

interface PhotoCaptureProps {
  onPhotoCapture: (photoData: string) => void;
}

const PhotoCapture: React.FC<PhotoCaptureProps> = ({ onPhotoCapture }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [photoTaken, setPhotoTaken] = useState(false);
  const [photoData, setPhotoData] = useState<string | null>(null);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' }, 
        audio: false 
      });
      
      setStream(mediaStream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (error) {
      console.error('Error al acceder a la cámara:', error);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (video && canvas) {
      const context = canvas.getContext('2d');
      
      // Set canvas dimensions to match the video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      // Draw the current video frame on the canvas
      context?.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Convert the canvas to a data URL and save it
      const data = canvas.toDataURL('image/jpeg');
      setPhotoData(data);
      setPhotoTaken(true);
      
      // Stop the camera after taking the photo
      stopCamera();
    }
  };

  const retakePhoto = () => {
    setPhotoTaken(false);
    setPhotoData(null);
    startCamera();
  };

  const confirmPhoto = () => {
    if (photoData) {
      onPhotoCapture(photoData);
    }
  };

  React.useEffect(() => {
    startCamera();
    
    return () => {
      stopCamera();
    };
  }, []);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Tomar Foto de Entrega</CardTitle>
      </CardHeader>
      <CardContent className="flex justify-center">
        {!photoTaken ? (
          <div className="relative w-full aspect-[3/4] bg-black rounded-md overflow-hidden">
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div className="relative w-full aspect-[3/4] bg-black rounded-md overflow-hidden">
            <img 
              src={photoData || ''} 
              alt="Foto capturada" 
              className="w-full h-full object-cover" 
            />
          </div>
        )}
        <canvas ref={canvasRef} className="hidden" />
      </CardContent>
      <CardFooter className="flex gap-2 justify-center">
        {!photoTaken ? (
          <Button variant="default" size="lg" onClick={capturePhoto} disabled={!stream}>
            <Camera className="mr-2 h-4 w-4" />
            Tomar Foto
          </Button>
        ) : (
          <>
            <Button variant="outline" size="lg" onClick={retakePhoto}>
              <RotateCcw className="mr-2 h-4 w-4" />
              Repetir
            </Button>
            <Button variant="default" size="lg" onClick={confirmPhoto}>
              <Check className="mr-2 h-4 w-4" />
              Confirmar
            </Button>
          </>
        )}
      </CardFooter>
    </Card>
  );
};

export default PhotoCapture;
