'use client';

import { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-700 to-slate-900">
          <div className="text-center px-6 max-w-sm">
            <div className="text-5xl mb-4">⚠️</div>
            <p className="text-white font-semibold text-lg mb-2">
              앗, 문제가 발생했어요
            </p>
            <p className="text-white/70 text-sm mb-4">
              {this.state.error?.message || '알 수 없는 오류가 발생했습니다.'}
            </p>
            <div className="flex gap-2 justify-center">
              <button
                onClick={this.handleRetry}
                className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-full text-sm font-medium transition-colors"
              >
                다시 시도
              </button>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white/80 rounded-full text-sm font-medium transition-colors"
              >
                새로고침
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
