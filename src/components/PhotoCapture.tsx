
import React, { useRef, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Camera, RotateCcw, Check } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

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
  const { toast } = useToast();

  const startCamera = async () => {
    try {
      setIsCameraLoading(true);
      setCameraError(null);
      
      // Request camera without checking connection status first
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
        
        videoRef.current.onloadedmetadata = () => {
          setIsCameraLoading(false);
        };
      }
    } catch (error: any) {
      console.error('Error al acceder a la cámara:', error);
      
      // More descriptive error message
      let errorMessage = 'No se pudo acceder a la cámara.';
      
      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        errorMessage = 'Permiso de cámara denegado. Por favor, permite el acceso a la cámara en la configuración de tu navegador.';
      } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
        errorMessage = 'No se encontró ninguna cámara en este dispositivo.';
      } else if (error.name === 'NotReadableError' || error.name === 'TrackStartError') {
        errorMessage = 'La cámara está en uso por otra aplicación o no está disponible.';
      } else if (error.name === 'OverconstrainedError') {
        errorMessage = 'La configuración de la cámara solicitada no está disponible.';
      } else if (error.name === 'TypeError') {
        errorMessage = 'No se especificaron parámetros de video válidos.';
      }
      
      setCameraError(errorMessage);
      setIsCameraLoading(false);
      toast({
        title: 'Error de cámara',
        description: errorMessage,
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
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      const data = canvas.toDataURL('image/jpeg', 0.8);
      setPhotoData(data);
      setPhotoTaken(true);
      
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

  const handleVisibilityChange = () => {
    if (document.visibilityState === 'visible' && !photoTaken) {
      stopCamera();
      startCamera();
    }
  };

  useEffect(() => {
    // Start camera with a small delay to ensure DOM is fully rendered
    const timer = setTimeout(() => {
      startCamera();
    }, 500);
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      stopCamera();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearTimeout(timer);
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
                  <p className="mb-4">{cameraError}</p>
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
