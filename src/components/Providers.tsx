'use client';

import { ReactNode } from 'react';
import ErrorBoundary from './ErrorBoundary';
import LazyMotionProvider from './LazyMotionProvider';
import { TimeProvider } from '@/lib/TimeProvider';

interface ProvidersProps {
  children: ReactNode;
}

export default function Providers({ children }: ProvidersProps) {
  return (
    <ErrorBoundary>
      <LazyMotionProvider>
        <TimeProvider>{children}</TimeProvider>
      </LazyMotionProvider>
    </ErrorBoundary>
  );
}
