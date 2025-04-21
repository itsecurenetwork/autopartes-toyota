
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useRole = () => {
  const { user } = useAuth();
  const [isDelivery, setIsDelivery] = useState(false);
  const [isManager, setIsManager] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkRoles = async () => {
      if (!user) {
        setIsDelivery(false);
        setIsManager(false);
        setLoading(false);
        return;
      }

      try {
        console.log("Checking roles for user:", user.id);
        const { data: roles, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id);

        if (error) {
          console.error('Error checking roles:', error);
          throw error;
        }

        console.log("Roles found:", roles);
        
        if (roles) {
          setIsDelivery(roles.some(r => r.role === 'delivery'));
          setIsManager(roles.some(r => r.role === 'admin'));
        }
      } catch (error) {
        console.error('Error checking roles:', error);
      } finally {
        setLoading(false);
      }
    };

    checkRoles();
  }, [user]);

  return { isDelivery, isManager, loading };
};
