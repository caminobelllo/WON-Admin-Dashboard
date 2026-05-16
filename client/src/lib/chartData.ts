// Chart data generators for Financial Dashboard

export interface ExecutionStatusData {
  name: string;
  value: number;
  fill: string;
}

export interface FailureTimelineData {
  time: string;
  failures: number;
}

export interface EventStatusData {
  name: string;
  published: number;
  failed: number;
  retrying: number;
}

// 자동투자 처리 상태 도넛 차트 데이터
export const getExecutionStatusChartData = (): ExecutionStatusData[] => {
  return [
    { name: '완료', value: 45, fill: '#10b981' },
    { name: '처리중', value: 28, fill: '#3b82f6' },
    { name: '대기', value: 18, fill: '#9ca3af' },
    { name: '실패', value: 9, fill: '#ef4444' },
  ];
};

// 시간대별 실패 건수 라인 차트 데이터
export const getFailureTimelineChartData = (): FailureTimelineData[] => {
  const now = new Date();
  const data: FailureTimelineData[] = [];
  
  for (let i = 23; i >= 0; i--) {
    const time = new Date(now.getTime() - i * 60 * 60 * 1000);
    const hour = time.getHours().toString().padStart(2, '0');
    
    // 시뮬레이션: 일부 시간대에 더 많은 실패
    const baseFailures = Math.floor(Math.random() * 5);
    const peakHours = [9, 10, 14, 15]; // 업무 시간대
    const failures = peakHours.includes(time.getHours()) 
      ? baseFailures + Math.floor(Math.random() * 8)
      : baseFailures;
    
    data.push({
      time: `${hour}:00`,
      failures: Math.max(0, failures),
    });
  }
  
  return data;
};

// 이벤트 발행 상태 막대 차트 데이터
export const getEventStatusChartData = (): EventStatusData[] => {
  return [
    {
      name: '카드망',
      published: 156,
      failed: 12,
      retrying: 3,
    },
    {
      name: '증권망',
      published: 142,
      failed: 8,
      retrying: 5,
    },
  ];
};

// 차트 색상 설정
export const chartColors = {
  success: '#10b981',
  failed: '#ef4444',
  processing: '#3b82f6',
  pending: '#9ca3af',
  cancelled: '#6b7280',
  published: '#10b981',
  retrying: '#f59e0b',
};
