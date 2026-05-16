import { useLocation } from 'wouter';
import { 
  LayoutDashboard, 
  ArrowRightLeft, 
  TrendingUp, 
  RotateCcw, 
  Send, 
  Inbox, 
  AlertCircle,
  Settings
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface NavItem {
  id: string;
  label: string;
  path: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  {
    id: 'dashboard',
    label: '대시보드 홈',
    path: '/',
    icon: <LayoutDashboard className="w-5 h-5" />,
  },
  {
    id: 'sweep-requests',
    label: '투자 전환 요청',
    path: '/sweep-requests',
    icon: <ArrowRightLeft className="w-5 h-5" />,
  },
  {
    id: 'executions',
    label: '자동투자 실행 현황',
    path: '/executions',
    icon: <TrendingUp className="w-5 h-5" />,
  },
  {
    id: 'retry-management',
    label: '자동투자 재처리',
    path: '/retry-management',
    icon: <RotateCcw className="w-5 h-5" />,
  },
  {
    id: 'outbox-events',
    label: 'Outbox 이벤트',
    path: '/outbox-events',
    icon: <Send className="w-5 h-5" />,
  },
  {
    id: 'inbox-events',
    label: 'Inbox 이벤트',
    path: '/inbox-events',
    icon: <Inbox className="w-5 h-5" />,
  },
  {
    id: 'error-logs',
    label: '오류 로그',
    path: '/error-logs',
    icon: <AlertCircle className="w-5 h-5" />,
  },
  {
    id: 'settings',
    label: '시스템 설정',
    path: '/settings',
    icon: <Settings className="w-5 h-5" />,
  },
];

export function Sidebar() {
  const [location] = useLocation();

  return (
    <aside className="fixed left-0 top-16 bottom-0 w-60 bg-white border-r border-slate-200 overflow-y-auto">
      <nav className="p-4 space-y-2">
        {navItems.map((item) => {
          const isActive = location === item.path;
          return (
            <Button
              key={item.id}
              variant={isActive ? 'default' : 'ghost'}
              className="w-full justify-start gap-3 text-sm"
              asChild
            >
              <a href={item.path}>
                {item.icon}
                <span>{item.label}</span>
              </a>
            </Button>
          );
        })}
      </nav>
    </aside>
  );
}
