import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { KPICard } from '@/components/common/KPICard';
import { StatusBadge } from '@/components/common/StatusBadge';
import { adminApi, type SweepSummary } from '@/lib/adminApi';
import type { SweepRequest } from '@/lib/mockData';
import { formatDate, formatCurrency, truncateText, maskUUID } from '@/lib/formatters';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Eye } from 'lucide-react';

export default function SweepRequests() {
  const [requests, setRequests] = useState<SweepRequest[]>([]);
  const [summary, setSummary] = useState<SweepSummary>({
    totalCount: 0,
    createdCount: 0,
    processingCount: 0,
    completedCount: 0,
    failedCount: 0,
  });
  const [selectedRequest, setSelectedRequest] = useState<SweepRequest | null>(null);
  const [filters, setFilters] = useState({
    status: 'ALL',
    userUuid: '',
    sweepRequestId: '',
    ticker: '',
  });

  const loadRequests = () => {
    adminApi.getSweepRequests({
      status: filters.status === 'ALL' ? undefined : filters.status,
      cardUserUuid: filters.userUuid || undefined,
      sweepRequestId: filters.sweepRequestId || undefined,
      page: 0,
      size: 100,
    }).then((response) => {
      setRequests(response.items);
      setSummary(response.summary);
    });
  };

  useEffect(() => {
    loadRequests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredRequests = requests.filter(request => {
    if (filters.status !== 'ALL' && request.requestStatus !== filters.status) return false;
    if (filters.userUuid && !request.userUuid.includes(filters.userUuid)) return false;
    if (filters.sweepRequestId && !request.sweepRequestId.includes(filters.sweepRequestId)) return false;
    if (filters.ticker && !request.ticker.includes(filters.ticker)) return false;
    return true;
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Title */}
        <div>
          <h2 className="text-2xl font-bold text-slate-900">투자 전환 요청 목록</h2>
          <p className="text-sm text-slate-600 mt-1">
            카드망에서 생성된 리워드 투자 전환 요청의 생성, 전송, 완료, 실패 상태를 조회합니다.
          </p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-4 gap-4">
          <KPICard label="전체 요청 건수" value={summary.totalCount} />
          <KPICard label="처리 완료 건수" value={summary.completedCount} />
          <KPICard label="처리 실패 건수" value={summary.failedCount} />
          <KPICard label="처리 중 건수" value={summary.processingCount} />
        </div>

        {/* Search & Filter */}
        <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm">
          <div className="grid grid-cols-5 gap-3 mb-4">
            <Select value={filters.status} onValueChange={(value) => setFilters({...filters, status: value})}>
              <SelectTrigger>
                <SelectValue placeholder="상태 선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">전체</SelectItem>
                <SelectItem value="CREATED">생성</SelectItem>
                <SelectItem value="SENT">전송</SelectItem>
                <SelectItem value="PROCESSING">처리중</SelectItem>
                <SelectItem value="COMPLETED">완료</SelectItem>
                <SelectItem value="FAILED">실패</SelectItem>
              </SelectContent>
            </Select>

            <Input 
              placeholder="사용자 UUID 검색"
              value={filters.userUuid}
              onChange={(e) => setFilters({...filters, userUuid: e.target.value})}
            />

            <Input 
              placeholder="sweepRequestId 검색"
              value={filters.sweepRequestId}
              onChange={(e) => setFilters({...filters, sweepRequestId: e.target.value})}
            />

            <Input 
              placeholder="Ticker 검색"
              value={filters.ticker}
              onChange={(e) => setFilters({...filters, ticker: e.target.value})}
            />

            <div className="flex gap-2">
              <Button className="flex-1" onClick={loadRequests}>조회</Button>
              <Button 
                variant="outline"
                onClick={() => {
                  setFilters({status: 'ALL', userUuid: '', sweepRequestId: '', ticker: ''});
                  setTimeout(loadRequests, 0);
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
                  <th>sweepRequestId</th>
                  <th>사용자 UUID</th>
                  <th>기간</th>
                  <th>포인트</th>
                  <th>원화</th>
                  <th>Ticker</th>
                  <th>상태</th>
                  <th>요청 시각</th>
                  <th>완료 시각</th>
                  <th>액션</th>
                </tr>
              </thead>
              <tbody>
                {filteredRequests.map((request) => (
                  <tr key={request.sweepRequestId}>
                    <td className="id-monospace">{maskUUID(request.sweepRequestId)}</td>
                    <td className="id-monospace">{maskUUID(request.userUuid)}</td>
                    <td>{request.baseMonth}</td>
                    <td className="font-mono text-right">{request.pointAmount.toLocaleString()}</td>
                    <td className="font-mono text-right">{formatCurrency(request.krwAmount)}</td>
                    <td className="font-semibold">{request.ticker}</td>
                    <td>
                      <StatusBadge status={request.requestStatus} />
                    </td>
                    <td className="text-xs">{formatDate(request.requestedAt)}</td>
                    <td className="text-xs">{formatDate(request.completedAt)}</td>
                    <td>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => setSelectedRequest(request)}
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
        {selectedRequest && (
          <div className="fixed right-0 top-16 bottom-0 w-96 bg-white border-l border-slate-200 shadow-lg p-6 overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-slate-900">상세 정보</h3>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setSelectedRequest(null)}
              >
                ✕
              </Button>
            </div>

            <div className="space-y-4 text-sm">
              <div>
                <label className="text-xs font-semibold text-slate-600 uppercase">sweepRequestId</label>
                <p className="id-monospace mt-1">{selectedRequest.sweepRequestId}</p>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 uppercase">사용자 UUID</label>
                <p className="id-monospace mt-1">{selectedRequest.userUuid}</p>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 uppercase">상태</label>
                <div className="mt-1">
                  <StatusBadge status={selectedRequest.requestStatus} />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 uppercase">포인트 / 원화</label>
                <p className="mt-1 font-mono">
                  {selectedRequest.pointAmount.toLocaleString()} / {formatCurrency(selectedRequest.krwAmount)}
                </p>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 uppercase">Ticker</label>
                <p className="mt-1 font-semibold">{selectedRequest.ticker}</p>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 uppercase">요청 시각</label>
                <p className="mt-1">{formatDate(selectedRequest.requestedAt)}</p>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 uppercase">전송 시각</label>
                <p className="mt-1">{formatDate(selectedRequest.sentAt)}</p>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 uppercase">완료 시각</label>
                <p className="mt-1">{formatDate(selectedRequest.completedAt)}</p>
              </div>

              {selectedRequest.failReason && (
                <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                  <label className="text-xs font-semibold text-red-900 uppercase">실패 사유</label>
                  <p className="mt-2 text-red-800 text-xs">{selectedRequest.failReason}</p>
                </div>
              )}

              <div className="pt-4 border-t border-slate-200">
                <Button className="w-full">재처리 요청</Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
