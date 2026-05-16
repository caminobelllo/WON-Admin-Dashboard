import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { getEventStatusChartData } from '@/lib/chartData';

export function EventStatusChart() {
  const data = getEventStatusChartData();

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm">
      <h3 className="font-semibold text-slate-900 mb-4">이벤트 발행 상태</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis 
            dataKey="name" 
            stroke="#9ca3af"
            tick={{ fontSize: 12 }}
          />
          <YAxis 
            stroke="#9ca3af"
            tick={{ fontSize: 12 }}
          />
          <Tooltip 
            formatter={(value) => `${value}건`}
            contentStyle={{
              backgroundColor: '#fff',
              border: '1px solid #e2e8f0',
              borderRadius: '0.5rem',
            }}
          />
          <Legend />
          <Bar dataKey="published" fill="#10b981" name="발행 완료" />
          <Bar dataKey="failed" fill="#ef4444" name="발행 실패" />
          <Bar dataKey="retrying" fill="#f59e0b" name="재시도중" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
