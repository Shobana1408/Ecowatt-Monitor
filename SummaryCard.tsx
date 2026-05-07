import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SummaryData } from '@/services/api';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface SummaryCardProps {
  summary: SummaryData | null;
  isLoading?: boolean;
}

export const SummaryCard = ({ summary, isLoading }: SummaryCardProps) => {
  if (isLoading || !summary) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Overall Summary</CardTitle>
          <CardDescription>Loading summary statistics...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="h-4 bg-muted animate-pulse rounded" />
            <div className="h-4 bg-muted animate-pulse rounded" />
            <div className="h-4 bg-muted animate-pulse rounded" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalRenewable = summary.totalSolar + summary.totalWind;
  const netBalanceStatus = summary.netBalance > 0 ? 'surplus' : summary.netBalance < 0 ? 'deficit' : 'balanced';

  return (
    <Card>
      <CardHeader>
        <CardTitle>Overall Summary</CardTitle>
        <CardDescription>Aggregated statistics across all recorded data</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Total Solar Generated</p>
            <p className="text-2xl font-bold text-solar">{summary.totalSolar.toFixed(1)} kWh</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Total Wind Generated</p>
            <p className="text-2xl font-bold text-wind">{summary.totalWind.toFixed(1)} kWh</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Total Consumption</p>
            <p className="text-2xl font-bold text-consumption">{summary.totalConsumption.toFixed(1)} kWh</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Total Renewable</p>
            <p className="text-2xl font-bold text-primary">{totalRenewable.toFixed(1)} kWh</p>
          </div>
        </div>

        <div className="pt-4 border-t">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-muted-foreground">Average Renewable %</p>
            <Badge variant={summary.avgRenewablePercentage >= 70 ? 'default' : 'secondary'}>
              {summary.avgRenewablePercentage.toFixed(1)}%
            </Badge>
          </div>
          <div className="w-full bg-secondary rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all"
              style={{ width: `${Math.min(100, summary.avgRenewablePercentage)}%` }}
            />
          </div>
        </div>

        <div className="pt-4 border-t">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Net Energy Balance</p>
            <div className="flex items-center gap-2">
              {netBalanceStatus === 'surplus' && <TrendingUp className="h-4 w-4 text-success" />}
              {netBalanceStatus === 'deficit' && <TrendingDown className="h-4 w-4 text-destructive" />}
              {netBalanceStatus === 'balanced' && <Minus className="h-4 w-4 text-muted-foreground" />}
              <span
                className={`text-lg font-bold ${
                  netBalanceStatus === 'surplus'
                    ? 'text-success'
                    : netBalanceStatus === 'deficit'
                    ? 'text-destructive'
                    : 'text-muted-foreground'
                }`}
              >
                {summary.netBalance > 0 ? '+' : ''}
                {summary.netBalance.toFixed(1)} kWh
              </span>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {netBalanceStatus === 'surplus'
              ? 'You have a surplus of renewable energy'
              : netBalanceStatus === 'deficit'
              ? 'Consumption exceeds renewable generation'
              : 'Renewable generation matches consumption'}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

