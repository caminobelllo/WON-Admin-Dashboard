import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { KPICard } from '@/components/common/KPICard';
import { StatusBadge } from '@/components/common/StatusBadge';
import { adminApi, type RetrySummary } from '@/lib/adminApi';
import type { Execution } from '@/lib/mockData';
import { formatDate, truncateText, maskUUID } from '@/lib/formatters';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { AlertCircle, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';

export default function RetryManagement() {
  const [executions, setExecutions] = useState<(Execution & { failedStep: string; retryable: boolean })[]>([]);
  const [summary, setSummary] = useState<RetrySummary>({
    retryableCount: 0,
    retryingCount: 0,
    retrySucceededCount: 0,
    retryFailedCount: 0,
  });
  const [selectedExecution, setSelectedExecution] = useState<(Execution & { failedStep: string; retryable: boolean }) | null>(null);
  const [retryModalOpen, setRetryModalOpen] = useState(false);
  const [retryReason, setRetryReason] = useState('');
  const [retryStep, setRetryStep] = useState('FX');
  const [filters, setFilters] = useState({
    userUuid: '',
    executionId: '',
    ticker: '',
  });

  const loadExecutions = () => {
    adminApi.getRetryTargets({
      cardUserUuid: filters.userUuid || undefined,
      sweepRequestId: filters.executionId || undefined,
      page: 0,
      size: 100,
    }).then((response) => {
      setExecutions(response.items);
      setSummary(response.summary);
    });
  };

  useEffect(() => {
    loadExecutions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredExecutions = executions.filter(execution => {
    if (filters.userUuid && !execution.userUuid.includes(filters.userUuid)) return false;
    if (filters.executionId && !execution.executionId.includes(filters.executionId)) return false;
    if (filters.ticker && !execution.ticker.includes(filters.ticker)) return false;
    return true;
  });

  const handleRetryClick = (execution: Execution & { failedStep: string; retryable: boolean }) => {
    setSelectedExecution(execution);
    setRetryModalOpen(true);
  };

  const handleRetrySubmit = () => {
    if (!retryReason.trim()) {
      toast.error('재처리 사유를 입력해주세요');
      return;
    }
    
    toast.success('자동투자 재처리 요청이 접수되었습니다.');
    setRetryModalOpen(false);
    setRetryReason('');
    setRetryStep('FX');
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Title */}
        <div>
          <h2 className="text-2xl font-bold text-slate-900">자동투자 재처리</h2>
          <p className="text-sm text-slate-600 mt-1">
            실패한 자동투자 실행 건을 운영자가 검토한 후 재처리합니다.
          </p>
        </div>

        {/* Alert Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-blue-800">
            재처리는 FAILED 상태의 실행 건에 대해서만 가능합니다. 이미 완료된 환전, 주문, 체결은 중복 처리되지 않도록 멱등키를 기준으로 검증합니다.
          </p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-4 gap-4">
          <KPICard label="재처리 가능 건수" value={summary.retryableCount} />
          <KPICard label="재처리 진행 중" value={summary.retryingCount} />
          <KPICard label="재처리 성공" value={summary.retrySucceededCount} />
          <KPICard label="재처리 실패" value={summary.retryFailedCount} />
        </div>

        {/* Search & Filter */}
        <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm">
          <div className="grid grid-cols-5 gap-3 mb-4">
            <Select value="FAILED" disabled>
              <SelectTrigger>
                <SelectValue placeholder="상태 선택" />
              </SelectTrigger>
            </Select>

            <Input 
              placeholder="사용자 UUID 검색"
              value={filters.userUuid}
              onChange={(e) => setFilters({...filters, userUuid: e.target.value})}
            />

            <Input 
              placeholder="executionId 검색"
              value={filters.executionId}
              onChange={(e) => setFilters({...filters, executionId: e.target.value})}
            />

            <Input 
              placeholder="Ticker 검색"
              value={filters.ticker}
              onChange={(e) => setFilters({...filters, ticker: e.target.value})}
            />

            <div className="flex gap-2">
              <Button className="flex-1" onClick={loadExecutions}>조회</Button>
              <Button 
                variant="outline"
                onClick={() => {
                  setFilters({userUuid: '', executionId: '', ticker: ''});
                  setTimeout(loadExecutions, 0);
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
                  <th>executionId</th>
                  <th>sweepRequestId</th>
                  <th>사용자 UUID</th>
                  <th>Ticker</th>
                  <th>실패 단계</th>
                  <th>환전 상태</th>
                  <th>주문 상태</th>
                  <th>실패 사유</th>
                  <th>재처리 가능</th>
                  <th>액션</th>
                </tr>
              </thead>
              <tbody>
                {filteredExecutions.map((execution) => (
                  <tr key={execution.executionId}>
                    <td className="id-monospace">{maskUUID(execution.executionId)}</td>
                    <td className="id-monospace">{maskUUID(execution.sweepRequestId)}</td>
                    <td className="id-monospace">{maskUUID(execution.userUuid)}</td>
                    <td className="font-semibold">{execution.ticker}</td>
                    <td>
                      <span className="text-xs font-medium">
                        {execution.failedStep}
                      </span>
                    </td>
                    <td>
                      <StatusBadge status={execution.fxStatus} />
                    </td>
                    <td>
                      <StatusBadge status={execution.orderStatus} />
                    </td>
                    <td className="text-xs max-w-xs">
                      {truncateText(execution.failReason || '오류 정보 없음', 40)}
                    </td>
                    <td>
                      <span className={`text-xs font-medium ${execution.retryable ? 'text-green-700' : 'text-slate-500'}`}>
                        {execution.retryable ? '가능' : '불가'}
                      </span>
                    </td>
                    <td>
                      <Button 
                        variant="default"
                        size="sm"
                        onClick={() => handleRetryClick(execution)}
                        className="gap-2"
                      >
                        <RotateCcw className="w-4 h-4" />
                        재처리
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Retry Modal */}
        <Dialog open={retryModalOpen} onOpenChange={setRetryModalOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>자동투자 재처리 요청</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-700">executionId</label>
                <div className="mt-1 p-2 bg-slate-50 rounded border border-slate-200 text-sm id-monospace">
                  {selectedExecution?.executionId}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700">sweepRequestId</label>
                <div className="mt-1 p-2 bg-slate-50 rounded border border-slate-200 text-sm id-monospace">
                  {selectedExecution?.sweepRequestId}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700">기존 실패 사유</label>
                <div className="mt-1 p-2 bg-red-50 rounded border border-red-200 text-sm text-red-800">
                  {selectedExecution?.failReason}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700">재처리 시작 단계</label>
                <Select value={retryStep} onValueChange={setRetryStep}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="FX">환전 (FX)</SelectItem>
                    <SelectItem value="ORDER">주문 (ORDER)</SelectItem>
                    <SelectItem value="EXECUTION">체결 (EXECUTION)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700">재처리 사유</label>
                <Textarea 
                  placeholder="재처리 사유를 입력해주세요"
                  value={retryReason}
                  onChange={(e) => setRetryReason(e.target.value)}
                  className="mt-1"
                  rows={3}
                />
              </div>

              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200 text-xs text-blue-800">
                중복 환전·중복 주문·중복 잔고 반영을 방지하기 위해 멱등성 검증 후 처리됩니다.
              </div>
            </div>

            <DialogFooter>
              <Button 
                variant="outline"
                onClick={() => setRetryModalOpen(false)}
              >
                취소
              </Button>
              <Button 
                onClick={handleRetrySubmit}
              >
                재처리 요청
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
