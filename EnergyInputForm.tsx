import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Upload, FileText } from 'lucide-react';
import { apiService, EnergyData } from '@/services/api';
import { useToast } from '@/hooks/use-toast';

const energyFormSchema = z.object({
  solar: z.number().min(0, 'Solar generation must be non-negative').max(1000, 'Solar generation seems too high'),
  wind: z.number().min(0, 'Wind generation must be non-negative').max(1000, 'Wind generation seems too high'),
  consumption: z.number().min(0, 'Consumption must be non-negative').max(1000, 'Consumption seems too high'),
  timestamp: z.string().optional(),
});

type EnergyFormData = z.infer<typeof energyFormSchema>;

interface EnergyInputFormProps {
  onDataSubmitted?: (data: EnergyData) => void;
}

export const EnergyInputForm = ({ onDataSubmitted }: EnergyInputFormProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const form = useForm<EnergyFormData>({
    resolver: zodResolver(energyFormSchema),
    defaultValues: {
      solar: 0,
      wind: 0,
      consumption: 0,
      timestamp: new Date().toISOString().slice(0, 16), // YYYY-MM-DDTHH:MM format
    },
  });

  const onSubmit = async (data: EnergyFormData) => {
    setIsSubmitting(true);
    
    try {
      const energyData: Omit<EnergyData, 'id'> = {
        solar: data.solar,
        wind: data.wind,
        consumption: data.consumption,
        timestamp: data.timestamp || new Date().toISOString(),
      };

      const response = await apiService.submitEnergyData(energyData);
      
      if (response.success) {
        toast({
          title: "Success!",
          description: "Energy data submitted successfully.",
        });
        
        form.reset();
        setIsOpen(false);
        onDataSubmitted?.(response.data);
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to submit energy data.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCsvUpload = async () => {
    if (!csvFile) return;
    setIsUploading(true);
    try {
      // Read original file text
      const text = await csvFile.text();
      const lines = text.split(/\r?\n/).filter(l => l.trim().length > 0);
      if (lines.length === 0) {
        toast({ title: "Invalid CSV", description: "The selected file is empty.", variant: "destructive" });
        return;
      }
      const header = lines[0].trim();
      const v2Header = 'timestamp,solar,wind,consumption';
      const v1Header = 'solar_generation,wind_generation,consumption,timestamp';

      let uploadFile: File = csvFile;
      if (header === v2Header) {
        // Transform to backend-required header and column order
        const dataRows = lines.slice(1);
        const transformedRows = dataRows.map(row => {
          const parts = row.split(',');
          const [timestamp, solar, wind, consumption] = parts;
          return `${solar},${wind},${consumption},${timestamp}`;
        });
        const transformed = [v1Header, ...transformedRows].join('\n');
        const blob = new Blob([transformed], { type: 'text/csv' });
        uploadFile = new File([blob], csvFile.name.replace(/\.csv$/i, '') + '.transformed.csv', { type: 'text/csv' });
      }

      const response = await apiService.uploadCSV(uploadFile);

      if (response.success) {
        toast({
          title: "CSV Uploaded!",
          description: `Successfully processed ${response.data.recordsProcessed} records.`,
        });
        setCsvFile(null);
        onDataSubmitted?.({} as EnergyData); // Trigger refresh
      } else {
        toast({
          title: "Upload Failed",
          description: response.message || "Failed to upload CSV file.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Upload Error",
        description: "An unexpected error occurred during upload.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'text/csv') {
      setCsvFile(file);
    } else {
      toast({
        title: "Invalid File",
        description: "Please select a valid CSV file.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex gap-2">
      {/* Manual Data Entry */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Data
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Submit Energy Data</DialogTitle>
            <DialogDescription>
              Enter your current solar generation, wind generation, and consumption values.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="solar"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Solar Generation (kW)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.1"
                        placeholder="0.0"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormDescription>
                      Current solar power output
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="wind"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Wind Generation (kW)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.1"
                        placeholder="0.0"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormDescription>
                      Current wind power output
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="consumption"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Consumption (kW)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.1"
                        placeholder="0.0"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormDescription>
                      Current household energy consumption
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="timestamp"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Timestamp (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        type="datetime-local"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Leave empty to use current time
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Submitting..." : "Submit Data"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* CSV Upload */}
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline">
            <Upload className="h-4 w-4 mr-2" />
            Upload CSV
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Upload Historical Data</DialogTitle>
            <DialogDescription>
              Upload a CSV file containing historical energy data. Accepted headers:
              <br />
              - timestamp,solar,wind,consumption
              <br />
              - solar_generation,wind_generation,consumption,timestamp
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Input
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="flex-1"
              />
            </div>
            
            {csvFile && (
              <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                <FileText className="h-4 w-4" />
                <span className="text-sm">{csvFile.name}</span>
                <span className="text-xs text-muted-foreground">
                  ({(csvFile.size / 1024).toFixed(1)} KB)
                </span>
              </div>
            )}
            
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setCsvFile(null)}
                disabled={!csvFile}
              >
                Clear
              </Button>
              <Button
                onClick={handleCsvUpload}
                disabled={!csvFile || isUploading}
              >
                {isUploading ? "Uploading..." : "Upload CSV"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
