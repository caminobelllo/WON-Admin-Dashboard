import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { KPICard } from '@/components/common/KPICard';
import { StatusBadge } from '@/components/common/StatusBadge';
import { ChartFilterProvider, useChartFilter } from '@/contexts/ChartFilterContext';
import { ExecutionStatusChart } from '@/components/charts/ExecutionStatusChart';
import { EventStatusChart } from '@/components/charts/EventStatusChart';
import { adminApi, type InboxSummary, type OutboxSummary, type SweepSummary } from '@/lib/adminApi';
import type { EventStatusData, ExecutionStatusData } from '@/lib/chartData';
import type { InboxEvent, OutboxEvent, SweepRequest } from '@/lib/mockData';
import { truncateText } from '@/lib/formatters';
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';

function DashboardContent() {
  const { executionStatusFilter } = useChartFilter();
  const [kpis, setKpis] = useState({
    monthlySweepRequestCount: 0,
    monthlySweepCompletedCount: 0,
    monthlySweepFailedCount: 0,
    monthlyOutboxFailedCount: 0,
    monthlyInboxFailedCount: 0,
  });
  const [failedSweepRequests, setFailedSweepRequests] = useState<SweepRequest[]>([]);
  const [failedOutboxEvents, setFailedOutboxEvents] = useState<OutboxEvent[]>([]);
  const [failedInboxEvents, setFailedInboxEvents] = useState<InboxEvent[]>([]);
  const [sweepSummary, setSweepSummary] = useState<SweepSummary>({
    totalCount: 0,
    createdCount: 0,
    processingCount: 0,
    completedCount: 0,
    failedCount: 0,
  });
  const [outboxSummary, setOutboxSummary] = useState<OutboxSummary>({
    totalCount: 0,
    publishedCount: 0,
    failedCount: 0,
    retryingCount: 0,
    pendingCount: 0,
  });
  const [inboxSummary, setInboxSummary] = useState<InboxSummary>({
    totalCount: 0,
    processedCount: 0,
    failedCount: 0,
    processingCount: 0,
    receivedCount: 0,
  });

  useEffect(() => {
    adminApi.getDashboardSummary()
      .then((summary) => {
        setKpis(summary.kpis);
        setSweepSummary(summary.sweepSummary);
        setOutboxSummary(summary.outboxSummary);
        setInboxSummary(summary.inboxSummary);
        setFailedSweepRequests(summary.recentFailedSweepRequests);
        setFailedOutboxEvents(summary.recentFailedOutboxEvents);
        setFailedInboxEvents(summary.recentFailedInboxEvents);
      })
      .catch(() => {
        setKpis({
          monthlySweepRequestCount: 0,
          monthlySweepCompletedCount: 0,
          monthlySweepFailedCount: 0,
          monthlyOutboxFailedCount: 0,
          monthlyInboxFailedCount: 0,
        });
      });
  }, []);

  const visibleFailedSweepRequests = executionStatusFilter === 'FAILED' || !executionStatusFilter
    ? failedSweepRequests
    : [];
  const executionChartData: ExecutionStatusData[] = [
    { name: '완료', value: sweepSummary.completedCount, fill: '#10b981' },
    { name: '처리중', value: sweepSummary.processingCount, fill: '#3b82f6' },
    { name: '대기', value: sweepSummary.createdCount, fill: '#9ca3af' },
    { name: '실패', value: sweepSummary.failedCount, fill: '#ef4444' },
  ];
  const eventChartData: EventStatusData[] = [
    {
      name: 'Outbox',
      published: outboxSummary.publishedCount,
      failed: outboxSummary.failedCount,
      retrying: outboxSummary.retryingCount,
    },
    {
      name: 'Inbox',
      published: inboxSummary.processedCount,
      failed: inboxSummary.failedCount,
      retrying: inboxSummary.processingCount,
    },
  ];

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
            label="이번달 투자 전환 요청" 
            value={kpis.monthlySweepRequestCount}
          />
          <KPICard 
            label="이번달 자동투자 완료" 
            value={kpis.monthlySweepCompletedCount}
          />
          <KPICard 
            label="이번달 실패 건수" 
            value={kpis.monthlySweepFailedCount}
          />
          <KPICard 
            label="Outbox 발행 실패" 
            value={kpis.monthlyOutboxFailedCount}
          />
          <KPICard 
            label="Inbox 처리 실패" 
            value={kpis.monthlyInboxFailedCount}
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-2 gap-6">
          <ExecutionStatusChart data={executionChartData} />
          <EventStatusChart data={eventChartData} />
        </div>

        {/* Recent Failures Section */}
        <div className="grid grid-cols-3 gap-6">
          {/* Recent Failed Executions */}
          <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm">
            <h3 className="font-semibold text-slate-900 mb-4">
              최근 실패 자동투자
            </h3>
            <div className="space-y-3">
              {visibleFailedSweepRequests.length > 0 ? (
                visibleFailedSweepRequests.map((execution) => (
                  <div 
                    key={execution.sweepRequestId}
                    className="flex items-start justify-between p-3 bg-red-50 rounded-lg border border-red-100"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <StatusBadge status={execution.requestStatus} />
                        <span className="text-xs text-slate-600 font-mono">
                          {execution.sweepRequestId.substring(0, 8)}...
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
