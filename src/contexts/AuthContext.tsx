
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  error: string | null;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  loading: true,
  error: null,
  signOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    console.log('Inicializando contexto de autenticación');
    
    try {
      // Set up auth state listener
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        (_, session) => {
          console.log('Estado de autenticación cambiado:', session ? 'con sesión' : 'sin sesión');
          setSession(session);
          setUser(session?.user ?? null);
        }
      );

      // Check for existing session
      supabase.auth.getSession().then(({ data: { session }, error }) => {
        if (error) {
          console.error('Error al obtener la sesión:', error);
          setError(error.message);
          return;
        }
        
        console.log('Sesión existente:', session ? 'encontrada' : 'no encontrada');
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      });

      return () => subscription.unsubscribe();
    } catch (err: any) {
      console.error('Error en la inicialización de la autenticación:', err);
      setError(err.message);
      setLoading(false);
      
      toast({
        variant: "destructive",
        title: "Error de autenticación",
        description: "Hubo un problema al inicializar la autenticación",
      });
    }
  }, []);

  const signOut = async () => {
    try {
      setLoading(true);
      await supabase.auth.signOut();
      toast({
        title: "Sesión cerrada",
        description: "Has cerrado sesión correctamente.",
      });
    } catch (error: any) {
      console.error('Error al cerrar sesión:', error);
      toast({
        variant: "destructive",
        title: "Error al cerrar sesión",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ session, user, loading, error, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};
