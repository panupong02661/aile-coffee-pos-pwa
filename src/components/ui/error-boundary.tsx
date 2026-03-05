import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from './button';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorCount: number;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, errorCount: 0 };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    
    // Increment error count
    this.setState(prevState => ({
      errorCount: prevState.errorCount + 1
    }));

    // If too many errors, clear cache
    if (this.state.errorCount > 2) {
      console.log('Too many errors, clearing cache...');
      if ('caches' in window) {
        caches.keys().then(names => {
          names.forEach(name => caches.delete(name));
        });
      }
    }
  }

  handleReset = () => {
    // Clear error state and try to recover
    this.setState({ hasError: false, error: undefined });
    
    // Clear service worker cache
    if ('serviceWorker' in navigator && 'caches' in window) {
      caches.keys().then(names => {
        names.forEach(name => caches.delete(name));
      });
    }
    
    // Navigate to home
    window.location.href = '/';
  };

  handleReload = () => {
    // Reset error state first, then reload to prevent persistent blank screen
    this.setState({ hasError: false, error: undefined, errorCount: 0 }, () => {
      window.location.reload();
    });
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI with recovery options
      return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
          <div className="max-w-md w-full space-y-6 text-center">
            <div className="space-y-4">
              <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto">
                <AlertTriangle className="w-8 h-8 text-destructive" />
              </div>
              <h1 className="text-2xl font-bold">เกิดข้อผิดพลาด</h1>
              <p className="text-muted-foreground">
                ขอโทษครับ เกิดปัญหาบางอย่างขณะใช้งาน
              </p>
              {this.state.error && (
                <div className="bg-muted p-3 rounded-lg text-left">
                  <p className="text-xs font-mono text-destructive break-all">
                    {this.state.error.message}
                  </p>
                </div>
              )}
            </div>
            
            <div className="space-y-3">
              <Button 
                onClick={this.handleReset}
                className="w-full"
                size="lg"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                กลับหน้าหลักและล้างแคช
              </Button>
              
              <Button 
                onClick={this.handleReload}
                variant="outline"
                className="w-full"
              >
                โหลดหน้านี้ใหม่
              </Button>
            </div>

            <div className="text-xs text-muted-foreground space-y-1">
              <p>หากปัญหายังคงอยู่:</p>
              <ol className="list-decimal list-inside text-left space-y-1 ml-4">
                <li>ปิดแท็บนี้แล้วเปิดใหม่</li>
                <li>ลบ Cache และ Cookies ของเบราว์เซอร์</li>
                <li>ติดต่อผู้ดูแลระบบ</li>
              </ol>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
