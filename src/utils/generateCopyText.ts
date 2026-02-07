import { StatementData } from '../types';
import { formatCurrency } from './formatCurrency';
import { formatCount } from './timeCalculation';

/**
 * 카톡 복사용 텍스트 생성 (내역서 전체)
 */
export function generateStatementText(data: StatementData): string {
  const lines: string[] = [];

  // 기본 정보
  lines.push(`[방번호] ${data.roomNumber}번${data.partySize ? ` (${data.partySize}명)` : ''} - ${data.sessionPart}`);
  lines.push(`담당: ${data.managerName} / WT: ${data.waiterName}`);
  lines.push('');

  // 주대
  const activeLiquors = data.liquors.filter(l => l.bottles > 0 && l.name.trim());
  if (activeLiquors.length > 0) {
    lines.push('주대:');
    activeLiquors.forEach(l => {
      const lineTotal = l.bottles * l.pricePerBottle;
      lines.push(`- ${l.name} x${l.bottles} (${formatCurrency(l.pricePerBottle)}) = ${formatCurrency(lineTotal)}`);
    });
    const liquorTotal = activeLiquors.reduce((sum, l) => sum + l.bottles * l.pricePerBottle, 0);
    lines.push(`주대 합계: ${formatCurrency(liquorTotal)}`);
    lines.push('');
  }

  // 아가씨 / T/C
  const activeHostesses = data.hostesses.filter(h => h.count > 0 || h.amount > 0);
  const tcTotal = data.hostesses.reduce((sum, h) => sum + h.amount, 0);
  if (activeHostesses.length > 0) {
    lines.push('아가씨:');
    activeHostesses.forEach(h => {
      const amountStr = h.amount > 0 ? ` ${formatCurrency(h.amount)}` : '';
      lines.push(`- ${h.name}  (${h.startTime}~${h.endTime}) ${formatCount(h.count)}개${amountStr}`);
    });
    if (tcTotal > 0) {
      lines.push(`T/C 합계: ${formatCurrency(tcTotal)}`);
    }
    lines.push('');
  }

  // W/T
  if (data.wtAmount > 0) {
    lines.push(`WT: ${formatCurrency(data.wtAmount)}`);
  }

  // 사입
  const activePurchases = data.purchases.filter(p => p.amount > 0);
  if (activePurchases.length > 0) {
    const purchaseParts = activePurchases.map(p => `${p.name} ${formatCurrency(p.amount)}`);
    lines.push(`사입: ${purchaseParts.join(' / ')}`);
    const purchaseTotal = activePurchases.reduce((sum, p) => sum + p.amount, 0);
    if (activePurchases.length > 1) {
      lines.push(`사입 합계: ${formatCurrency(purchaseTotal)}`);
    }
  }

  // 총합
  const liquorTotal = data.liquors.reduce((sum, l) => sum + l.bottles * l.pricePerBottle, 0);
  const purchaseTotal = data.purchases.reduce((sum, p) => sum + p.amount, 0);
  const grandTotal = liquorTotal + tcTotal + data.wtAmount + purchaseTotal;

  lines.push('');
  lines.push('--------------------------------');
  lines.push(`총합: ${formatCurrency(grandTotal)}`);
  lines.push('(주대/TC/WT/사입 포함)');

  return lines.join('\n');
}

/**
 * 카톡 복사용 텍스트 생성 (시작 시간 계산 탭)
 */
export function generateStartTimeText(
  hostessName: string,
  startTime: string,
  halfTime: string,
  fullTime: string
): string {
  const lines: string[] = [];
  lines.push(`[${hostessName}]`);
  lines.push(`시작시간: ${startTime}`);
  lines.push(`반티: ${halfTime} (시작+11분)`);
  lines.push(`완티: ${fullTime} (시작+31분)`);
  return lines.join('\n');
}

/**
 * 카톡 복사용 텍스트 생성 (끝난 개수 계산 탭)
 */
export function generateCountCalcText(
  startTime: string,
  endTime: string,
  totalMinutes: number,
  count: number
): string {
  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  const lines: string[] = [];
  lines.push(`시작: ${startTime}`);
  lines.push(`종료: ${endTime}`);
  lines.push(`경과: ${hours}시간 ${mins}분`);
  lines.push(`끝난 개수: ${formatCount(count)}개`);
  return lines.join('\n');
}
