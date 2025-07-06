// Infraestructura: productLikesApi.js
const API_URL = '/api/v1/products';

export default {
  async like(productId, userId) {
    const res = await fetch(`${API_URL}/${productId}/likes/${userId}`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    if (!res.ok) throw new Error('Failed to like the product');
    return await res.json();
  },
  async unlike(productId, userId) {
    const res = await fetch(`${API_URL}/${productId}/likes/${userId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    if (!res.ok) throw new Error('Failed to unlike the product');
    return true;
  },
  async getCount(productId) {
    const res = await fetch(`${API_URL}/${productId}/likes/count`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    if (!res.ok) return 0;
    const data = await res.json();
    return typeof data === 'number' ? data : (data.count || 0);
  }
};
