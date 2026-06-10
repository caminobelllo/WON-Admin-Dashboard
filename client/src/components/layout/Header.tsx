import { RefreshCw, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HeaderProps {
  onRefresh?: () => void;
  onDownloadCSV?: () => void;
}

export function Header({ onRefresh, onDownloadCSV }: HeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 h-16 z-10 flex items-center justify-between px-6 bg-white border-b border-slate-200">
      <div className="flex items-center gap-3">
        <span className="font-semibold text-slate-900">
          자동투자 관리자 대시보드
        </span>
      </div>

      <div className="flex items-center gap-2">
        {onRefresh && (
          <Button variant="outline" size="sm" className="gap-2" onClick={onRefresh}>
            <RefreshCw className="w-4 h-4" />
            <span>새로고침</span>
          </Button>
        )}
        {onDownloadCSV && (
          <Button variant="outline" size="sm" className="gap-2" onClick={onDownloadCSV}>
            <Download className="w-4 h-4" />
            <span>CSV 다운로드</span>
          </Button>
        )}
      </div>
    </header>
  );
}
