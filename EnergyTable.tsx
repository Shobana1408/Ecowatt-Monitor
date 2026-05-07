import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { DailyStats } from '@/hooks/useEnergyData';
import { Badge } from '@/components/ui/badge';

interface EnergyTableProps {
  data: DailyStats[];
}

export const EnergyTable = ({ data }: EnergyTableProps) => {
  const getPercentageBadge = (percentage: number) => {
    if (percentage >= 90) {
      return <Badge className="bg-success text-white">Excellent</Badge>;
    } else if (percentage >= 70) {
      return <Badge className="bg-primary">Good</Badge>;
    } else if (percentage >= 50) {
      return <Badge variant="outline" className="border-warning text-warning">Fair</Badge>;
    } else {
      return <Badge variant="destructive">Low</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Daily Energy Report</CardTitle>
        <CardDescription>Detailed breakdown of energy production and consumption</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Solar (kWh)</TableHead>
              <TableHead className="text-right">Wind (kWh)</TableHead>
              <TableHead className="text-right">Consumption (kWh)</TableHead>
              <TableHead className="text-right">Renewable %</TableHead>
              <TableHead className="text-right">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((day) => (
              <TableRow key={day.date}>
                <TableCell className="font-medium">
                  {new Date(day.date).toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </TableCell>
                <TableCell className="text-right text-solar font-semibold">
                  {day.totalSolar}
                </TableCell>
                <TableCell className="text-right text-wind font-semibold">
                  {day.totalWind}
                </TableCell>
                <TableCell className="text-right text-consumption font-semibold">
                  {day.totalConsumption}
                </TableCell>
                <TableCell className="text-right font-semibold">
                  {day.renewablePercentage}%
                </TableCell>
                <TableCell className="text-right">
                  {getPercentageBadge(day.renewablePercentage)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
