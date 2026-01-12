import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Chrome } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth, useSignInWithGoogle, useIsAdmin } from '@/hooks/useAuth';
import { toast } from 'sonner';

export default function AdminLogin() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, isLoading: roleLoading } = useIsAdmin();
  const signInWithGoogle = useSignInWithGoogle();

  useEffect(() => {
    if (!authLoading && !roleLoading) {
      if (user && isAdmin) {
        navigate('/admin');
      }
    }
  }, [user, isAdmin, authLoading, roleLoading, navigate]);

  const handleGoogleSignIn = () => {
    signInWithGoogle.mutate(undefined, {
      onError: (error) => {
        toast.error('Gagal log masuk dengan Google');
        console.error('Google sign-in error:', error);
      },
    });
  };

  if (authLoading || roleLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
          <p className="mt-4 text-muted-foreground">Memuatkan...</p>
        </div>
      </div>
    );
  }

  if (user && !isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
              <span className="text-3xl">🚫</span>
            </div>
            <CardTitle>Akses Ditolak</CardTitle>
            <CardDescription>
              Akaun anda tidak mempunyai akses ke panel admin. Sila hubungi pentadbir sistem.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-center text-sm text-muted-foreground mb-4">
              Log masuk sebagai: {user.email}
            </p>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => navigate('/')}
            >
              Kembali ke Laman Utama
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-xl bg-primary">
            <span className="font-display text-3xl font-bold text-primary-foreground">B</span>
          </div>
          <CardTitle className="font-display text-2xl">Panel Admin</CardTitle>
          <CardDescription>
            Log masuk untuk mengurus kandungan Berita Malaysia
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            onClick={handleGoogleSignIn}
            disabled={signInWithGoogle.isPending}
            className="w-full"
            size="lg"
          >
            <Chrome className="mr-2 h-5 w-5" />
            {signInWithGoogle.isPending ? 'Memuatkan...' : 'Log Masuk dengan Google'}
          </Button>
          <p className="mt-4 text-center text-xs text-muted-foreground">
            Hanya pentadbir berdaftar sahaja yang boleh mengakses panel ini.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
