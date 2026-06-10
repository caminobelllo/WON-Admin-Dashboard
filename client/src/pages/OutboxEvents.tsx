import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { KPICard } from '@/components/common/KPICard';
import { StatusBadge } from '@/components/common/StatusBadge';
import { adminApi, type OutboxSummary } from '@/lib/adminApi';
import type { OutboxEvent } from '@/lib/mockData';
import { formatDate, truncateText, maskUUID, getSystemTypeLabel, getEventTypeLabel } from '@/lib/formatters';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Eye, ChevronDown, ChevronUp, RotateCcw, Loader2 } from 'lucide-react';

export default function OutboxEvents() {
  const [events, setEvents] = useState<OutboxEvent[]>([]);
  const [summary, setSummary] = useState<OutboxSummary>({
    totalCount: 0,
    publishedCount: 0,
    failedCount: 0,
    retryingCount: 0,
    pendingCount: 0,
  });
  const [selectedEvent, setSelectedEvent] = useState<OutboxEvent | null>(null);
  const [expandedPayload, setExpandedPayload] = useState(false);
  const [retryingOutboxId, setRetryingOutboxId] = useState<string | null>(null);
  const [notice, setNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [filters, setFilters] = useState({
    systemType: 'ALL',
    publishStatus: 'ALL',
    sweepRequestId: '',
  });

  const loadEvents = () => {
    adminApi.getOutboxEvents({
      systemType: filters.systemType === 'ALL' ? undefined : filters.systemType,
      status: filters.publishStatus === 'ALL' ? undefined : filters.publishStatus,
      sweepRequestId: filters.sweepRequestId || undefined,
      page: 0,
      size: 100,
    }).then((response) => {
      setEvents(response.items);
      setSummary(response.summary);
    });
  };

  useEffect(() => {
    loadEvents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredEvents = events.filter(event => {
    if (filters.systemType !== 'ALL' && event.systemType !== filters.systemType) return false;
    if (filters.publishStatus !== 'ALL' && event.publishStatus !== filters.publishStatus) return false;
    if (filters.sweepRequestId && !event.sweepRequestId.includes(filters.sweepRequestId)) return false;
    return true;
  });

  const updateEvent = (updatedEvent: OutboxEvent) => {
    setEvents((prev) => prev.map((event) => (
      event.outboxId === updatedEvent.outboxId ? updatedEvent : event
    )));
    setSelectedEvent((prev) => (
      prev?.outboxId === updatedEvent.outboxId ? updatedEvent : prev
    ));
  };

  const handleRetry = async (event: OutboxEvent) => {
    if (!event.retryable || retryingOutboxId) {
      return;
    }

    setRetryingOutboxId(event.outboxId);
    setNotice(null);

    try {
      const updatedEvent = await adminApi.retryOutboxEvent(event.outboxId);
      updateEvent(updatedEvent);
      setNotice({ type: 'success', message: 'Outbox 이벤트 재처리 요청이 완료되었습니다.' });
      loadEvents();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Outbox 이벤트 재처리 요청에 실패했습니다.';
      setNotice({ type: 'error', message });
    } finally {
      setRetryingOutboxId(null);
    }
  };

  const mockPayload = {
    sweepRequestId: selectedEvent?.sweepRequestId,
    eventType: selectedEvent?.eventType,
    systemType: selectedEvent?.systemType,
    timestamp: selectedEvent?.createdAt,
    data: {
      amount: 500000,
      currency: 'KRW',
      ticker: 'QQQ',
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Title */}
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Outbox 이벤트 조회</h2>
          <p className="text-sm text-slate-600 mt-1">
            카드망 또는 증권망에서 외부로 발행한 이벤트의 발행 상태를 조회합니다.
          </p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-4 gap-4">
          <KPICard label="전체 Outbox 이벤트" value={summary.totalCount} />
          <KPICard label="발행 완료" value={summary.publishedCount} />
          <KPICard label="발행 실패" value={summary.failedCount} />
          <KPICard label="재시도 중" value={summary.retryingCount} />
        </div>

        {/* Search & Filter */}
        <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm">
          <div className="grid grid-cols-5 gap-3 mb-4">
            <Select value={filters.systemType} onValueChange={(value) => setFilters({...filters, systemType: value})}>
              <SelectTrigger>
                <SelectValue placeholder="시스템 선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">전체</SelectItem>
                <SelectItem value="CARD">카드망</SelectItem>
                <SelectItem value="INVST">증권망</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.publishStatus} onValueChange={(value) => setFilters({...filters, publishStatus: value})}>
              <SelectTrigger>
                <SelectValue placeholder="발행 상태" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">전체</SelectItem>
                <SelectItem value="PENDING">대기</SelectItem>
                <SelectItem value="PUBLISHED">발행됨</SelectItem>
                <SelectItem value="FAILED">실패</SelectItem>
                <SelectItem value="RETRYING">재시도중</SelectItem>
              </SelectContent>
            </Select>

            <Input 
              placeholder="sweepRequestId 검색"
              value={filters.sweepRequestId}
              onChange={(e) => setFilters({...filters, sweepRequestId: e.target.value})}
            />

            <div className="flex gap-2">
              <Button className="flex-1" onClick={loadEvents}>조회</Button>
              <Button 
                variant="outline"
                onClick={() => {
                  setFilters({systemType: 'ALL', publishStatus: 'ALL', sweepRequestId: ''});
                  setTimeout(loadEvents, 0);
                }}
              >
                초기화
              </Button>
            </div>
          </div>
        </div>

        {notice && (
          <div className={`rounded-lg border px-4 py-3 text-sm ${
            notice.type === 'success'
              ? 'border-green-200 bg-green-50 text-green-800'
              : 'border-red-200 bg-red-50 text-red-800'
          }`}>
            {notice.message}
          </div>
        )}

        {/* Data Table */}
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>outboxId</th>
                  <th>시스템</th>
                  <th>sweepRequestId</th>
                  <th>이벤트 타입</th>
                  <th>발행 상태</th>
                  <th>재시도 횟수</th>
                  <th>마지막 오류</th>
                  <th>재처리</th>
                  <th>발행 시각</th>
                  <th>생성 시각</th>
                  <th>액션</th>
                </tr>
              </thead>
              <tbody>
                {filteredEvents.map((event) => (
                  <tr key={event.outboxId}>
                    <td className="id-monospace">{maskUUID(event.outboxId)}</td>
                    <td className="text-sm font-medium">
                      {getSystemTypeLabel(event.systemType)}
                    </td>
                    <td className="id-monospace">{maskUUID(event.sweepRequestId)}</td>
                    <td className="text-sm">{getEventTypeLabel(event.eventType)}</td>
                    <td>
                      <StatusBadge status={event.publishStatus} />
                    </td>
                    <td className="text-center font-mono">{event.retryCount}</td>
                    <td className="text-xs max-w-xs">
                      {truncateText(event.lastErrorMessage || '-', 40)}
                    </td>
                    <td>
                      <Button
                        variant={event.retryable ? 'outline' : 'ghost'}
                        size="sm"
                        disabled={!event.retryable || retryingOutboxId === event.outboxId}
                        title={event.retryable ? 'Outbox 이벤트 재처리' : event.retryDisabledReason || '재처리할 수 없습니다.'}
                        onClick={() => handleRetry(event)}
                      >
                        {retryingOutboxId === event.outboxId ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <RotateCcw className="w-4 h-4" />
                        )}
                      </Button>
                    </td>
                    <td className="text-xs">{formatDate(event.publishedAt)}</td>
                    <td className="text-xs">{formatDate(event.createdAt)}</td>
                    <td>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => setSelectedEvent(event)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Detail Panel */}
        {selectedEvent && (
          <div className="fixed right-0 top-16 bottom-0 w-96 bg-white border-l border-slate-200 shadow-lg p-6 overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-slate-900">상세 정보</h3>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setSelectedEvent(null)}
              >
                ✕
              </Button>
            </div>

            <div className="space-y-4 text-sm">
              <div>
                <label className="text-xs font-semibold text-slate-600 uppercase">outboxId</label>
                <p className="id-monospace mt-1">{selectedEvent.outboxId}</p>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 uppercase">시스템</label>
                <p className="mt-1 font-medium">{getSystemTypeLabel(selectedEvent.systemType)}</p>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 uppercase">이벤트 타입</label>
                <p className="mt-1">{getEventTypeLabel(selectedEvent.eventType)}</p>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 uppercase">발행 상태</label>
                <div className="mt-1">
                  <StatusBadge status={selectedEvent.publishStatus} />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 uppercase">재시도 횟수</label>
                <p className="mt-1 font-mono">{selectedEvent.retryCount}</p>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 uppercase">재처리 가능 여부</label>
                <div className="mt-2 flex items-center gap-2">
                  <span className={`status-badge ${selectedEvent.retryable ? 'status-success' : 'status-pending'}`}>
                    {selectedEvent.retryable ? '가능' : '불가'}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={!selectedEvent.retryable || retryingOutboxId === selectedEvent.outboxId}
                    onClick={() => handleRetry(selectedEvent)}
                  >
                    {retryingOutboxId === selectedEvent.outboxId ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <RotateCcw className="w-4 h-4" />
                    )}
                    재처리
                  </Button>
                </div>
                {!selectedEvent.retryable && selectedEvent.retryDisabledReason && (
                  <p className="mt-2 text-xs text-slate-500">{selectedEvent.retryDisabledReason}</p>
                )}
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 uppercase">발행 시각</label>
                <p className="mt-1">{formatDate(selectedEvent.publishedAt)}</p>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 uppercase">생성 시각</label>
                <p className="mt-1">{formatDate(selectedEvent.createdAt)}</p>
              </div>

              {selectedEvent.lastErrorMessage && (
                <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                  <label className="text-xs font-semibold text-red-900 uppercase">마지막 오류 메시지</label>
                  <p className="mt-2 text-red-800 text-xs">{selectedEvent.lastErrorMessage}</p>
                </div>
              )}

              {/* JSON Payload Viewer */}
              <div className="border-t border-slate-200 pt-4">
                <button 
                  onClick={() => setExpandedPayload(!expandedPayload)}
                  className="flex items-center gap-2 text-xs font-semibold text-slate-600 uppercase hover:text-slate-900"
                >
                  {expandedPayload ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  페이로드
                </button>
                {expandedPayload && (
                  <pre className="mt-3 p-3 bg-slate-50 rounded border border-slate-200 text-xs overflow-auto max-h-48 text-slate-700">
                    {JSON.stringify(mockPayload, null, 2)}
                  </pre>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
