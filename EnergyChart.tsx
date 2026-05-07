import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { EnergyData } from '@/hooks/useEnergyData';

interface EnergyChartProps {
  data: EnergyData[];
  title: string;
  description?: string;
}

export const EnergyChart = ({ data, title, description }: EnergyChartProps) => {
  const chartData = data.map(d => ({
    time: new Date(d.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    Solar: d.solar,
    Wind: d.wind,
    Consumption: d.consumption,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="solarGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--solar))" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="hsl(var(--solar))" stopOpacity={0.1}/>
              </linearGradient>
              <linearGradient id="windGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--wind))" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="hsl(var(--wind))" stopOpacity={0.1}/>
              </linearGradient>
              <linearGradient id="consumptionGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--consumption))" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="hsl(var(--consumption))" stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis 
              dataKey="time" 
              className="text-xs"
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
            />
            <YAxis 
              className="text-xs"
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
              label={{ value: 'kW', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px'
              }}
            />
            <Legend />
            <Area 
              type="monotone" 
              dataKey="Solar" 
              stroke="hsl(var(--solar))" 
              fill="url(#solarGradient)"
              strokeWidth={2}
            />
            <Area 
              type="monotone" 
              dataKey="Wind" 
              stroke="hsl(var(--wind))" 
              fill="url(#windGradient)"
              strokeWidth={2}
            />
            <Area 
              type="monotone" 
              dataKey="Consumption" 
              stroke="hsl(var(--consumption))" 
              fill="url(#consumptionGradient)"
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
