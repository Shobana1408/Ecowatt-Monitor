import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { DailyStats } from '@/hooks/useEnergyData';

interface DailyStatsChartProps {
  data: DailyStats[];
}

export const DailyStatsChart = ({ data }: DailyStatsChartProps) => {
  const chartData = data.map(d => ({
    date: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    Solar: d.totalSolar,
    Wind: d.totalWind,
    Consumption: d.totalConsumption,
    'Renewable %': d.renewablePercentage,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Weekly Energy Overview</CardTitle>
        <CardDescription>Daily totals for the past 7 days (kWh)</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis 
              dataKey="date" 
              className="text-xs"
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
            />
            <YAxis 
              className="text-xs"
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
              label={{ value: 'kWh', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px'
              }}
            />
            <Legend />
            <Bar dataKey="Solar" fill="hsl(var(--solar))" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Wind" fill="hsl(var(--wind))" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Consumption" fill="hsl(var(--consumption))" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
