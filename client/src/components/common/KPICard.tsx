interface KPICardProps {
  label: string;
  value: number | string;
  description?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
}

export function KPICard({ 
  label, 
  value, 
  description, 
  trend = 'neutral',
  trendValue 
}: KPICardProps) {
  return (
    <div className="kpi-card">
      <div className="kpi-card-label">{label}</div>
      <div className="kpi-card-value">{value}</div>
      {description && (
        <div className="text-xs text-slate-500 mt-1">{description}</div>
      )}
      {trendValue && (
        <div className={`text-xs mt-2 ${
          trend === 'up' ? 'text-red-600' : 
          trend === 'down' ? 'text-green-600' : 
          'text-slate-500'
        }`}>
          {trendValue}
        </div>
      )}
    </div>
  );
}
