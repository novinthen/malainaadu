import { Link } from 'react-router-dom';
import { Search, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { UserMenu } from './UserMenu';
import { AuthButton } from './AuthButton';
import type { User } from '@supabase/supabase-js';

interface DesktopActionsProps {
  user: User | null;
  isLoading: boolean;
  onSignIn: () => void;
  onSignOut: () => void;
  isSigningIn: boolean;
}

export function DesktopActions({
  user,
  isLoading,
  onSignIn,
  onSignOut,
  isSigningIn,
}: DesktopActionsProps) {
  return (
    <div className="hidden items-center gap-2 md:flex">
      <Button variant="ghost" size="icon" asChild>
        <Link to="/cari">
          <Search className="h-5 w-5" />
          <span className="sr-only">Cari</span>
        </Link>
      </Button>
      <Button variant="ghost" size="icon" asChild>
        <Link to="/trending">
          <TrendingUp className="h-5 w-5" />
          <span className="sr-only">Trending</span>
        </Link>
      </Button>

      {isLoading ? (
        <div className="h-8 w-8 animate-pulse rounded-full bg-muted" />
      ) : user ? (
        <UserMenu user={user} onSignOut={onSignOut} />
      ) : (
        <AuthButton onSignIn={onSignIn} isLoading={isSigningIn} />
      )}
    </div>
  );
}
