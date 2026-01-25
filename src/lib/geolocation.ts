'use client';

import { useState, useEffect, useRef } from 'react';
import { getLastLocation, hasLocationChanged } from './location-cache';

export interface Coordinates {
  lat: number;
  lon: number;
}

export interface GeolocationState {
  coordinates: Coordinates | null;
  loading: boolean;
  error: string | null;
  /** 캐시된 위치에서 GPS 위치로 변경되었는지 여부 */
  locationChanged: boolean;
  /** 현재 좌표가 캐시에서 온 것인지 여부 */
  isFromCache: boolean;
}

export function useGeolocation(): GeolocationState {
  const cachedLocationRef = useRef<ReturnType<typeof getLastLocation>>(null);

  // 서버/클라이언트 동일한 초기 상태 (hydration 에러 방지)
  const [state, setState] = useState<GeolocationState>({
    coordinates: null,
    loading: true,
    error: null,
    locationChanged: false,
    isFromCache: false,
  });

  useEffect(() => {
    // 클라이언트에서만 캐시 확인
    const cached = getLastLocation();
    cachedLocationRef.current = cached;

    // 캐시된 위치가 있으면 즉시 적용
    if (cached) {
      setState({
        coordinates: { lat: cached.lat, lon: cached.lon },
        loading: false,
        error: null,
        locationChanged: false,
        isFromCache: true,
      });
    }

    if (!navigator.geolocation) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: prev.coordinates ? null : '브라우저가 위치 서비스를 지원하지 않습니다.',
      }));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const newLat = position.coords.latitude;
        const newLon = position.coords.longitude;

        // 캐시된 위치와 비교하여 변경 여부 확인
        const cachedLoc = cachedLocationRef.current;
        const changed = cachedLoc
          ? hasLocationChanged(cachedLoc.lat, cachedLoc.lon, newLat, newLon)
          : false;

        setState({
          coordinates: { lat: newLat, lon: newLon },
          loading: false,
          error: null,
          locationChanged: changed,
          isFromCache: false,
        });
      },
      (error) => {
        let errorMessage = '위치를 가져올 수 없습니다.';

        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = '위치 권한이 거부되었습니다.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = '위치 정보를 사용할 수 없습니다.';
            break;
          case error.TIMEOUT:
            errorMessage = '위치 요청 시간이 초과되었습니다.';
            break;
        }

        // 캐시된 위치가 있으면 에러 무시하고 캐시 사용
        setState((prev) => ({
          ...prev,
          loading: false,
          error: prev.coordinates ? null : errorMessage,
          isFromCache: !!prev.coordinates,
        }));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000, // 5분 캐시
      }
    );
  }, []);

  return state;
}
