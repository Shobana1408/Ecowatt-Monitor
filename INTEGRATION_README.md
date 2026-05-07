# EcoWatt Monitor - Backend Integration

This document describes the integration between the React frontend and Java Spring Boot backend for the EcoWatt Monitor application.

## 🚀 Features Implemented

### ✅ 1. User Input Form
- **Manual Data Entry**: Users can submit solar, wind, and consumption data via a form
- **Timestamp Support**: Optional timestamp field (defaults to current time)
- **Form Validation**: Input validation with Zod schema
- **API Integration**: Sends data to `POST /api/energy`

### ✅ 2. Live Dashboard Updates
- **Real-time Data**: Fetches latest energy record using `GET /api/energy/latest`
- **Dynamic Updates**: Charts, tables, and metrics update when new data is submitted
- **Backend Calculations**: Displays total renewable, energy balance, and renewable percentage from backend
- **Auto-refresh**: Updates every 5 seconds

### ✅ 3. Historical Data
- **Complete History**: Fetches all records using `GET /api/energy/all`
- **Data Visualization**: Displays in tables and weekly/hourly charts
- **Daily Aggregation**: Automatically calculates daily statistics from historical data

### ✅ 4. CSV Upload
- **Batch Import**: Upload CSV files containing historical energy data
- **File Validation**: Validates CSV format before upload
- **Progress Feedback**: Shows upload progress and results
- **API Integration**: Sends to `POST /api/energy/upload`

### ✅ 5. Error Handling & Fallbacks
- **Graceful Degradation**: Falls back to simulated data if backend is unavailable
- **Error Notifications**: User-friendly error messages
- **Loading States**: Skeleton loaders during data fetching
- **Timeout Handling**: Request timeouts with proper error handling

### ✅ 6. Dashboard Enhancements
- **Real-time Updates**: Maintains 5-second refresh cycle
- **Auto-refresh**: Charts and tables refresh when new data is submitted
- **Responsive Design**: Preserves existing responsive layout
- **Theme Support**: Maintains eco-friendly color scheme and alerts

## 🛠️ Technical Implementation

### API Service Layer
- **Centralized API**: `src/services/api.ts` handles all backend communication
- **Type Safety**: Full TypeScript interfaces for all API responses
- **Error Handling**: Comprehensive error handling with fallbacks
- **Configuration**: Centralized API configuration in `src/config/api.ts`

### Data Hooks
- **useEnergyData**: Manages energy data fetching and state
- **useEnergyCalculations**: Handles metrics calculations with backend integration
- **Fallback Logic**: Seamless fallback to simulated data when backend is unavailable

### Components
- **EnergyInputForm**: User input form with validation and CSV upload
- **Enhanced Dashboard**: Updated with loading states and error handling
- **Real-time Updates**: Automatic refresh when new data is submitted

## 🔧 Backend API Requirements

The frontend expects the following Spring Boot endpoints:

### Energy Data Endpoints
```
POST /api/energy
- Body: { timestamp: string, solar: number, wind: number, consumption: number }
- Response: { id: number, timestamp: string, solar: number, wind: number, consumption: number }

GET /api/energy/latest
- Response: { id: number, timestamp: string, solar: number, wind: number, consumption: number }

GET /api/energy/all
- Response: [{ id: number, timestamp: string, solar: number, wind: number, consumption: number }]

POST /api/energy/upload
- Body: FormData with CSV file
- Response: { message: string, recordsProcessed: number }

POST /api/energy/metrics
- Body: { timestamp: string, solar: number, wind: number, consumption: number }
- Response: { totalRenewable: number, netBalance: number, renewablePercentage: number, efficiency: number, status: string }
```

## 🚀 Setup Instructions

### 1. Environment Configuration
Create a `.env` file in the project root:
```env
VITE_API_URL=http://localhost:8080
```

### 2. Start the Frontend
```bash
npm install
npm run dev
```

### 3. Backend Integration
- Ensure your Spring Boot backend is running on `http://localhost:8080`
- The frontend will automatically connect to the backend
- If backend is unavailable, the app will use simulated data

### 4. Testing the Integration
1. **Submit Data**: Use the "Add Data" button to submit energy readings
2. **Upload CSV**: Use the "Upload CSV" button to import historical data
3. **View Updates**: Watch the dashboard update in real-time
4. **Check Charts**: Verify that charts and tables reflect the new data

## 📊 CSV Format

For CSV uploads, use the following format:
```csv
timestamp,solar,wind,consumption
2024-01-01T10:00:00,50.5,25.3,75.2
2024-01-01T11:00:00,55.2,28.1,78.9
```

## 🔄 Data Flow

1. **User Input** → Form validation → API call → Backend storage
2. **Backend Response** → Frontend state update → Dashboard refresh
3. **Real-time Updates** → Periodic API calls → Live dashboard updates
4. **Error Handling** → Fallback to simulated data → User notification

## 🎯 Key Benefits

- **Seamless Integration**: Works with or without backend
- **Real-time Updates**: Live dashboard with 5-second refresh
- **User-Friendly**: Intuitive forms and error handling
- **Scalable**: Clean architecture for future enhancements
- **Type-Safe**: Full TypeScript support throughout

The integration is now complete and ready for production use with your Java Spring Boot backend!
