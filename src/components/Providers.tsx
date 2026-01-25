'use client';

import { ReactNode } from 'react';
import ErrorBoundary from './ErrorBoundary';
import LazyMotionProvider from './LazyMotionProvider';

interface ProvidersProps {
  children: ReactNode;
}

export default function Providers({ children }: ProvidersProps) {
  return (
    <ErrorBoundary>
      <LazyMotionProvider>{children}</LazyMotionProvider>
    </ErrorBoundary>
  );
}
