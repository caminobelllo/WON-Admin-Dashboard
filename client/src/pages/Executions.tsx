import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { KPICard } from '@/components/common/KPICard';
import { StatusBadge } from '@/components/common/StatusBadge';
import { adminApi, type ExecutionSummary } from '@/lib/adminApi';
import type { Execution } from '@/lib/mockData';
import { formatDate, maskUUID } from '@/lib/formatters';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Eye, CheckCircle2, AlertCircle, Clock } from 'lucide-react';

export default function Executions() {
  const [executions, setExecutions] = useState<Execution[]>([]);
  const [summary, setSummary] = useState<ExecutionSummary>({
    totalCount: 0,
    exchangeCompletedCount: 0,
    orderFailedCount: 0,
    completedCount: 0,
  });
  const [selectedExecution, setSelectedExecution] = useState<Execution | null>(null);
  const [filters, setFilters] = useState({
    status: 'ALL',
    userUuid: '',
    executionId: '',
    ticker: '',
  });

  const loadExecutions = (nextFilters = filters) => {
    adminApi.getAutoInvestExecutions({
      status: nextFilters.status === 'ALL' ? undefined : nextFilters.status,
      userUuid: nextFilters.userUuid || undefined,
      executionId: nextFilters.executionId || undefined,
      ticker: nextFilters.ticker || undefined,
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
  }, [filters.status]);

  const getStepperStatus = (execution: Execution) => {
    const steps = [
      { name: '요청 수신', status: 'completed' },
      { 
        name: '환전 요청', 
        status: execution.fxStatus === 'COMPLETED' ? 'completed' : 
                execution.fxStatus === 'FAILED' ? 'failed' :
                execution.fxStatus === 'REQUESTED' ? 'processing' : 'pending'
      },
      { 
        name: '환전 완료', 
        status: execution.fxStatus === 'COMPLETED' ? 'completed' : 'pending'
      },
      { 
        name: '주문 요청', 
        status: execution.orderStatus && execution.orderStatus !== 'REQUESTED' ? 'processing' : 'pending'
      },
      { 
        name: '체결 완료', 
        status: execution.orderStatus === 'FILLED' ? 'completed' : 'pending'
      },
      { 
        name: '잔고 반영', 
        status: execution.executionStatus === 'COMPLETED' ? 'completed' : 'pending'
      },
    ];
    return steps;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Title */}
        <div>
          <h2 className="text-2xl font-bold text-slate-900">자동투자 실행 현황</h2>
          <p className="text-sm text-slate-600 mt-1">
            증권망에서 처리 중인 환전, 주문, 체결 상태를 확인합니다.
          </p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-4 gap-4">
          <KPICard label="전체 실행 건수" value={summary.totalCount} />
          <KPICard label="환전 완료 건수" value={summary.exchangeCompletedCount} />
          <KPICard label="주문 실패 건수" value={summary.orderFailedCount} />
          <KPICard label="최종 완료 건수" value={summary.completedCount} />
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
                <SelectItem value="READY">준비</SelectItem>
                <SelectItem value="FX_REQUESTED">환전요청</SelectItem>
                <SelectItem value="FX_COMPLETED">환전완료</SelectItem>
                <SelectItem value="ORDER_REQUESTED">주문요청</SelectItem>
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
              <Button className="flex-1" onClick={() => loadExecutions()}>조회</Button>
              <Button 
                variant="outline"
                onClick={() => {
                  const nextFilters = {status: 'ALL', userUuid: '', executionId: '', ticker: ''};
                  setFilters(nextFilters);
                  loadExecutions(nextFilters);
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
                  <th>실행 상태</th>
                  <th>환전 상태</th>
                  <th>주문 상태</th>
                  <th>시작 시각</th>
                  <th>완료 시각</th>
                  <th>액션</th>
                </tr>
              </thead>
              <tbody>
                {executions.map((execution) => (
                  <tr key={execution.executionId}>
                    <td className="id-monospace">{maskUUID(execution.executionId)}</td>
                    <td className="id-monospace">{maskUUID(execution.sweepRequestId)}</td>
                    <td className="id-monospace">{maskUUID(execution.userUuid)}</td>
                    <td className="font-semibold">{execution.ticker}</td>
                    <td>
                      <StatusBadge status={execution.executionStatus} />
                    </td>
                    <td>
                      <StatusBadge status={execution.fxStatus} />
                    </td>
                    <td>
                      <StatusBadge status={execution.orderStatus} />
                    </td>
                    <td className="text-xs">{formatDate(execution.startedAt)}</td>
                    <td className="text-xs">{formatDate(execution.completedAt)}</td>
                    <td>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => setSelectedExecution(execution)}
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
        {selectedExecution && (
          <div className="fixed right-0 top-16 bottom-0 w-96 bg-white border-l border-slate-200 shadow-lg p-6 overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-slate-900">상세 정보</h3>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setSelectedExecution(null)}
              >
                ✕
              </Button>
            </div>

            {/* Stepper */}
            <div className="mb-6 space-y-3">
              <h4 className="text-xs font-semibold text-slate-600 uppercase">처리 흐름</h4>
              {getStepperStatus(selectedExecution).map((step, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold ${
                    step.status === 'completed' ? 'bg-green-100 text-green-800' :
                    step.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                    step.status === 'failed' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {step.status === 'completed' && <CheckCircle2 className="w-4 h-4" />}
                    {step.status === 'processing' && <Clock className="w-4 h-4" />}
                    {step.status === 'failed' && <AlertCircle className="w-4 h-4" />}
                    {step.status === 'pending' && idx + 1}
                  </div>
                  <span className="text-sm">{step.name}</span>
                </div>
              ))}
            </div>

            <div className="space-y-4 text-sm border-t border-slate-200 pt-4">
              <div>
                <label className="text-xs font-semibold text-slate-600 uppercase">executionId</label>
                <p className="id-monospace mt-1">{selectedExecution.executionId}</p>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 uppercase">상태</label>
                <div className="mt-1">
                  <StatusBadge status={selectedExecution.executionStatus} />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 uppercase">Ticker</label>
                <p className="mt-1 font-semibold">{selectedExecution.ticker}</p>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 uppercase">시작 시각</label>
                <p className="mt-1">{formatDate(selectedExecution.startedAt)}</p>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 uppercase">완료 시각</label>
                <p className="mt-1">{formatDate(selectedExecution.completedAt)}</p>
              </div>

              {selectedExecution.failReason && (
                <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                  <label className="text-xs font-semibold text-red-900 uppercase">실패 사유</label>
                  <p className="mt-2 text-red-800 text-xs">{selectedExecution.failReason}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
