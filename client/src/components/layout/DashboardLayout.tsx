import { ReactNode } from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';

interface DashboardLayoutProps {
  children: ReactNode;
  onRefresh?: () => void;
  onDownloadCSV?: () => void;
}

export function DashboardLayout({ 
  children, 
  onRefresh, 
  onDownloadCSV 
}: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-slate-50">
      <Header onRefresh={onRefresh} onDownloadCSV={onDownloadCSV} />
      <Sidebar />
      
      {/* Main Content */}
      <main className="ml-60 mt-16 p-6">
        {children}
      </main>
    </div>
  );
}
