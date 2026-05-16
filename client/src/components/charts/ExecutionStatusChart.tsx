import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { getExecutionStatusChartData } from '@/lib/chartData';
import { useChartFilter } from '@/contexts/ChartFilterContext';
import { mapChartStatusToExecutionStatus } from '@/lib/statusMapping';

export function ExecutionStatusChart() {
  const data = getExecutionStatusChartData();
  const { executionStatusFilter, setExecutionStatusFilter } = useChartFilter();

  const handlePieClick = (entry: typeof data[0]) => {
    const executionStatus = mapChartStatusToExecutionStatus(entry.name);
    
    // 같은 상태를 다시 클릭하면 필터 해제
    if (executionStatusFilter === executionStatus) {
      setExecutionStatusFilter(null);
    } else {
      setExecutionStatusFilter(executionStatus as any);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm">
      <h3 className="font-semibold text-slate-900 mb-4">자동투자 처리 상태</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={2}
            dataKey="value"
            onClick={(entry) => handlePieClick(entry)}
            style={{ cursor: 'pointer' }}
          >
            {data.map((entry, index) => {
              const executionStatus = mapChartStatusToExecutionStatus(entry.name);
              const isActive = executionStatusFilter === executionStatus;
              
              return (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.fill}
                  opacity={isActive ? 1 : 0.7}
                  style={{
                    filter: isActive ? 'drop-shadow(0 0 8px rgba(0, 0, 0, 0.2))' : 'none',
                    transition: 'all 0.2s ease',
                  }}
                />
              );
            })}
          </Pie>
          <Tooltip 
            formatter={(value) => `${value}건`}
            contentStyle={{
              backgroundColor: '#fff',
              border: '1px solid #e2e8f0',
              borderRadius: '0.5rem',
            }}
          />
        </PieChart>
      </ResponsiveContainer>
      
      {/* Custom Legend with Click Indicator */}
      <div className="flex justify-center gap-6 mt-4 text-sm flex-wrap">
        {data.map((item, index) => {
          const executionStatus = mapChartStatusToExecutionStatus(item.name);
          const isActive = executionStatusFilter === executionStatus;
          
          return (
            <button
              key={index}
              onClick={() => handlePieClick(item)}
              className={`flex items-center gap-2 px-2 py-1 rounded transition-colors ${
                isActive 
                  ? 'bg-slate-100 ring-2 ring-slate-400' 
                  : 'hover:bg-slate-50'
              }`}
            >
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: item.fill }}
              />
              <span className={`${isActive ? 'font-semibold text-slate-900' : 'text-slate-700'}`}>
                {item.name} ({item.value}건)
              </span>
            </button>
          );
        })}
      </div>
      
      {executionStatusFilter && (
        <div className="mt-3 text-xs text-slate-600 text-center">
          💡 선택된 상태로 필터링 중입니다. 다시 클릭하면 해제됩니다.
        </div>
      )}
    </div>
  );
}
