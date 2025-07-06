// Infraestructura: productCatalogApi.js
import Product from '../domain/Product';

const API_URL = '/api/v1/products';

export default {
  async getAll(projectId) {
    const url = projectId ? `${API_URL}?projectId=${projectId}` : API_URL;
    const res = await fetch(url, { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } });
    const data = await res.json();
    return data.map(p => new Product(p));
  },
  async getById(id) {
    const res = await fetch(`${API_URL}/${id}`, { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } });
    return new Product(await res.json());
  },
  async create(productData) {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
      body: JSON.stringify(productData)
    });
    return new Product(await res.json());
  },
  async update(id, productData) {
    const res = await fetch(`${API_URL}/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
      body: JSON.stringify(productData)
    });
    return new Product(await res.json());
  },
  async delete(id) {
    await fetch(`${API_URL}/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
  }
};
