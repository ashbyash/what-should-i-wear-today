'use client';

import { createContext, useState, useEffect, ReactNode } from 'react';

export const TimeContext = createContext<number>(12);

export function TimeProvider({ children }: { children: ReactNode }) {
  const [clientHour, setClientHour] = useState<number>(12);

  useEffect(() => {
    const updateHour = () => {
      const now = new Date();
      setClientHour(now.getHours() + now.getMinutes() / 60);
    };
    updateHour();
    const interval = setInterval(updateHour, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <TimeContext.Provider value={clientHour}>
      {children}
    </TimeContext.Provider>
  );
}
