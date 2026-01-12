import { Component, type ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex min-h-[400px] flex-col items-center justify-center p-8 text-center">
          <AlertTriangle className="h-12 w-12 text-destructive" />
          <h2 className="mt-4 text-xl font-semibold">Ralat Berlaku</h2>
          <p className="mt-2 text-muted-foreground">
            Maaf, sesuatu yang tidak dijangka telah berlaku.
          </p>
          <div className="mt-6 flex gap-3">
            <Button onClick={this.handleReload} variant="outline">
              Cuba Lagi
            </Button>
            <Button onClick={this.handleGoHome}>
              Kembali ke Utama
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
