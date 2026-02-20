'use client';

import { useContext } from 'react';
import { TimeContext } from './TimeProvider';

// 클라이언트 시간 훅 (시간 + 분을 소수점으로 반환)
export function useClientHour() {
  return useContext(TimeContext);
}
