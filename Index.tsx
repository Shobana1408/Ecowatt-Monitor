import { Sun, Wind, Zap, Activity, TrendingUp, Battery, RefreshCw, AlertCircle, Download, FileDown, LogOut, User } from 'lucide-react';
import { EnergyCard } from '@/components/EnergyCard';
import { EnergyChart } from '@/components/EnergyChart';
import { DailyStatsChart } from '@/components/DailyStatsChart';
import { EnergyTable } from '@/components/EnergyTable';
import { AlertsPanel } from '@/components/AlertsPanel';
import { SettingsDialog } from '@/components/SettingsDialog';
import { EnergyInputForm } from '@/components/EnergyInputForm';
import { SummaryCard } from '@/components/SummaryCard';
import { useEnergyData } from '@/hooks/useEnergyData';
import { useEnergyCalculations } from '@/hooks/useEnergyCalculations';
import { useAlerts } from '@/hooks/useAlerts';
import { useUserSettings } from '@/hooks/useUserSettings';
import { useSummary } from '@/hooks/useSummary';
import { useAuth } from '@/contexts/AuthContext';
import { apiService } from '@/services/api';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const Index = () => {
  const { currentData, hourlyData, dailyStats, isLoading, error, refreshData } = useEnergyData();
  const metrics = useEnergyCalculations(currentData);
  const { settings, updateSettings } = useUserSettings();
  const alerts = useAlerts(metrics, settings);
  const { summary, isLoading: summaryLoading, refreshSummary } = useSummary();
  const { user, logout } = useAuth();

  const handleDataSubmitted = () => {
    // Refresh data when new data is submitted
    refreshData();
    refreshSummary();
  };

  const handleExportCSV = () => {
    if (hourlyData.length > 0) {
      apiService.exportToCSV(hourlyData);
    }
  };

  const handleExportJSON = () => {
    if (hourlyData.length > 0) {
      apiService.exportToJSON(hourlyData);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
                <Zap className="h-8 w-8 text-primary" />
                EcoWatt Monitor
              </h1>
              <p className="text-muted-foreground mt-1">
                Track renewable energy generation and household consumption
              </p>
            </div>
            <div className="flex items-center gap-3">
              {user && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <User className="h-4 w-4" />
                  <span>{user.username}</span>
                </div>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  refreshData();
                  refreshSummary();
                }}
                disabled={isLoading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" disabled={hourlyData.length === 0}>
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={handleExportCSV}>
                    <FileDown className="h-4 w-4 mr-2" />
                    Export as CSV
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleExportJSON}>
                    <FileDown className="h-4 w-4 mr-2" />
                    Export as JSON
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <EnergyInputForm onDataSubmitted={handleDataSubmitted} />
              <SettingsDialog settings={settings} onSettingsChange={updateSettings} />
              <Button
                variant="outline"
                size="sm"
                onClick={logout}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Error Alert */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error}. Using simulated data as fallback.
            </AlertDescription>
          </Alert>
        )}

        {/* Alerts Section */}
        {alerts.length > 0 && (
          <div className="mb-6">
            <AlertsPanel alerts={alerts} />
          </div>
        )}

        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {isLoading ? (
            <>
              <Skeleton className="h-32" />
              <Skeleton className="h-32" />
              <Skeleton className="h-32" />
            </>
          ) : (
            <>
              <EnergyCard
                title="Solar Generation"
                value={currentData.solar}
                unit="kW"
                icon={Sun}
                color="solar"
                description="Current solar power output"
              />
              <EnergyCard
                title="Wind Generation"
                value={currentData.wind}
                unit="kW"
                icon={Wind}
                color="wind"
                description="Current wind power output"
              />
              <EnergyCard
                title="Consumption"
                value={currentData.consumption}
                unit="kW"
                icon={Activity}
                color="consumption"
                description="Current household consumption"
              />
            </>
          )}
        </div>

        {/* Summary Card */}
        <div className="mb-8">
          <SummaryCard summary={summary} isLoading={summaryLoading} />
        </div>

        {/* Calculated Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {isLoading ? (
            <>
              <Skeleton className="h-32" />
              <Skeleton className="h-32" />
              <Skeleton className="h-32" />
            </>
          ) : (
            <>
              <EnergyCard
                title="Total Renewable"
                value={metrics.totalRenewable}
                unit="kW"
                icon={Battery}
                color="success"
                description="Combined solar and wind generation"
              />
              <EnergyCard
                title="Energy Balance"
                value={metrics.netBalance}
                unit="kW"
                icon={TrendingUp}
                color={metrics.status === 'surplus' ? 'success' : metrics.status === 'deficit' ? 'destructive' : 'primary'}
                description={metrics.status === 'surplus' ? 'Surplus energy' : metrics.status === 'deficit' ? 'Energy deficit' : 'Balanced'}
              />
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Renewable Percentage</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {metrics.renewablePercentage}
                    <span className="text-sm font-normal ml-1 text-muted-foreground">%</span>
                  </div>
                  <div className="mt-3 bg-secondary rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-primary h-full transition-all duration-500"
                      style={{ width: `${Math.min(100, metrics.renewablePercentage)}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    {metrics.renewablePercentage >= 90 ? 'Excellent sustainability!' :
                     metrics.renewablePercentage >= 70 ? 'Good renewable usage' :
                     metrics.renewablePercentage >= 50 ? 'Room for improvement' :
                     'Consider reducing consumption'}
                  </p>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* Charts and Data Tabs */}
        <Tabs defaultValue="hourly" className="space-y-6">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-3">
            <TabsTrigger value="hourly">Hourly</TabsTrigger>
            <TabsTrigger value="daily">Weekly</TabsTrigger>
            <TabsTrigger value="table">Data Table</TabsTrigger>
          </TabsList>

          <TabsContent value="hourly" className="space-y-6">
            <EnergyChart
              data={hourlyData}
              title="Hourly Energy Flow"
              description="Real-time tracking of energy generation and consumption over the past 24 hours"
            />
          </TabsContent>

          <TabsContent value="daily" className="space-y-6">
            <DailyStatsChart data={dailyStats} />
          </TabsContent>

          <TabsContent value="table">
            <EnergyTable data={dailyStats} />
          </TabsContent>
        </Tabs>

        {/* Info Card */}
        <Card className="mt-8 bg-primary/5 border-primary/20">
          <CardHeader>
            <CardTitle className="text-lg">Sustainability Goal</CardTitle>
            <CardDescription>
              This dashboard helps you understand and optimize your renewable energy usage.
              By tracking solar and wind power generation alongside your consumption patterns,
              you can make informed decisions to reduce dependency on non-renewable sources
              and contribute to global sustainability goals.
            </CardDescription>
          </CardHeader>
        </Card>
      </main>
    </div>
  );
};

export default Index;
