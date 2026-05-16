import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function Settings() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">시스템 설정</h2>
          <p className="text-sm text-slate-600 mt-1">
            시스템 설정을 관리합니다.
          </p>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-8 text-center">
          <p className="text-slate-600">이 페이지는 준비 중입니다.</p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={() => toast.info('준비 중인 기능입니다')}
          >
            알림
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
