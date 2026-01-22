/**
 * 좌표 변환 유틸리티
 * - 위경도 → 기상청 격자좌표(nx, ny)
 * - 위경도 → TM좌표 (에어코리아용)
 */

// 기상청 격자좌표 변환 상수 (Lambert Conformal Conic Projection)
const KMA_GRID = {
  RE: 6371.00877, // 지구 반경 (km)
  GRID: 5.0, // 격자 간격 (km)
  SLAT1: 30.0, // 표준 위도 1
  SLAT2: 60.0, // 표준 위도 2
  OLON: 126.0, // 기준점 경도
  OLAT: 38.0, // 기준점 위도
  XO: 43, // 기준점 X좌표
  YO: 136, // 기준점 Y좌표
};

export interface GridCoordinate {
  nx: number;
  ny: number;
}

export interface TMCoordinate {
  tmX: number;
  tmY: number;
}

/**
 * 위경도 → 기상청 격자좌표 변환
 * 기상청 단기예보 API에서 사용
 */
export function toGridCoordinate(lat: number, lon: number): GridCoordinate {
  const { RE, GRID, SLAT1, SLAT2, OLON, OLAT, XO, YO } = KMA_GRID;

  const DEGRAD = Math.PI / 180.0;

  const re = RE / GRID;
  const slat1 = SLAT1 * DEGRAD;
  const slat2 = SLAT2 * DEGRAD;
  const olon = OLON * DEGRAD;
  const olat = OLAT * DEGRAD;

  let sn = Math.tan(Math.PI * 0.25 + slat2 * 0.5) / Math.tan(Math.PI * 0.25 + slat1 * 0.5);
  sn = Math.log(Math.cos(slat1) / Math.cos(slat2)) / Math.log(sn);

  let sf = Math.tan(Math.PI * 0.25 + slat1 * 0.5);
  sf = (Math.pow(sf, sn) * Math.cos(slat1)) / sn;

  let ro = Math.tan(Math.PI * 0.25 + olat * 0.5);
  ro = (re * sf) / Math.pow(ro, sn);

  let ra = Math.tan(Math.PI * 0.25 + lat * DEGRAD * 0.5);
  ra = (re * sf) / Math.pow(ra, sn);

  let theta = lon * DEGRAD - olon;
  if (theta > Math.PI) theta -= 2.0 * Math.PI;
  if (theta < -Math.PI) theta += 2.0 * Math.PI;
  theta *= sn;

  const nx = Math.floor(ra * Math.sin(theta) + XO + 0.5);
  const ny = Math.floor(ro - ra * Math.cos(theta) + YO + 0.5);

  return { nx, ny };
}

/**
 * 위경도 → TM좌표 변환 (중부원점)
 * 에어코리아 측정소 검색 API에서 사용
 */
export function toTMCoordinate(lat: number, lon: number): TMCoordinate {
  // GRS80 타원체 파라미터
  const a = 6378137.0; // 장반경
  const f = 1 / 298.257222101; // 편평률
  const b = a * (1 - f); // 단반경
  const e2 = (a * a - b * b) / (a * a); // 제1이심률의 제곱

  // 중부원점 TM 파라미터
  const lonOrigin = 127.0; // 원점 경도
  const latOrigin = 38.0; // 원점 위도
  const k0 = 1.0; // 축척계수
  const x0 = 200000.0; // 가산 X좌표
  const y0 = 500000.0; // 가산 Y좌표

  const DEGRAD = Math.PI / 180.0;

  const phi = lat * DEGRAD;
  const lambda = lon * DEGRAD;
  const phi0 = latOrigin * DEGRAD;
  const lambda0 = lonOrigin * DEGRAD;

  const N = a / Math.sqrt(1 - e2 * Math.sin(phi) * Math.sin(phi));
  const T = Math.tan(phi) * Math.tan(phi);
  const C = (e2 / (1 - e2)) * Math.cos(phi) * Math.cos(phi);
  const A = (lambda - lambda0) * Math.cos(phi);

  // 자오선 호장
  const M =
    a *
    ((1 - e2 / 4 - (3 * e2 * e2) / 64 - (5 * e2 * e2 * e2) / 256) * phi -
      ((3 * e2) / 8 + (3 * e2 * e2) / 32 + (45 * e2 * e2 * e2) / 1024) * Math.sin(2 * phi) +
      ((15 * e2 * e2) / 256 + (45 * e2 * e2 * e2) / 1024) * Math.sin(4 * phi) -
      ((35 * e2 * e2 * e2) / 3072) * Math.sin(6 * phi));

  const M0 =
    a *
    ((1 - e2 / 4 - (3 * e2 * e2) / 64 - (5 * e2 * e2 * e2) / 256) * phi0 -
      ((3 * e2) / 8 + (3 * e2 * e2) / 32 + (45 * e2 * e2 * e2) / 1024) * Math.sin(2 * phi0) +
      ((15 * e2 * e2) / 256 + (45 * e2 * e2 * e2) / 1024) * Math.sin(4 * phi0) -
      ((35 * e2 * e2 * e2) / 3072) * Math.sin(6 * phi0));

  const tmX =
    k0 *
      N *
      (A +
        ((1 - T + C) * Math.pow(A, 3)) / 6 +
        ((5 - 18 * T + T * T + 72 * C - 58 * (e2 / (1 - e2))) * Math.pow(A, 5)) / 120) +
    x0;

  const tmY =
    k0 *
      (M -
        M0 +
        N *
          Math.tan(phi) *
          ((A * A) / 2 +
            ((5 - T + 9 * C + 4 * C * C) * Math.pow(A, 4)) / 24 +
            ((61 - 58 * T + T * T + 600 * C - 330 * (e2 / (1 - e2))) * Math.pow(A, 6)) / 720)) +
    y0;

  return { tmX, tmY };
}
