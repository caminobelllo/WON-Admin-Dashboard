// Formatting utilities for Financial Dashboard

export const formatDate = (dateString: string | null | undefined): string => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency: 'KRW',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('ko-KR').format(num);
};

export const maskUUID = (uuid: string): string => {
  if (!uuid || uuid.length < 8) return uuid;
  return `${uuid.substring(0, 8)}...`;
};

export const maskAccountNumber = (accountNumber: string): string => {
  if (!accountNumber || accountNumber.length < 4) return accountNumber;
  const masked = '*'.repeat(accountNumber.length - 4);
  return `${masked}${accountNumber.substring(accountNumber.length - 4)}`;
};

export const maskCardNumber = (cardNumber: string): string => {
  if (!cardNumber || cardNumber.length < 4) return cardNumber;
  const masked = '*'.repeat(cardNumber.length - 4);
  return `${masked}${cardNumber.substring(cardNumber.length - 4)}`;
};

export const truncateText = (text: string, maxLength: number = 50): string => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
};

export const getStatusBadgeClass = (status: string): string => {
  const statusMap: Record<string, string> = {
    // Success statuses
    'COMPLETED': 'status-badge status-success',
    'PROCESSED': 'status-badge status-success',
    'PUBLISHED': 'status-badge status-success',
    'FILLED': 'status-badge status-success',
    
    // Failed statuses
    'FAILED': 'status-badge status-failed',
    
    // Processing statuses
    'PROCESSING': 'status-badge status-processing',
    'RETRYING': 'status-badge status-processing',
    'FX_REQUESTED': 'status-badge status-processing',
    'ORDER_REQUESTED': 'status-badge status-processing',
    'SENT': 'status-badge status-processing',
    'PARTIAL_FILLED': 'status-badge status-processing',
    
    // Pending statuses
    'CREATED': 'status-badge status-pending',
    'RECEIVED': 'status-badge status-pending',
    'PENDING': 'status-badge status-pending',
    'READY': 'status-badge status-pending',
    
    // Cancelled statuses
    'CANCELLED': 'status-badge status-cancelled',
  };
  
  return statusMap[status] || 'status-badge status-pending';
};

export const getStatusLabel = (status: string): string => {
  const labelMap: Record<string, string> = {
    'COMPLETED': '완료',
    'PROCESSED': '처리됨',
    'PUBLISHED': '발행됨',
    'FAILED': '실패',
    'PROCESSING': '처리중',
    'RETRYING': '재시도중',
    'FX_REQUESTED': '환전요청',
    'FX_COMPLETED': '환전완료',
    'ORDER_REQUESTED': '주문요청',
    'CREATED': '생성',
    'RECEIVED': '수신',
    'PENDING': '대기',
    'READY': '준비',
    'CANCELLED': '취소',
    'SENT': '전송',
    'PARTIAL_FILLED': '부분체결',
    'FILLED': '체결',
  };
  
  return labelMap[status] || status;
};

export const getSystemTypeLabel = (systemType: string): string => {
  const labelMap: Record<string, string> = {
    'CARD': '카드망',
    'INVST': '증권망',
  };
  
  return labelMap[systemType] || systemType;
};

export const getEventTypeLabel = (eventType: string): string => {
  const labelMap: Record<string, string> = {
    'SWEEP_REQUESTED': '투자전환요청',
    'AUTO_INVEST_COMPLETED': '자동투자완료',
    'AUTO_INVEST_FAILED': '자동투자실패',
  };
  
  return labelMap[eventType] || eventType;
};
