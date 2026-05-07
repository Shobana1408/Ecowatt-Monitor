import { useState, useEffect } from 'react';
import { EnergyMetrics } from './useEnergyCalculations';

export interface Alert {
  id: string;
  type: 'info' | 'warning' | 'critical';
  message: string;
  suggestion: string;
  timestamp: Date;
}

export interface AlertSettings {
  deficitThreshold: number;
  lowRenewableThreshold: number;
  enableAlerts: boolean;
}

export const useAlerts = (metrics: EnergyMetrics, settings: AlertSettings) => {
  const [alerts, setAlerts] = useState<Alert[]>([]);

  useEffect(() => {
    if (!settings.enableAlerts) {
      setAlerts([]);
      return;
    }

    const newAlerts: Alert[] = [];

    // Check for energy deficit
    if (metrics.netBalance < -settings.deficitThreshold) {
      newAlerts.push({
        id: 'deficit-alert',
        type: 'critical',
        message: 'High energy deficit detected',
        suggestion: 'Consider reducing non-essential appliances or waiting for higher renewable generation periods.',
        timestamp: new Date(),
      });
    }

    // Check for low renewable percentage
    if (metrics.renewablePercentage < settings.lowRenewableThreshold) {
      newAlerts.push({
        id: 'low-renewable',
        type: 'warning',
        message: `Renewable energy at ${metrics.renewablePercentage}%`,
        suggestion: 'Try shifting high-consumption activities to peak solar/wind hours.',
        timestamp: new Date(),
      });
    }

    // Check for excellent renewable usage
    if (metrics.renewablePercentage >= 95 && metrics.status === 'surplus') {
      newAlerts.push({
        id: 'excellent',
        type: 'info',
        message: 'Excellent renewable energy usage!',
        suggestion: 'Great job! You have surplus clean energy. This is the best time for energy-intensive tasks.',
        timestamp: new Date(),
      });
    }

    setAlerts(newAlerts);
  }, [metrics, settings]);

  return alerts;
};
