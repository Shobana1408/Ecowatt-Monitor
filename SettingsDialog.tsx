import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Settings } from 'lucide-react';
import { AlertSettings } from '@/hooks/useAlerts';

interface SettingsDialogProps {
  settings: AlertSettings;
  onSettingsChange: (settings: Partial<AlertSettings>) => void;
}

export const SettingsDialog = ({ settings, onSettingsChange }: SettingsDialogProps) => {
  const [open, setOpen] = useState(false);
  const [localSettings, setLocalSettings] = useState(settings);

  const handleSave = () => {
    onSettingsChange(localSettings);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon">
          <Settings className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Alert Settings</DialogTitle>
          <DialogDescription>
            Customize your energy monitoring alerts and thresholds.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="enable-alerts" className="flex flex-col space-y-1">
              <span>Enable Alerts</span>
              <span className="text-xs text-muted-foreground font-normal">
                Receive notifications about energy usage
              </span>
            </Label>
            <Switch
              id="enable-alerts"
              checked={localSettings.enableAlerts}
              onCheckedChange={(checked) =>
                setLocalSettings({ ...localSettings, enableAlerts: checked })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="deficit-threshold">
              Deficit Threshold (kW)
            </Label>
            <Input
              id="deficit-threshold"
              type="number"
              value={localSettings.deficitThreshold}
              onChange={(e) =>
                setLocalSettings({
                  ...localSettings,
                  deficitThreshold: parseInt(e.target.value) || 0,
                })
              }
              min={0}
              max={100}
            />
            <p className="text-xs text-muted-foreground">
              Alert when consumption exceeds renewable generation by this amount
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="renewable-threshold">
              Low Renewable Threshold (%)
            </Label>
            <Input
              id="renewable-threshold"
              type="number"
              value={localSettings.lowRenewableThreshold}
              onChange={(e) =>
                setLocalSettings({
                  ...localSettings,
                  lowRenewableThreshold: parseInt(e.target.value) || 0,
                })
              }
              min={0}
              max={100}
            />
            <p className="text-xs text-muted-foreground">
              Alert when renewable percentage falls below this level
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>Save Changes</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
