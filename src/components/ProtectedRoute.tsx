
import { useAuth } from "@/contexts/AuthContext";
import { useRole } from "@/hooks/useRole";
import { Navigate } from "react-router-dom";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'delivery';
}

const ProtectedRoute = ({ children, requiredRole }: ProtectedRouteProps) => {
  const { user } = useAuth();
  const { isDelivery, isManager, loading } = useRole();

  // Mostrar un indicador de carga mientras se verifica el rol
  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4">Cargando...</p>
      </div>
    </div>;
  }

  // Si no hay usuario, redirigir a la página de autenticación
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Verificar si el usuario tiene el rol requerido
  if (requiredRole === 'admin' && !isManager) {
    console.log("El usuario no tiene rol de admin, redirigiendo a la página principal");
    return <Navigate to="/" replace />;
  }

  if (requiredRole === 'delivery' && !isDelivery) {
    console.log("El usuario no tiene rol de delivery, redirigiendo a la página principal");
    return <Navigate to="/" replace />;
  }

  // Si el usuario tiene el rol requerido, mostrar los hijos
  return <>{children}</>;
};

export default ProtectedRoute;
