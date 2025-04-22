
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { supabase, checkConnection } from '@/integrations/supabase/client';
import { ArrowLeft, Loader2, RefreshCw, WifiOff } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

type ConnectionStatus = 'checking' | 'connected' | 'disconnected';

const Auth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('checking');
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const checkConn = async () => {
      try {
        const isConnected = await checkConnection();
        setConnectionStatus(isConnected ? 'connected' : 'disconnected');
        
        if (!isConnected) {
          setError('No se pudo conectar al servidor. Verifica tu conexión a internet.');
        }
      } catch (err) {
        console.error('Error al verificar conexión:', err);
        setConnectionStatus('disconnected');
        setError('Error al verificar la conexión. Inténtalo de nuevo.');
      }
    };
    
    checkConn();
  }, []);

  const handleRetryConnection = async () => {
    setConnectionStatus('checking');
    setError(null);
    
    try {
      const isConnected = await checkConnection();
      setConnectionStatus(isConnected ? 'connected' : 'disconnected');
      
      if (!isConnected) {
        setError('No se pudo conectar al servidor. Verifica tu conexión a internet.');
      }
    } catch (err) {
      console.error('Error al reintentar conexión:', err);
      setConnectionStatus('disconnected');
      setError('Error al verificar la conexión. Inténtalo de nuevo.');
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Verificar conexión antes de intentar autenticar
    if (connectionStatus !== 'connected') {
      await handleRetryConnection();
      if (connectionStatus !== 'connected') {
        return;
      }
    }
    
    setLoading(true);
    setError(null);

    try {
      console.log('Intentando autenticar con:', { email });
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      navigate('/');
      toast({
        title: "¡Bienvenido!",
        description: "Has iniciado sesión correctamente.",
      });
    } catch (error: any) {
      console.error('Error de autenticación:', error);
      
      // Mensaje de error específico para problemas de conexión
      const errorMessage = 
        error.message === 'Failed to fetch' || 
        error.message.includes('network') || 
        error.message.includes('NetworkError') ?
          'Error de conexión. Verifica tu conexión a internet o inténtalo más tarde.' :
          error.message;
          
      setError(errorMessage);
      
      toast({
        variant: "destructive",
        title: "Error de autenticación",
        description: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  // Mostrar pantalla de carga mientras verifica la conexión
  if (connectionStatus === 'checking') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4">Verificando conexión...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              className="mb-2"
              onClick={() => navigate('/')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
          </div>
          <CardTitle className="text-2xl text-center">Iniciar Sesión</CardTitle>
          <CardDescription className="text-center">
            Ingresa tus credenciales para acceder al sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          {connectionStatus === 'disconnected' ? (
            <>
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>
                  <div className="flex items-center">
                    <WifiOff className="h-4 w-4 mr-2" />
                    {error || 'Error de conexión. Verifica tu conexión a internet.'}
                  </div>
                </AlertDescription>
              </Alert>
              <Button 
                onClick={handleRetryConnection} 
                className="w-full"
                disabled={connectionStatus === 'checking'}
              >
                {connectionStatus === 'checking' ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Verificando conexión...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Reintentar conexión
                  </>
                )}
              </Button>
            </>
          ) : (
            <>
              {error && (
                <Alert variant="destructive" className="mb-4">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <form onSubmit={handleAuth} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="ejemplo@toyota.net"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Contraseña</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Iniciando sesión...
                    </>
                  ) : 'Iniciar Sesión'}
                </Button>
              </form>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
