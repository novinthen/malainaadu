import { useState } from 'react';
import { useCategories } from '@/hooks/useCategories';
import { useAuth, useSignInWithGoogle, useSignOut } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { Logo } from './Logo';
import { DesktopNav } from './DesktopNav';
import { DesktopActions } from './DesktopActions';
import { MobileNav } from './MobileNav';

export function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const { data: categories } = useCategories();
  const { user, loading: authLoading } = useAuth();
  const signInWithGoogle = useSignInWithGoogle();
  const signOut = useSignOut();

  const mainCategories = categories?.slice(0, 6) || [];
  const allCategories = categories || [];

  const handleSignIn = () => {
    signInWithGoogle.mutate(undefined, {
      onError: (error) => {
        toast.error('Google மூலம் உள்நுழைய முடியவில்லை');
        console.error('Google sign-in error:', error);
      },
    });
  };

  const handleSignOut = () => {
    signOut.mutate(undefined, {
      onSuccess: () => toast.success('வெற்றிகரமாக வெளியேறினீர்கள்'),
      onError: (error) => {
        toast.error('வெளியேற முடியவில்லை');
        console.error('Sign out error:', error);
      },
    });
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <div className="container flex h-14 items-center justify-between md:h-16">
        <Logo />
        <DesktopNav categories={mainCategories} />
        <DesktopActions
          user={user}
          isLoading={authLoading}
          onSignIn={handleSignIn}
          onSignOut={handleSignOut}
          isSigningIn={signInWithGoogle.isPending}
        />
        <MobileNav
          isOpen={isOpen}
          onOpenChange={setIsOpen}
          categories={allCategories}
          user={user}
          onSignIn={handleSignIn}
          onSignOut={handleSignOut}
          isSigningIn={signInWithGoogle.isPending}
        />
      </div>
    </header>
  );
}
