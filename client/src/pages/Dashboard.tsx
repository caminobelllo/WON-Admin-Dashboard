import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { KPICard } from '@/components/common/KPICard';
import { StatusBadge } from '@/components/common/StatusBadge';
import { ChartFilterProvider, useChartFilter } from '@/contexts/ChartFilterContext';
import { ExecutionStatusChart } from '@/components/charts/ExecutionStatusChart';
import { FailureTimelineChart } from '@/components/charts/FailureTimelineChart';
import { EventStatusChart } from '@/components/charts/EventStatusChart';
import { 
  mockDashboardKPIs, 
  mockSweepRequests, 
  mockExecutions, 
  mockOutboxEvents, 
  mockInboxEvents 
} from '@/lib/mockData';
import { formatDate, formatCurrency, truncateText } from '@/lib/formatters';
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';

function DashboardContent() {
  const { executionStatusFilter } = useChartFilter();
  
  // 필터 적용: executionStatusFilter가 있으면 해당 상태만 필터링
  let filteredExecutions = mockExecutions;
  if (executionStatusFilter) {
    filteredExecutions = mockExecutions.filter(e => e.executionStatus === executionStatusFilter);
  }
  
  const failedExecutions = filteredExecutions.filter(e => e.executionStatus === 'FAILED').slice(0, 5);
  const failedOutboxEvents = mockOutboxEvents.filter(e => e.publishStatus === 'FAILED').slice(0, 5);
  const failedInboxEvents = mockInboxEvents.filter(e => e.processStatus === 'FAILED').slice(0, 5);

  return (
    <div>
      <div className="space-y-8">
        {/* Page Title */}
        <div>
          <h2 className="text-2xl font-bold text-slate-900">대시보드</h2>
          <p className="text-sm text-slate-600 mt-1">
            전체 운영 상태를 한눈에 확인하세요
          </p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-5 gap-4">
          <KPICard 
            label="금일 투자 전환 요청" 
            value={mockDashboardKPIs.todaySweepRequests}
          />
          <KPICard 
            label="금일 자동투자 완료" 
            value={mockDashboardKPIs.todayCompletedExecutions}
          />
          <KPICard 
            label="금일 실패 건수" 
            value={mockDashboardKPIs.todayFailures}
            trend="up"
            trendValue="↑ 전일 대비 +2"
          />
          <KPICard 
            label="Outbox 발행 실패" 
            value={mockDashboardKPIs.outboxPublishFailures}
          />
          <KPICard 
            label="Inbox 처리 실패" 
            value={mockDashboardKPIs.inboxProcessFailures}
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-3 gap-6">
          <ExecutionStatusChart />
          <FailureTimelineChart />
          <EventStatusChart />
        </div>

        {/* Recent Failures Section */}
        <div className="grid grid-cols-3 gap-6">
          {/* Recent Failed Executions */}
          <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm">
            <h3 className="font-semibold text-slate-900 mb-4">
              최근 실패 자동투자
            </h3>
            <div className="space-y-3">
              {failedExecutions.length > 0 ? (
                failedExecutions.map((execution) => (
                  <div 
                    key={execution.executionId}
                    className="flex items-start justify-between p-3 bg-red-50 rounded-lg border border-red-100"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <StatusBadge status={execution.executionStatus} />
                        <span className="text-xs text-slate-600 font-mono">
                          {execution.executionId.substring(0, 8)}...
                        </span>
                      </div>
                      <p className="text-xs text-red-700 line-clamp-2">
                        {truncateText(execution.failReason || '오류 정보 없음', 40)}
                      </p>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="ml-2 flex-shrink-0"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-500 text-center py-4">
                  실패 건이 없습니다
                </p>
              )}
            </div>
          </div>

          {/* Recent Failed Outbox Events */}
          <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm">
            <h3 className="font-semibold text-slate-900 mb-4">
              최근 Outbox 실패 이벤트
            </h3>
            <div className="space-y-3">
              {failedOutboxEvents.length > 0 ? (
                failedOutboxEvents.map((event) => (
                  <div 
                    key={event.outboxId}
                    className="flex items-start justify-between p-3 bg-red-50 rounded-lg border border-red-100"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <StatusBadge status={event.publishStatus} />
                        <span className="text-xs text-slate-600">
                          {event.systemType === 'CARD' ? '카드망' : '증권망'}
                        </span>
                      </div>
                      <p className="text-xs text-red-700 line-clamp-2">
                        {truncateText(event.lastErrorMessage || '오류 정보 없음', 40)}
                      </p>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="ml-2 flex-shrink-0"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-500 text-center py-4">
                  실패 이벤트가 없습니다
                </p>
              )}
            </div>
          </div>

          {/* Recent Failed Inbox Events */}
          <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm">
            <h3 className="font-semibold text-slate-900 mb-4">
              최근 Inbox 실패 이벤트
            </h3>
            <div className="space-y-3">
              {failedInboxEvents.length > 0 ? (
                failedInboxEvents.map((event) => (
                  <div 
                    key={event.inboxId}
                    className="flex items-start justify-between p-3 bg-red-50 rounded-lg border border-red-100"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <StatusBadge status={event.processStatus} />
                        <span className="text-xs text-slate-600">
                          {event.systemType === 'CARD' ? '카드망' : '증권망'}
                        </span>
                      </div>
                      <p className="text-xs text-red-700 line-clamp-2">
                        {truncateText(event.failReason || '오류 정보 없음', 40)}
                      </p>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="ml-2 flex-shrink-0"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-500 text-center py-4">
                  실패 이벤트가 없습니다
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  return (
    <ChartFilterProvider>
      <DashboardLayout>
        <DashboardContent />
      </DashboardLayout>
    </ChartFilterProvider>
  );
}
