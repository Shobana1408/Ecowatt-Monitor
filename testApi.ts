// Test utility for API integration
import { apiService } from '@/services/api';

export const testApiConnection = async () => {
  console.log('🧪 Testing API connection...');
  
  try {
    // Test 1: Get latest data
    console.log('📡 Testing GET /api/energy/latest...');
    const latestResponse = await apiService.getLatestEnergyData();
    console.log('✅ Latest data response:', latestResponse);
    
    // Test 2: Get all data
    console.log('📡 Testing GET /api/energy/all...');
    const allResponse = await apiService.getAllEnergyData();
    console.log('✅ All data response:', allResponse);
    
    // Test 3: Submit test data
    console.log('📡 Testing POST /api/energy...');
    const testData = {
      timestamp: new Date().toISOString(),
      solar: 45.5,
      wind: 23.2,
      consumption: 68.7,
    };
    const submitResponse = await apiService.submitEnergyData(testData);
    console.log('✅ Submit data response:', submitResponse);
    
    // Test 4: Get metrics
    console.log('📡 Testing POST /api/energy/metrics...');
    const metricsResponse = await apiService.getEnergyMetrics(testData);
    console.log('✅ Metrics response:', metricsResponse);
    
    console.log('🎉 All API tests completed successfully!');
    return true;
  } catch (error) {
    console.error('❌ API test failed:', error);
    return false;
  }
};

// Export for use in browser console or development
if (typeof window !== 'undefined') {
  (window as any).testApiConnection = testApiConnection;
}
