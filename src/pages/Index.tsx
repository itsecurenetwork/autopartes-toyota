
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Link, useNavigate } from 'react-router-dom';
import { PackageOpen, LayoutDashboard, LogIn } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const Index = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary">Autopartes Toyota</h1>
          <p className="text-lg text-muted-foreground mt-2">
            Gestión de entregas y pedidos de autopartes
          </p>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-center">Selecciona tu perfil</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {user ? (
                <>
                  <Link to="/manager" className="block">
                    <Button variant="outline" className="w-full h-20 justify-start">
                      <div className="flex items-center">
                        <div className="bg-primary/10 p-3 rounded-full mr-4">
                          <LayoutDashboard className="h-6 w-6 text-primary" />
                        </div>
                        <div className="text-left">
                          <h3 className="font-medium">Administrador</h3>
                          <p className="text-sm text-muted-foreground">
                            Gestiona pedidos y entregas de autopartes
                          </p>
                        </div>
                      </div>
                    </Button>
                  </Link>

                  <Link to="/delivery" className="block">
                    <Button variant="outline" className="w-full h-20 justify-start">
                      <div className="flex items-center">
                        <div className="bg-primary/10 p-3 rounded-full mr-4">
                          <PackageOpen className="h-6 w-6 text-primary" />
                        </div>
                        <div className="text-left">
                          <h3 className="font-medium">Repartidor</h3>
                          <p className="text-sm text-muted-foreground">
                            Entrega de autopartes
                          </p>
                        </div>
                      </div>
                    </Button>
                  </Link>

                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => signOut()}
                  >
                    Cerrar Sesión
                  </Button>
                </>
              ) : (
                <Button 
                  variant="outline" 
                  className="w-full h-20 justify-start"
                  onClick={() => navigate('/auth')}
                >
                  <div className="flex items-center">
                    <div className="bg-primary/10 p-3 rounded-full mr-4">
                      <LogIn className="h-6 w-6 text-primary" />
                    </div>
                    <div className="text-left">
                      <h3 className="font-medium">Iniciar Sesión</h3>
                      <p className="text-sm text-muted-foreground">
                        Accede a tu cuenta para comenzar
                      </p>
                    </div>
                  </div>
                </Button>
              )}
            </CardContent>
            <CardFooter className="flex justify-center text-sm text-muted-foreground">
              Versión 1.0.0
            </CardFooter>
          </Card>
          
          <div className="text-center text-sm text-muted-foreground">
            <p>© 2025 Autopartes Toyota. Todos los derechos reservados.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
