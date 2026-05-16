import { createContext, useContext, useState, ReactNode } from 'react';

type ExecutionStatusFilter = 'COMPLETED' | 'PROCESSING' | 'PENDING' | 'FAILED' | null;

interface ChartFilterContextType {
  executionStatusFilter: ExecutionStatusFilter;
  setExecutionStatusFilter: (status: ExecutionStatusFilter) => void;
}

const ChartFilterContext = createContext<ChartFilterContextType | undefined>(undefined);

export function ChartFilterProvider({ children }: { children: ReactNode }) {
  const [executionStatusFilter, setExecutionStatusFilter] = useState<ExecutionStatusFilter>(null);

  return (
    <ChartFilterContext.Provider value={{ executionStatusFilter, setExecutionStatusFilter }}>
      {children}
    </ChartFilterContext.Provider>
  );
}

export function useChartFilter() {
  const context = useContext(ChartFilterContext);
  if (!context) {
    throw new Error('useChartFilter must be used within ChartFilterProvider');
  }
  return context;
}
