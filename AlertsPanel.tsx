import { Alert as AlertType } from '@/hooks/useAlerts';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AlertsPanelProps {
  alerts: AlertType[];
}

export const AlertsPanel = ({ alerts }: AlertsPanelProps) => {
  if (alerts.length === 0) {
    return null;
  }

  const getIcon = (type: AlertType['type']) => {
    switch (type) {
      case 'critical':
        return AlertCircle;
      case 'warning':
        return AlertTriangle;
      case 'info':
        return Info;
    }
  };

  const getVariant = (type: AlertType['type']) => {
    return type === 'critical' ? 'destructive' : 'default';
  };

  return (
    <div className="space-y-3">
      {alerts.map((alert) => {
        const Icon = getIcon(alert.type);
        return (
          <Alert 
            key={alert.id} 
            variant={getVariant(alert.type)}
            className={cn(
              alert.type === 'info' && 'border-success bg-success/10',
              alert.type === 'warning' && 'border-warning bg-warning/10'
            )}
          >
            <Icon className="h-4 w-4" />
            <AlertTitle>{alert.message}</AlertTitle>
            <AlertDescription className="text-sm">
              {alert.suggestion}
            </AlertDescription>
          </Alert>
        );
      })}
    </div>
  );
};
