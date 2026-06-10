import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { KPICard } from '@/components/common/KPICard';
import { StatusBadge } from '@/components/common/StatusBadge';
import { adminApi, type InboxSummary } from '@/lib/adminApi';
import type { InboxEvent } from '@/lib/mockData';
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
import { Eye, ChevronDown, ChevronUp } from 'lucide-react';

export default function InboxEvents() {
  const [events, setEvents] = useState<InboxEvent[]>([]);
  const [summary, setSummary] = useState<InboxSummary>({
    totalCount: 0,
    processedCount: 0,
    failedCount: 0,
    processingCount: 0,
    receivedCount: 0,
  });
  const [selectedEvent, setSelectedEvent] = useState<InboxEvent | null>(null);
  const [expandedPayload, setExpandedPayload] = useState(false);
  const [filters, setFilters] = useState({
    systemType: 'CARD',
    processStatus: 'ALL',
    sweepRequestId: '',
  });

  const loadEvents = (nextFilters = filters) => {
    adminApi.getInboxEvents({
      systemType: nextFilters.systemType,
      status: nextFilters.processStatus === 'ALL' ? undefined : nextFilters.processStatus,
      sweepRequestId: nextFilters.sweepRequestId || undefined,
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
  }, [filters.systemType, filters.processStatus]);

  const filteredEvents = events.filter(event => {
    if (event.systemType !== filters.systemType) return false;
    if (filters.processStatus !== 'ALL' && event.processStatus !== filters.processStatus) return false;
    if (filters.sweepRequestId && !event.sweepRequestId.includes(filters.sweepRequestId)) return false;
    return true;
  });

  const mockPayload = {
    inboxId: selectedEvent?.inboxId,
    sourceEventId: selectedEvent?.sourceEventId,
    eventType: selectedEvent?.eventType,
    systemType: selectedEvent?.systemType,
    timestamp: selectedEvent?.receivedAt,
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
          <h2 className="text-2xl font-bold text-slate-900">Inbox 이벤트 조회</h2>
          <p className="text-sm text-slate-600 mt-1">
            상대 시스템에서 수신한 이벤트의 저장 및 처리 상태를 조회합니다.
          </p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-4 gap-4">
          <KPICard label="전체 Inbox 이벤트" value={summary.totalCount} />
          <KPICard label="처리 완료" value={summary.processedCount} />
          <KPICard label="처리 실패" value={summary.failedCount} />
          <KPICard label="처리 중" value={summary.processingCount} />
        </div>

        {/* Search & Filter */}
        <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm">
          <div className="grid grid-cols-5 gap-3 mb-4">
            <Select value={filters.systemType} onValueChange={(value) => setFilters({...filters, systemType: value})}>
              <SelectTrigger>
                <SelectValue placeholder="시스템 선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CARD">카드망</SelectItem>
                <SelectItem value="INVEST">증권망</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.processStatus} onValueChange={(value) => setFilters({...filters, processStatus: value})}>
              <SelectTrigger>
                <SelectValue placeholder="처리 상태" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">전체</SelectItem>
                <SelectItem value="RECEIVED">수신</SelectItem>
                <SelectItem value="PROCESSING">처리중</SelectItem>
                <SelectItem value="PROCESSED">처리됨</SelectItem>
                <SelectItem value="FAILED">실패</SelectItem>
              </SelectContent>
            </Select>

            <Input 
              placeholder="sweepRequestId 검색"
              value={filters.sweepRequestId}
              onChange={(e) => setFilters({...filters, sweepRequestId: e.target.value})}
            />

            <div className="flex gap-2">
              <Button className="flex-1" onClick={() => loadEvents()}>조회</Button>
              <Button 
                variant="outline"
                onClick={() => {
                  const nextFilters = {systemType: 'CARD', processStatus: 'ALL', sweepRequestId: ''};
                  setFilters(nextFilters);
                  loadEvents(nextFilters);
                }}
              >
                초기화
              </Button>
            </div>
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>inboxId</th>
                  <th>시스템</th>
                  <th>sweepRequestId</th>
                  <th>sourceEventId</th>
                  <th>이벤트 타입</th>
                  <th>처리 상태</th>
                  <th>수신 시각</th>
                  <th>처리 완료 시각</th>
                  <th>액션</th>
                </tr>
              </thead>
              <tbody>
                {filteredEvents.map((event) => (
                  <tr key={event.inboxId}>
                    <td className="id-monospace">{maskUUID(event.inboxId)}</td>
                    <td className="text-sm font-medium">
                      {getSystemTypeLabel(event.systemType)}
                    </td>
                    <td className="id-monospace">{maskUUID(event.sweepRequestId)}</td>
                    <td className="id-monospace">{maskUUID(event.sourceEventId)}</td>
                    <td className="text-sm">{getEventTypeLabel(event.eventType)}</td>
                    <td>
                      <StatusBadge status={event.processStatus} />
                    </td>
                    <td className="text-xs">{formatDate(event.receivedAt)}</td>
                    <td className="text-xs">{formatDate(event.processedAt)}</td>
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
                <label className="text-xs font-semibold text-slate-600 uppercase">inboxId</label>
                <p className="id-monospace mt-1">{selectedEvent.inboxId}</p>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 uppercase">원천 이벤트 ID</label>
                <p className="id-monospace mt-1">{selectedEvent.sourceEventId}</p>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 uppercase">수신 시스템</label>
                <p className="mt-1 font-medium">{getSystemTypeLabel(selectedEvent.systemType)}</p>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 uppercase">이벤트 타입</label>
                <p className="mt-1">{getEventTypeLabel(selectedEvent.eventType)}</p>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 uppercase">처리 상태</label>
                <div className="mt-1">
                  <StatusBadge status={selectedEvent.processStatus} />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 uppercase">수신 시각</label>
                <p className="mt-1">{formatDate(selectedEvent.receivedAt)}</p>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 uppercase">처리 완료 시각</label>
                <p className="mt-1">{formatDate(selectedEvent.processedAt)}</p>
              </div>

              {selectedEvent.failReason && (
                <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                  <label className="text-xs font-semibold text-red-900 uppercase">실패 사유</label>
                  <p className="mt-2 text-red-800 text-xs">{selectedEvent.failReason}</p>
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
