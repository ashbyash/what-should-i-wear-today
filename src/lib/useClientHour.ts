'use client';

import { useState, useEffect } from 'react';

// 클라이언트 시간 훅 (시간 + 분을 소수점으로 반환)
export function useClientHour() {
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

  return clientHour;
}
