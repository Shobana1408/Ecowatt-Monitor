import { useState, useEffect, useCallback } from 'react';
import { EnergyData, EnergyMetrics } from '@/services/api';
import { apiService } from '@/services/api';

export const useEnergyCalculations = (data: EnergyData) => {
  const [metrics, setMetrics] = useState<EnergyMetrics>({
    totalRenewable: 0,
    netBalance: 0,
    renewablePercentage: 0,
    efficiency: 0,
    status: 'balanced',
  });
  const [isCalculating, setIsCalculating] = useState(false);

  // Calculate metrics locally as fallback
  const calculateLocalMetrics = useCallback((energyData: EnergyData): EnergyMetrics => {
    const totalRenewable = energyData.solar + energyData.wind;
    const netBalance = totalRenewable - energyData.consumption;
    const renewablePercentage = energyData.consumption > 0 
      ? Math.round((totalRenewable / energyData.consumption) * 100) 
      : 100;
    
    // Efficiency based on how well renewable generation matches consumption
    const efficiency = Math.min(100, renewablePercentage);
    
    const status: 'surplus' | 'balanced' | 'deficit' = 
      netBalance > 10 ? 'surplus' : 
      netBalance < -10 ? 'deficit' : 
      'balanced';

    return {
      totalRenewable,
      netBalance,
      renewablePercentage,
      efficiency,
      status,
    };
  }, []);

  // Fetch metrics from backend
  const fetchMetrics = useCallback(async (energyData: EnergyData) => {
    setIsCalculating(true);
    
    try {
      const response = await apiService.getEnergyMetrics(energyData);
      if (response.success && response.data) {
        setMetrics(response.data);
      } else {
        // Fallback to local calculation
        setMetrics(calculateLocalMetrics(energyData));
      }
    } catch (error) {
      console.error('Failed to fetch metrics from backend:', error);
      // Fallback to local calculation
      setMetrics(calculateLocalMetrics(energyData));
    } finally {
      setIsCalculating(false);
    }
  }, [calculateLocalMetrics]);

  // Update metrics when data changes
  useEffect(() => {
    if (data && (data.solar > 0 || data.wind > 0 || data.consumption > 0)) {
      fetchMetrics(data);
    } else {
      // Use local calculation for empty or zero data
      setMetrics(calculateLocalMetrics(data));
    }
  }, [data, fetchMetrics, calculateLocalMetrics]);

  return {
    ...metrics,
    isCalculating,
  };
};




