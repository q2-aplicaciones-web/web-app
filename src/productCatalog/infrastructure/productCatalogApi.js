/**
 * Product Catalog API Infrastructure Layer
 * 
 * This module handles all HTTP requests to the Product Catalog API endpoints.
 * 
 * API ENDPOINTS USED:
 * 
 * 1. GET /api/v1/products
 *    - Description: Fetch all products, optionally filtered by projectId
 *    - Query params: projectId (optional) - Filter products by project
 *    - Headers: Authorization: Bearer {token}
 *    - Response: Array of product objects
 * 
 * 2. GET /api/v1/products/{id}
 *    - Description: Fetch a specific product by ID
 *    - Path params: id (required) - Product UUID
 *    - Headers: Authorization: Bearer {token}
 *    - Response: Single product object
 * 
 * 3. POST /api/v1/products
 *    - Description: Create a new product
 *    - Headers: Authorization: Bearer {token}, Content-Type: application/json
 *    - Body: Product data object
 *    - Response: Created product object
 * 
 * 4. PUT /api/v1/products/{id}
 *    - Description: Update an existing product
 *    - Path params: id (required) - Product UUID
 *    - Headers: Authorization: Bearer {token}, Content-Type: application/json
 *    - Body: Updated product data object
 *    - Response: Updated product object
 * 
 * 5. DELETE /api/v1/products/{id}
 *    - Description: Delete a product
 *    - Path params: id (required) - Product UUID
 *    - Headers: Authorization: Bearer {token}
 *    - Response: 204 No Content
 * 
 * All responses are wrapped in Product domain objects using the Product constructor.
 */

// Infraestructura: productCatalogApi.js
import Product from '../domain/Product';

const API_URL = '/api/v1/products';

export default {
  async getAll(projectId) {
    const url = projectId ? `${API_URL}?projectId=${projectId}` : API_URL;
    const res = await fetch(url, { 
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } 
    });
    
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.detail || 'Failed to fetch products');
    }
    
    const data = await res.json();
    return data.map(p => new Product(p));
  },
  
  async getById(id) {
    const res = await fetch(`${API_URL}/${id}`, { 
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } 
    });
    
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.detail || 'Failed to fetch product');
    }
    
    return new Product(await res.json());
  },
  
  async create(productData) {
    console.log('Sending product creation request to:', API_URL);
    console.log('Request payload:', JSON.stringify(productData, null, 2));
    
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json', 
        'Authorization': `Bearer ${localStorage.getItem('token')}` 
      },
      body: JSON.stringify(productData)
    });
    
    if (!res.ok) {
      let errorData;
      try {
        const errorText = await res.text();
        console.log('Raw error response:', errorText);
        
        // Try to parse as JSON
        try {
          errorData = JSON.parse(errorText);
        } catch (parseError) {
          console.error('Error response is not valid JSON:', parseError);
          errorData = { detail: errorText || `HTTP ${res.status}: ${res.statusText}` };
        }
        
        console.error('Product creation failed:', {
          status: res.status,
          statusText: res.statusText,
          errorData: errorData,
          rawResponse: errorText
        });
      } catch (parseError) {
        console.error('Failed to read error response:', parseError);
        errorData = { detail: `HTTP ${res.status}: ${res.statusText}` };
      }
      
      // Log the exact error details
      console.error('Full error response:', {
        url: API_URL,
        method: 'POST',
        status: res.status,
        statusText: res.statusText,
        headers: Object.fromEntries(res.headers.entries()),
        errorData: errorData
      });
      
      throw new Error(errorData.detail || errorData.message || `Failed to create product: ${res.status} ${res.statusText}`);
    }
    
    return new Product(await res.json());
  },
  
  async update(id, productData) {
    const res = await fetch(`${API_URL}/${id}`, {
      method: 'PATCH',
      headers: { 
        'Content-Type': 'application/json', 
        'Authorization': `Bearer ${localStorage.getItem('token')}` 
      },
      body: JSON.stringify(productData)
    });
    
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.detail || 'Failed to update product');
    }
    
    return new Product(await res.json());
  },
  
  async delete(id) {
    const res = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.detail || 'Failed to delete product');
    }
  }
};
