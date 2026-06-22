import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase-client';
import { type User, type Tenant, type AuthSession } from '@/types';

export const useAuth = () => {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const getSession = async () => {
      try {
        const { data } = await supabase.auth.getSession();

        if (data.session?.user) {
          // Fetch user + tenant from DB
          const { data: userData } = await supabase
            .from('users')
            .select('*, tenants(*)')
            .eq('id', data.session.user.id)
            .single();

          if (userData) {
            setSession({
              user: userData as User,
              tenant: userData.tenants as Tenant,
              accessToken: data.session.access_token,
              expiresAt: data.session.expires_at || 0,
            });
          }
        }
      } catch (error) {
        console.error('Error getting session:', error);
      } finally {
        setLoading(false);
      }
    };

    getSession();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT') {
        setSession(null);
        router.push('/login');
      } else if (event === 'SIGNED_IN' && session?.user) {
        const { data: userData } = await supabase
          .from('users')
          .select('*, tenants(*)')
          .eq('id', session.user.id)
          .single();

        if (userData) {
          setSession({
            user: userData as User,
            tenant: userData.tenants as Tenant,
            accessToken: session.access_token,
            expiresAt: session.expires_at || 0,
          });
        }
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, [supabase, router]);

  const logout = async () => {
    await supabase.auth.signOut();
    setSession(null);
    router.push('/login');
  };

  return { session, loading, logout };
};
