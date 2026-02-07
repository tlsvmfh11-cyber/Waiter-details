/**
 * 아가씨 시간 계산 유틸리티
 *
 * [기본 원칙] 60분 = 1개
 *
 * [첫 1시간 미만 (0~59분) 계산 규칙]
 * - 0분 ~ 10분    →  1개
 * - 11분 ~ 30분   →  0.5개
 * - 31분 ~ 59분   →  1개
 *
 * [1시간 이상 (60분~) 계산 규칙 — 모든 추가 시간 동일]
 * - 매 60분 = 1개 (기본)
 * - 추가 0~5분 → +0
 * - 추가 6~10분 → +0.2
 * - 추가 11~30분 → +0.5
 * - 추가 31~60분 → +1
 */

/**
 * "HH:mm" 형식 문자열을 분(minute) 단위로 변환
 */
export function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

/**
 * 시작/끝 시간(HH:mm)으로 총 경과 분 계산
 * 자정 넘김 자동 처리 (끝 시간이 시작보다 작으면 다음날)
 */
export function calculateElapsedMinutes(
  startTime: string,
  endTime: string
): number {
  let startMin = timeToMinutes(startTime);
  let endMin = timeToMinutes(endTime);

  // 자정 넘김 처리
  if (endMin <= startMin) {
    endMin += 24 * 60;
  }

  return endMin - startMin;
}

/**
 * 경과 시간(분)으로 "끝난 개수" 계산
 *
 * 검증된 예시:
 * - 60분 (1h 0m)  = 1개
 * - 65분 (1h 5m)  = 1개
 * - 66분 (1h 6m)  = 1.2개
 * - 70분 (1h 10m) = 1.2개
 * - 71분 (1h 11m) = 1.5개
 * - 91분 (1h 31m) = 2개
 * - 126분 (2h 6m) = 2.2개
 * - 130분 (2h 10m)= 2.2개
 * - 131분 (2h 11m)= 2.5개
 * - 151분 (2h 31m)= 3개
 * - 186분 (3h 6m) = 3.2개
 * - 211분 (3h 31m)= 4개
 */
export function calculateCount(totalMinutes: number): number {
  if (totalMinutes <= 0) return 0;

  // 첫 1시간 미만 (0~59분) - 단기 방문 규칙
  if (totalMinutes < 60) {
    if (totalMinutes <= 10) return 1;
    if (totalMinutes <= 30) return 0.5;
    return 1; // 31~59분
  }

  const fullHours = Math.floor(totalMinutes / 60);
  const extraMinutes = totalMinutes % 60;

  // 모든 추가 시간 동일 규칙 적용 (첫 60분 이후부터)
  const base = fullHours;
  if (extraMinutes <= 5) return base;        // +0
  if (extraMinutes <= 10) return base + 0.2; // +0.2
  if (extraMinutes <= 30) return base + 0.5; // +0.5
  return base + 1;                           // +1
}

/**
 * 시작/끝 시간으로 개수 계산 (통합)
 */
export function calculateHostessCount(
  startTime: string,
  endTime: string
): { totalMinutes: number; count: number } {
  if (!startTime || !endTime) return { totalMinutes: 0, count: 0 };

  const totalMinutes = calculateElapsedMinutes(startTime, endTime);
  const count = calculateCount(totalMinutes);

  return { totalMinutes, count };
}

/**
 * 분을 "X시간 Y분" 형식으로 변환
 */
export function formatDuration(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours === 0) return `${minutes}분`;
  if (minutes === 0) return `${hours}시간`;
  return `${hours}시간 ${minutes}분`;
}

/**
 * 개수를 깔끔하게 표시 (소수점 불필요한 0 제거)
 */
export function formatCount(count: number): string {
  // 0.2, 0.5, 1, 1.5, 2.2 등 깔끔하게
  return count % 1 === 0 ? count.toFixed(1) : count.toString();
}

/**
 * 반티 시간 계산 (시작 + 11분)
 */
export function calcHalfTime(startTime: string): string {
  const totalMin = timeToMinutes(startTime) + 11;
  const h = Math.floor(totalMin / 60) % 24;
  const m = totalMin % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}

/**
 * 완티 시간 계산 (시작 + 31분)
 */
export function calcFullTime(startTime: string): string {
  const totalMin = timeToMinutes(startTime) + 31;
  const h = Math.floor(totalMin / 60) % 24;
  const m = totalMin % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}
