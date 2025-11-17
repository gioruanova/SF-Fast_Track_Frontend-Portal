"use client";

import { createContext, useContext, useState, ReactNode, useCallback, useMemo } from 'react';

interface DashboardContextType {
  refreshTrigger: number;
  refreshDashboard: () => void;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export function DashboardProvider({ children }: { children: ReactNode }) {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const refreshDashboard = useCallback(() => {
    setRefreshTrigger(prev => prev + 1);
  }, []);

const value = useMemo(() => ({
    refreshTrigger,
    refreshDashboard
  }), [refreshTrigger, refreshDashboard]);

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (context === undefined) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
}

