// 도넛 차트의 상태를 실제 executionStatus로 매핑
export function mapChartStatusToExecutionStatus(chartStatus: string): string | null {
  const mapping: Record<string, string> = {
    '완료': 'COMPLETED',
    '처리중': 'PROCESSING',
    '대기': 'PENDING',
    '실패': 'FAILED',
  };
  return mapping[chartStatus] || null;
}

// 역매핑: 실행 상태를 도넛 차트 상태로
export function mapExecutionStatusToChartStatus(executionStatus: string): string | null {
  const mapping: Record<string, string> = {
    'COMPLETED': '완료',
    'PROCESSING': '처리중',
    'PENDING': '대기',
    'FAILED': '실패',
  };
  return mapping[executionStatus] || null;
}
