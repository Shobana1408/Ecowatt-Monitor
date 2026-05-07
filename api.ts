// API service for communicating with Java Spring Boot backend
import { API_CONFIG, getApiUrl } from '@/config/api';

export interface EnergyData {
  id?: number;
  timestamp: string;
  solar: number;
  wind: number;
  consumption: number;
  userId?: number;
}

export interface EnergyMetrics {
  totalRenewable: number;
  netBalance: number;
  renewablePercentage: number;
  efficiency: number;
  status: 'surplus' | 'balanced' | 'deficit';
}

export interface SummaryData {
  totalSolar: number;
  totalWind: number;
  totalConsumption: number;
  avgRenewablePercentage: number;
  netBalance: number;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface AuthResponse {
  token: string;
  username: string;
  email: string;
  userId: number;
}

class ApiService {
  private baseUrl: string;
  private authToken: string | null = null;

  constructor() {
    this.baseUrl = API_CONFIG.BASE_URL;
  }

  setAuthToken(token: string | null) {
    this.authToken = token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = getApiUrl(endpoint);
    
    const defaultHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.authToken) {
      defaultHeaders['Authorization'] = `Bearer ${this.authToken}`;
    }

    const config: RequestInit = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    };

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);
      
      const response = await fetch(url, {
        ...config,
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          // Unauthorized or Forbidden - clear auth and redirect to login
          this.setAuthToken(null);
          localStorage.removeItem('auth_token');
          localStorage.removeItem('auth_user');
          if (window.location.pathname !== '/login') {
            window.location.href = '/login';
          }
        }
        // Try to get error message from response
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
          const errorText = await response.text();
          if (errorText) {
            errorMessage += ` - ${errorText}`;
          }
        } catch (e) {
          // Ignore if we can't read the response
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      return {
        data,
        success: true,
      };
    } catch (error) {
      console.error('API request failed:', error);
      return {
        data: null as T,
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // Submit new energy data
  async submitEnergyData(energyData: Omit<EnergyData, 'id'>): Promise<ApiResponse<EnergyData>> {
    // Backend only supports CSV upload; submit a single-row CSV via /api/upload
    const csvHeaders = 'solar_generation,wind_generation,consumption,timestamp\n';
    const csvRow = `${energyData.solar},${energyData.wind},${energyData.consumption},${energyData.timestamp}`;
    const csvContent = new Blob([csvHeaders + csvRow], { type: 'text/csv' });
    const file = new File([csvContent], 'single-entry.csv', { type: 'text/csv' });

    const formData = new FormData();
    formData.append('file', file);

    const url = getApiUrl(API_CONFIG.ENDPOINTS.UPLOAD_CSV);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);

      const headers: Record<string, string> = {};
      if (this.authToken) {
        headers['Authorization'] = `Bearer ${this.authToken}`;
      }
      // Don't set Content-Type for FormData - browser will set it with boundary

      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: formData,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          this.setAuthToken(null);
          localStorage.removeItem('auth_token');
          localStorage.removeItem('auth_user');
          if (window.location.pathname !== '/login') {
            window.location.href = '/login';
          }
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return {
        data: energyData as EnergyData,
        success: true,
        message: 'Submitted via CSV upload',
      };
    } catch (error) {
      console.error('Submit via CSV failed:', error);
      const errorMessage = error instanceof Error 
        ? (error.message.includes('fetch') ? 'Network error: Unable to connect to backend. Please check if backend is running on http://localhost:8081' : error.message)
        : 'Unknown error';
      return {
        data: energyData as EnergyData,
        success: false,
        message: errorMessage,
      };
    }
  }

  // Get latest energy record
  async getLatestEnergyData(): Promise<ApiResponse<EnergyData>> {
    const all = await this.getAllEnergyData();
    if (!all.success || !all.data || all.data.length === 0) {
      return { data: null as unknown as EnergyData, success: false, message: all.message || 'No data' };
    }
    const latest = [...all.data].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];
    return { data: latest, success: true };
  }

  // Get all historical energy records
  async getAllEnergyData(): Promise<ApiResponse<EnergyData[]>> {
    try {
      const res = await this.request<any[]>(API_CONFIG.ENDPOINTS.DATA_ALL);
      if (!res.success || !res.data) {
        return { data: [] as EnergyData[], success: false, message: res.message };
      }
      // Map backend entity fields to frontend EnergyData shape
      const mapped: EnergyData[] = res.data.map((row: any) => ({
        id: row.id,
        timestamp: row.timestamp,
        solar: row.solarGeneration,
        wind: row.windGeneration,
        consumption: row.consumption,
      }));
      return { data: mapped, success: true };
    } catch (error) {
      return {
        data: [] as EnergyData[],
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // Upload CSV file
  async uploadCSV(file: File): Promise<ApiResponse<{ message: string; recordsProcessed: number }>> {
    // Pre-count records from the provided CSV (lines excluding header and empty lines)
    let recordsCount = 0;
    try {
      const text = await file.text();
      const lines = text.split(/\r?\n/).filter(l => l.trim().length > 0);
      recordsCount = Math.max(0, lines.length - 1);
    } catch (_) {
      // ignore counting errors
    }

    const formData = new FormData();
    formData.append('file', file);

    const url = getApiUrl(API_CONFIG.ENDPOINTS.UPLOAD_CSV);
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);
      
      const headers: Record<string, string> = {};
      if (this.authToken) {
        headers['Authorization'] = `Bearer ${this.authToken}`;
      }
      
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: formData,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          this.setAuthToken(null);
          localStorage.removeItem('auth_token');
          localStorage.removeItem('auth_user');
          if (window.location.pathname !== '/login') {
            window.location.href = '/login';
          }
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Backend returns 202 Accepted with no body. Try to parse JSON; fallback to generic success.
      let data: any = null;
      try {
        data = await response.json();
      } catch (_) {
        // No content
      }
      return {
        data: data ?? { message: 'Upload accepted', recordsProcessed: recordsCount },
        success: true,
      };
    } catch (error) {
      console.error('CSV upload failed:', error);
      const errorMessage = error instanceof Error 
        ? (error.message.includes('fetch') ? 'Network error: Unable to connect to backend. Please check if backend is running on http://localhost:8081' : error.message)
        : 'Unknown error';
      return {
        data: { message: 'Upload failed', recordsProcessed: 0 },
        success: false,
        message: errorMessage,
      };
    }
  }

  // Get calculated metrics for a specific energy record
  async getEnergyMetrics(energyData: EnergyData): Promise<ApiResponse<EnergyMetrics>> {
    const totalRenewable = energyData.solar + energyData.wind;
    const netBalance = totalRenewable - energyData.consumption;
    const renewablePercentage = energyData.consumption > 0 ? (totalRenewable / energyData.consumption) * 100 : 0;
    const efficiency = renewablePercentage;
    const status: EnergyMetrics['status'] = netBalance > 0 ? 'surplus' : netBalance < 0 ? 'deficit' : 'balanced';
    return {
      data: {
        totalRenewable,
        netBalance,
        renewablePercentage: Math.round(renewablePercentage),
        efficiency: Math.round(efficiency),
        status,
      },
      success: true,
    };
  }

  // Get summary statistics from backend
  async getSummary(): Promise<ApiResponse<SummaryData>> {
    return this.request<SummaryData>(API_CONFIG.ENDPOINTS.SUMMARY);
  }

  // Export data as CSV
  exportToCSV(data: EnergyData[]): void {
    const headers = ['timestamp,solar,wind,consumption'];
    const rows = data.map(d => `${d.timestamp},${d.solar},${d.wind},${d.consumption}`);
    const csvContent = [headers[0], ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `energy-data-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // Export data as JSON
  exportToJSON(data: EnergyData[]): void {
    const jsonContent = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `energy-data-${new Date().toISOString().split('T')[0]}.json`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // Authentication methods
  async login(username: string, password: string): Promise<ApiResponse<AuthResponse>> {
    return this.request<AuthResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
  }

  async register(username: string, email: string, password: string): Promise<ApiResponse<AuthResponse>> {
    return this.request<AuthResponse>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, email, password }),
    });
  }
}

export const apiService = new ApiService();
