// Manufacturer Service - Handles manufacturer-related API calls
// Endpoints documented in /docs/api-endpoints.md
//
// API ENDPOINTS USED:
// 
// 1. GET /api/v1/manufacturers
//    - Description: Get all manufacturers, optionally filtered by userId
//    - Query params: userId (optional) - Filter manufacturers by user UUID
//    - Headers: Authorization: Bearer {token}
//    - Response: Array of manufacturer objects
// 
// 2. POST /api/v1/manufacturers
//    - Description: Create a new manufacturer
//    - Headers: Authorization: Bearer {token}, Content-Type: application/json
//    - Body: { userId, name, address_Street, address_City, address_Country, address_State, address_Zip }
//    - Response: Created manufacturer object with id, timestamps
// 
// 3. GET /api/v1/manufacturers/{id}
//    - Description: Get specific manufacturer details
//    - Path params: id (required) - Manufacturer UUID
//    - Headers: Authorization: Bearer {token}
//    - Response: Single manufacturer object

const API_BASE_URL = '/api/v1';

// Debug logging for service initialization
console.log('🏭 ManufacturerService initialized with API_BASE_URL:', API_BASE_URL);
console.log('🌐 Current window.location.origin:', window.location.origin);

class ManufacturerService {
  /**
   * Fetch all available manufacturers, optionally filtered by userId
   * Endpoint: GET /api/v1/manufacturers OR GET /api/v1/manufacturers/users/{userId}
   * Used for: Manufacturer selection dropdown in cart
   * 
   * Response Schema:
   * {
   *   id: "manufacturer-uuid-string",
   *   userId: "uuid-string", 
   *   name: "Manufacturer Name",
   *   address_Street: "123 Factory St",
   *   address_City: "Los Angeles",
   *   address_State: "CA",
   *   address_Country: "USA",
   *   address_Zip: "90210",
   *   createdAt: "2025-07-07T01:14:55.624Z",
   *   updatedAt: "2025-07-07T01:14:55.625Z"
   * }
   */
  async getAllManufacturers(userId = null) {
    console.log('🏭 ManufacturerService.getAllManufacturers() called with userId:', userId);
    
    try {
      // Use the new dedicated endpoint for user-specific manufacturers if userId is provided
      let url;
      if (userId) {
        url = new URL(`${API_BASE_URL}/manufacturers/users/${userId}`, window.location.origin);
        console.log('🔍 Using user-specific endpoint for userId:', userId);
      } else {
        url = new URL(`${API_BASE_URL}/manufacturers`, window.location.origin);
        console.log('� Using general manufacturers endpoint');
      }

      console.log('📡 Making request to:', url.toString());
      console.log('🔐 Using token:', localStorage.getItem('token') ? 'Present' : 'Missing');

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('📊 Response status:', response.status, response.statusText);
      console.log('📋 Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ API Error Response:', errorData);
        throw new Error(errorData.detail || errorData.message || `HTTP ${response.status}: Failed to fetch manufacturers`);
      }

      const manufacturers = await response.json();
      console.log('✅ Raw manufacturers data:', manufacturers);
      console.log('📈 Number of manufacturers received:', Array.isArray(manufacturers) ? manufacturers.length : 'Not an array');

      if (!Array.isArray(manufacturers)) {
        console.error('❌ Expected array but received:', typeof manufacturers, manufacturers);
        throw new Error('API returned invalid data format - expected array of manufacturers');
      }

      // Validate and enhance manufacturer data
      const enhancedManufacturers = manufacturers.map((manufacturer, index) => {
        console.log(`🔧 Processing manufacturer ${index + 1}:`, manufacturer);
        
        const enhanced = {
          ...manufacturer,
          // Ensure required fields have fallback values for UI compatibility
          averageProductionTime: manufacturer.averageProductionTime || 7,
          qualityRating: manufacturer.qualityRating || 0,
          specialties: manufacturer.specialties || [],
          // Add computed fields for better UX
          displayLocation: this.formatManufacturerLocation(manufacturer),
          estimatedDeliveryRange: this.calculateDeliveryRange(manufacturer)
        };

        console.log(`✨ Enhanced manufacturer ${index + 1}:`, enhanced);
        return enhanced;
      });

      console.log('🎉 Successfully processed all manufacturers:', enhancedManufacturers.length);
      return enhancedManufacturers;

    } catch (error) {
      console.error('💥 Error in getAllManufacturers:', error);
      console.error('📍 Error stack:', error.stack);
      console.error('🔍 Error details:', {
        name: error.name,
        message: error.message,
        cause: error.cause
      });
      throw new Error(`Failed to load manufacturers: ${error.message}`);
    }
  }

  /**
   * Get specific manufacturer details
   * Endpoint: GET /api/v1/manufacturers/{manufacturerId}
   * Used for: Displaying manufacturer info in cart/order
   */
  async getManufacturerById(manufacturerId) {
    console.log('🏭 ManufacturerService.getManufacturerById() called with ID:', manufacturerId);
    
    if (!manufacturerId) {
      console.error('❌ No manufacturer ID provided');
      throw new Error('Manufacturer ID is required');
    }

    try {
      const url = `${API_BASE_URL}/manufacturers/${manufacturerId}`;
      console.log('📡 Making request to:', url);
      console.log('🔐 Using token:', localStorage.getItem('token') ? 'Present' : 'Missing');

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('📊 Response status:', response.status, response.statusText);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ API Error Response:', errorData);
        throw new Error(errorData.detail || `HTTP ${response.status}: Failed to fetch manufacturer`);
      }

      const manufacturer = await response.json();
      console.log('✅ Raw manufacturer data:', manufacturer);
      
      // Enhance manufacturer data
      const enhanced = {
        ...manufacturer,
        averageProductionTime: manufacturer.averageProductionTime || 7,
        qualityRating: manufacturer.qualityRating || 0,
        specialties: manufacturer.specialties || [],
        displayLocation: this.formatManufacturerLocation(manufacturer),
        estimatedDeliveryRange: this.calculateDeliveryRange(manufacturer)
      };

      console.log('✨ Enhanced manufacturer data:', enhanced);
      return enhanced;
    } catch (error) {
      console.error('💥 Error in getManufacturerById:', error);
      console.error('📍 Error stack:', error.stack);
      throw new Error(`Failed to load manufacturer details: ${error.message}`);
    }
  }

  /**
   * Create a new manufacturer
   * Endpoint: POST /api/v1/manufacturers
   * Used for: Manufacturer registration
   */
  async createManufacturer(manufacturerData) {
    try {
      // Validate required fields
      const requiredFields = ['name', 'userId', 'address_Street', 'address_City', 'address_Country'];
      for (const field of requiredFields) {
        if (!manufacturerData[field]) {
          throw new Error(`${field} is required`);
        }
      }

      const response = await fetch(`${API_BASE_URL}/manufacturers`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(manufacturerData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `HTTP ${response.status}: Failed to create manufacturer`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating manufacturer:', error);
      throw new Error(`Failed to create manufacturer: ${error.message}`);
    }
  }

  /**
   * Update manufacturer information
   * Endpoint: PATCH /api/v1/manufacturers/{manufacturerId}
   * Used for: Manufacturer profile updates
   */
  async updateManufacturer(manufacturerId, updateData) {
    if (!manufacturerId) {
      throw new Error('Manufacturer ID is required');
    }

    try {
      const response = await fetch(`${API_BASE_URL}/manufacturers/${manufacturerId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `HTTP ${response.status}: Failed to update manufacturer`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating manufacturer:', error);
      throw new Error(`Failed to update manufacturer: ${error.message}`);
    }
  }

  /**
   * Delete a manufacturer
   * Endpoint: DELETE /api/v1/manufacturers/{manufacturerId}
   * Used for: Manufacturer account deletion
   */
  async deleteManufacturer(manufacturerId) {
    if (!manufacturerId) {
      throw new Error('Manufacturer ID is required');
    }

    try {
      const response = await fetch(`${API_BASE_URL}/manufacturers/${manufacturerId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `HTTP ${response.status}: Failed to delete manufacturer`);
      }

      return true;
    } catch (error) {
      console.error('Error deleting manufacturer:', error);
      throw new Error(`Failed to delete manufacturer: ${error.message}`);
    }
  }

  /**
   * Helper method to format manufacturer location for display
   */
  formatManufacturerLocation(manufacturer) {
    const parts = [
      manufacturer.address_City,
      manufacturer.address_State,
      manufacturer.address_Country
    ].filter(Boolean);
    return parts.join(', ') || 'Location not specified';
  }

  /**
   * Helper method to calculate delivery time range
   */
  calculateDeliveryRange(manufacturer) {
    const baseTime = manufacturer.averageProductionTime || 7;
    const shippingTime = 7; // Standard shipping time
    return {
      min: baseTime,
      max: baseTime + shippingTime,
      display: `${baseTime}-${baseTime + shippingTime} days`
    };
  }

  /**
   * Get manufacturers by location/region
   * Endpoint: GET /api/v1/manufacturers?country={country}&state={state}
   * Used for: Location-based manufacturer filtering
   */
  async getManufacturersByLocation(country, state = null) {
    try {
      const queryParams = new URLSearchParams();
      if (country) queryParams.append('country', country);
      if (state) queryParams.append('state', state);

      const response = await fetch(`${API_BASE_URL}/manufacturers?${queryParams.toString()}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `HTTP ${response.status}: Failed to fetch manufacturers by location`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching manufacturers by location:', error);
      throw new Error(`Failed to load manufacturers by location: ${error.message}`);
    }
  }

  /**
   * Get manufacturers by specialties
   * Endpoint: GET /api/v1/manufacturers?specialty={specialty}
   * Used for: Product-type specific manufacturer filtering
   */
  async getManufacturersBySpecialty(specialty) {
    try {
      const response = await fetch(`${API_BASE_URL}/manufacturers?specialty=${encodeURIComponent(specialty)}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `HTTP ${response.status}: Failed to fetch manufacturers by specialty`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching manufacturers by specialty:', error);
      throw new Error(`Failed to load manufacturers by specialty: ${error.message}`);
    }
  }
  /**
   * Debug function to test manufacturer service connectivity
   * Call this from browser console: window.debugManufacturers()
   */
  async debugConnection() {
    console.log('🔧 DEBUG: Testing manufacturer service connection...');
    
    try {
      console.log('🔧 DEBUG: API_BASE_URL:', API_BASE_URL);
      console.log('🔧 DEBUG: window.location.origin:', window.location.origin);
      console.log('🔧 DEBUG: localStorage token:', localStorage.getItem('token') ? 'Present' : 'Missing');
      
      // Test both endpoints
      const endpoints = [
        { name: 'General manufacturers', url: `${API_BASE_URL}/manufacturers` },
        { name: 'User-specific manufacturers', url: `${API_BASE_URL}/manufacturers/users/86256103-fd81-4f69-90d5-a32b1a47c7f6` }
      ];

      for (const endpoint of endpoints) {
        console.log(`🔧 DEBUG: Testing ${endpoint.name}...`);
        const testUrl = new URL(endpoint.url, window.location.origin);
        console.log('🔧 DEBUG: Full test URL:', testUrl.toString());
        
        const response = await fetch(testUrl, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        });
        
        console.log(`🔧 DEBUG: ${endpoint.name} Response:`, {
          status: response.status,
          statusText: response.statusText,
          headers: Object.fromEntries(response.headers.entries()),
          url: response.url
        });
        
        if (response.ok) {
          const data = await response.json();
          console.log(`🔧 DEBUG: ${endpoint.name} Response data:`, data);
          console.log(`🔧 DEBUG: ${endpoint.name} Data type:`, typeof data);
          console.log(`🔧 DEBUG: ${endpoint.name} Is array:`, Array.isArray(data));
        } else {
          const errorData = await response.text();
          console.log(`🔧 DEBUG: ${endpoint.name} Error response:`, errorData);
        }
      }
      
      return { success: true, message: 'Debug tests completed' };
    } catch (error) {
      console.error('🔧 DEBUG: Exception:', error);
      return { success: false, exception: error.message };
    }
  }
}

const manufacturerService = new ManufacturerService();

// Add debug function to window for easy testing
if (typeof window !== 'undefined') {
  window.debugManufacturers = () => manufacturerService.debugConnection();
  console.log('🔧 Debug function available: window.debugManufacturers()');
}

export default manufacturerService;
