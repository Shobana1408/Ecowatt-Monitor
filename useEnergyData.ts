import { useState, useEffect, useCallback } from 'react';
import { apiService, EnergyData } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';

export interface DailyStats {
  date: string;
  totalSolar: number;
  totalWind: number;
  totalConsumption: number;
  renewablePercentage: number;
}

export const useEnergyData = () => {
  const [currentData, setCurrentData] = useState<EnergyData>({
    timestamp: new Date().toISOString(),
    solar: 0,
    wind: 0,
    consumption: 0,
  });

  const [hourlyData, setHourlyData] = useState<EnergyData[]>([]);
  const [dailyStats, setDailyStats] = useState<DailyStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  // Fallback simulated data generation
  const generateSimulatedData = useCallback(() => {
    const generateData = (): EnergyData => {
      const hour = new Date().getHours();
      // Solar peaks during day (8am-6pm)
      const solarFactor = hour >= 8 && hour <= 18 
        ? Math.sin(((hour - 8) / 10) * Math.PI) 
        : 0;
      
      // Wind is more random but generally stronger at night
      const windFactor = 0.5 + Math.random() * 0.5 + (hour < 8 || hour > 20 ? 0.3 : 0);
      
      // Consumption varies throughout day
      const consumptionFactor = hour >= 6 && hour <= 22 
        ? 0.6 + Math.random() * 0.4 
        : 0.3 + Math.random() * 0.3;

      return {
        timestamp: new Date().toISOString(),
        solar: Math.round(solarFactor * 80 + Math.random() * 20), // 0-100 kW
        wind: Math.round(windFactor * 60 + Math.random() * 20), // 0-80 kW
        consumption: Math.round(consumptionFactor * 100 + Math.random() * 30), // 0-130 kW
      };
    };

    // Initialize with 24 hours of historical data
    const initData: EnergyData[] = [];
    const now = new Date();
    for (let i = 23; i >= 0; i--) {
      const time = new Date(now.getTime() - i * 60 * 60 * 1000);
      const hour = time.getHours();
      const solarFactor = hour >= 8 && hour <= 18 
        ? Math.sin(((hour - 8) / 10) * Math.PI) 
        : 0;
      const windFactor = 0.5 + Math.random() * 0.5 + (hour < 8 || hour > 20 ? 0.3 : 0);
      const consumptionFactor = hour >= 6 && hour <= 22 
        ? 0.6 + Math.random() * 0.4 
        : 0.3 + Math.random() * 0.3;

      initData.push({
        timestamp: time.toISOString(),
        solar: Math.round(solarFactor * 80 + Math.random() * 20),
        wind: Math.round(windFactor * 60 + Math.random() * 20),
        consumption: Math.round(consumptionFactor * 100 + Math.random() * 30),
      });
    }
    setHourlyData(initData);
    setCurrentData(initData[initData.length - 1]);

    // Generate 7 days of daily stats
    const dailyData: DailyStats[] = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const totalSolar = Math.round(400 + Math.random() * 200);
      const totalWind = Math.round(350 + Math.random() * 150);
      const totalConsumption = Math.round(600 + Math.random() * 200);
      const totalRenewable = totalSolar + totalWind;
      
      dailyData.push({
        date: date.toISOString().split('T')[0],
        totalSolar,
        totalWind,
        totalConsumption,
        renewablePercentage: Math.round((totalRenewable / totalConsumption) * 100),
      });
    }
    setDailyStats(dailyData);
  }, []);

  // Fetch latest energy data from backend
  const fetchLatestData = useCallback(async () => {
    // Don't fetch if not authenticated
    if (!isAuthenticated) {
      return;
    }

    try {
      const response = await apiService.getLatestEnergyData();
      if (response.success && response.data) {
        setCurrentData(response.data);
        setError(null);
      } else {
        // Fallback to simulated data if backend is not available
        console.warn('Backend not available, using simulated data');
        generateSimulatedData();
      }
    } catch (err) {
      console.error('Failed to fetch latest data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load data');
      generateSimulatedData();
    }
  }, [isAuthenticated, generateSimulatedData]);

  // Fetch all historical data from backend
  const fetchAllData = useCallback(async () => {
    // Don't fetch if not authenticated
    if (!isAuthenticated) {
      setIsLoading(false);
      return;
    }

    try {
      const response = await apiService.getAllEnergyData();
      if (response.success && response.data) {
        const data = response.data;
        setHourlyData(data);
        
        // Generate daily stats from historical data
        const dailyStatsMap = new Map<string, DailyStats>();
        
        data.forEach(record => {
          const date = record.timestamp.split('T')[0];
          const existing = dailyStatsMap.get(date) || {
            date,
            totalSolar: 0,
            totalWind: 0,
            totalConsumption: 0,
            renewablePercentage: 0,
          };
          
          existing.totalSolar += record.solar;
          existing.totalWind += record.wind;
          existing.totalConsumption += record.consumption;
          dailyStatsMap.set(date, existing);
        });
        
        // Calculate renewable percentages and convert to array
        const dailyStatsArray = Array.from(dailyStatsMap.values())
          .map(stat => ({
            ...stat,
            renewablePercentage: stat.totalConsumption > 0 
              ? Math.round(((stat.totalSolar + stat.totalWind) / stat.totalConsumption) * 100)
              : 100,
          }))
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
          .slice(-7); // Keep only last 7 days
        
        setDailyStats(dailyStatsArray);
        setError(null);
      } else {
        // Fallback to simulated data
        generateSimulatedData();
      }
    } catch (err) {
      console.error('Failed to fetch historical data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load data');
      generateSimulatedData();
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, generateSimulatedData]);

  // Refresh data function for external calls
  const refreshData = useCallback(async () => {
    await Promise.all([fetchLatestData(), fetchAllData()]);
  }, [fetchLatestData, fetchAllData]);

  // Initial data load - wait for auth to finish loading
  useEffect(() => {
    if (!authLoading) {
      refreshData();
    }
  }, [refreshData, authLoading]);

  // Real-time updates every 5 seconds - only if authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    const interval = setInterval(() => {
      fetchLatestData();
    }, 5000);

    return () => clearInterval(interval);
  }, [fetchLatestData, isAuthenticated]);

  return {
    currentData,
    hourlyData,
    dailyStats,
    isLoading,
    error,
    refreshData,
  };
};
