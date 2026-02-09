/**
 * KST (Korea Standard Time, UTC+9) 타임존 유틸리티
 * Vercel 서버는 UTC로 동작하므로 명시적 KST 변환 필요
 */

const KST_OFFSET_MS = 9 * 60 * 60 * 1000; // UTC+9

/**
 * 현재 시각을 KST 기준 Date로 반환
 * - UTC 시간에 +9시간을 더한 뒤 getUTC* 메서드로 KST 값 추출
 */
export function getKSTDate(): Date {
  const now = new Date();
  return new Date(now.getTime() + KST_OFFSET_MS);
}

/**
 * YYYYMMDD 형식 (KST 기준)
 */
export function formatKSTDate(date?: Date): string {
  const d = date ?? getKSTDate();
  const year = d.getUTCFullYear();
  const month = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  return `${year}${month}${day}`;
}

/**
 * HHmm 형식 (KST 기준)
 */
export function formatKSTTime(date?: Date): string {
  const d = date ?? getKSTDate();
  const hour = String(d.getUTCHours()).padStart(2, '0');
  const minute = String(d.getUTCMinutes()).padStart(2, '0');
  return `${hour}${minute}`;
}

/**
 * KST 시(0-23)
 */
export function getKSTHour(date?: Date): number {
  const d = date ?? getKSTDate();
  return d.getUTCHours();
}

/**
 * KST 분(0-59)
 */
export function getKSTMinutes(date?: Date): number {
  const d = date ?? getKSTDate();
  return d.getUTCMinutes();
}

/**
 * KST 기준 어제 Date
 */
export function getKSTYesterday(): Date {
  const kst = getKSTDate();
  kst.setUTCDate(kst.getUTCDate() - 1);
  return kst;
}
