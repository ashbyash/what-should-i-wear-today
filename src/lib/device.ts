export type DeviceType = 'ios' | 'android' | 'desktop';

export interface DeviceInfo {
  type: DeviceType;
  isMobile: boolean;
}

/**
 * 사용자 에이전트 기반 디바이스 정보 감지
 */
export function getDeviceInfo(): DeviceInfo {
  if (typeof navigator === 'undefined') {
    return { type: 'desktop', isMobile: false };
  }

  const ua = navigator.userAgent;
  const isIOS = /iPad|iPhone|iPod/.test(ua);
  const isAndroid = /Android/.test(ua);

  if (isIOS) {
    return { type: 'ios', isMobile: true };
  }
  if (isAndroid) {
    return { type: 'android', isMobile: true };
  }
  return { type: 'desktop', isMobile: false };
}
