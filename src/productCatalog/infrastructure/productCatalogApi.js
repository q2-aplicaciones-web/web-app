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
      const errorData = await res.json();
      console.error('Product creation failed:', {
        status: res.status,
        statusText: res.statusText,
        errorData: errorData
      });
      throw new Error(errorData.detail || `Failed to create product: ${res.status} ${res.statusText}`);
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
