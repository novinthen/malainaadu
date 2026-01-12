import { User } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AuthButtonProps {
  onSignIn: () => void;
  isLoading?: boolean;
}

export function AuthButton({ onSignIn, isLoading }: AuthButtonProps) {
  return (
    <Button onClick={onSignIn} disabled={isLoading} size="sm">
      <User className="mr-2 h-4 w-4" />
      {isLoading ? 'Memuatkan...' : 'Log Masuk'}
    </Button>
  );
}
