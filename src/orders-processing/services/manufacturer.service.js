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

class ManufacturerService {
  /**
   * Fetch all available manufacturers, optionally filtered by userId
   * Endpoint: GET /api/v1/manufacturers
   * Query Parameters: userId (optional) - Filter manufacturers by user UUID
   * Used for: Manufacturer selection dropdown in cart
   * 
   * Response Schema:
   * {
   *   id: "uuid-string",
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
    try {
      const url = new URL(`${API_BASE_URL}/manufacturers`, window.location.origin);
      
      // Add userId filter if provided
      if (userId) {
        url.searchParams.append('userId', userId);
      }

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || errorData.message || `HTTP ${response.status}: Failed to fetch manufacturers`);
      }

      const manufacturers = await response.json();
      
      // Validate and enhance manufacturer data
      return manufacturers.map(manufacturer => ({
        ...manufacturer,
        // Ensure required fields have fallback values for UI compatibility
        averageProductionTime: manufacturer.averageProductionTime || 7,
        qualityRating: manufacturer.qualityRating || 0,
        specialties: manufacturer.specialties || [],
        // Add computed fields for better UX
        displayLocation: this.formatManufacturerLocation(manufacturer),
        estimatedDeliveryRange: this.calculateDeliveryRange(manufacturer)
      }));
    } catch (error) {
      console.error('Error fetching manufacturers:', error);
      throw new Error(`Failed to load manufacturers: ${error.message}`);
    }
  }

  /**
   * Get specific manufacturer details
   * Endpoint: GET /api/v1/manufacturers/{manufacturerId}
   * Used for: Displaying manufacturer info in cart/order
   */
  async getManufacturerById(manufacturerId) {
    if (!manufacturerId) {
      throw new Error('Manufacturer ID is required');
    }

    try {
      const response = await fetch(`${API_BASE_URL}/manufacturers/${manufacturerId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `HTTP ${response.status}: Failed to fetch manufacturer`);
      }

      const manufacturer = await response.json();
      
      // Enhance manufacturer data
      return {
        ...manufacturer,
        averageProductionTime: manufacturer.averageProductionTime || 7,
        qualityRating: manufacturer.qualityRating || 0,
        specialties: manufacturer.specialties || [],
        displayLocation: this.formatManufacturerLocation(manufacturer),
        estimatedDeliveryRange: this.calculateDeliveryRange(manufacturer)
      };
    } catch (error) {
      console.error('Error fetching manufacturer:', error);
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
}

export default new ManufacturerService();
