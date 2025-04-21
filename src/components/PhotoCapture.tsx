
import React, { useRef, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Camera, RotateCcw, Check } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

interface PhotoCaptureProps {
  onPhotoCapture: (photoData: string) => void;
}

const PhotoCapture: React.FC<PhotoCaptureProps> = ({ onPhotoCapture }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [photoTaken, setPhotoTaken] = useState(false);
  const [photoData, setPhotoData] = useState<string | null>(null);
  const [isCameraLoading, setIsCameraLoading] = useState(true);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const startCamera = async () => {
    try {
      setIsCameraLoading(true);
      setCameraError(null);
      
      // Intentar primero con la cámara trasera
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }, 
        audio: false 
      });
      
      setStream(mediaStream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        
        // Esperamos a que el video se cargue para ocultar el loader
        videoRef.current.onloadedmetadata = () => {
          setIsCameraLoading(false);
        };
      }
    } catch (error) {
      console.error('Error al acceder a la cámara:', error);
      setCameraError('No se pudo acceder a la cámara. Por favor verifica los permisos.');
      setIsCameraLoading(false);
      toast({
        title: 'Error de cámara',
        description: 'No se pudo acceder a la cámara. Verifica los permisos.',
        variant: 'destructive',
      });
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
      if (!context) return;
      
      // Set canvas dimensions to match the video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      // Flip the canvas horizontally if using front camera (can be toggled with a button if needed)
      // context.scale(-1, 1);
      // context.translate(-canvas.width, 0);
      
      // Draw the current video frame on the canvas
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Convert the canvas to a data URL and save it
      const data = canvas.toDataURL('image/jpeg', 0.8);
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

  // Reiniciar la cámara si el usuario cambia de pestaña y vuelve
  const handleVisibilityChange = () => {
    if (document.visibilityState === 'visible' && !photoTaken) {
      stopCamera();
      startCamera();
    }
  };

  useEffect(() => {
    startCamera();
    
    // Añadir detección de cambio de visibilidad
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      stopCamera();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
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
            {isCameraLoading && !cameraError && (
              <div className="absolute inset-0 flex items-center justify-center text-white bg-black bg-opacity-70">
                <div className="text-center">
                  <div className="animate-spin h-8 w-8 border-4 border-white border-t-transparent rounded-full mx-auto mb-2"></div>
                  <p>Iniciando cámara...</p>
                </div>
              </div>
            )}
            
            {cameraError && (
              <div className="absolute inset-0 flex items-center justify-center text-white bg-black bg-opacity-70">
                <div className="text-center p-4">
                  <div className="text-destructive mb-2 text-3xl">⚠️</div>
                  <p>{cameraError}</p>
                  <Button 
                    variant="outline" 
                    onClick={startCamera} 
                    className="mt-4"
                  >
                    Reintentar
                  </Button>
                </div>
              </div>
            )}
            
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              muted
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
          <Button 
            variant="default" 
            size="lg" 
            onClick={capturePhoto} 
            disabled={!stream || isCameraLoading || !!cameraError}
          >
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
