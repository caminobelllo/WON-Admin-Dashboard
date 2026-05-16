import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { getFailureTimelineChartData } from '@/lib/chartData';

export function FailureTimelineChart() {
  const data = getFailureTimelineChartData();

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm">
      <h3 className="font-semibold text-slate-900 mb-4">시간대별 실패 건수 (최근 24시간)</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis 
            dataKey="time" 
            stroke="#9ca3af"
            tick={{ fontSize: 12 }}
            interval={Math.floor(data.length / 6)}
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
          <Line 
            type="monotone" 
            dataKey="failures" 
            stroke="#ef4444" 
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
            name="실패 건수"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
