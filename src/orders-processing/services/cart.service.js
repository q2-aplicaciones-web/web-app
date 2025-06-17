import axios from 'axios';
import { Cart, CartItem } from '../models/cart.entity.js';


const apiBaseUrl = 'http://localhost:3000'; // Ajusta según tu backend

const cartService = {
  async getCartByUser(userId) {
    const { data } = await axios.get(`${apiBaseUrl}/carts?user_id=${userId}`);
    return data;
  },
  async updateCart(cart) {
    const { data } = await axios.put(`${apiBaseUrl}/carts/${cart.id}`, cart);
    return data;
  },
  async clearCart(cart) {
    const clearedCart = { ...cart, items: [] };
    const { data } = await axios.put(`${apiBaseUrl}/carts/${cart.id}`, clearedCart);
    return data;
  },
  async addToCart(product, userId) {
    const carts = await this.getCartByUser(userId);
    let cart = carts[0];
    if (!cart) {
      cart = new Cart();
      cart.user_id = userId;
      cart.items = [];
     
    }
    // Usa product.projectId o product.id como identificador
    const projectId = product.projectId || product.id;
    let existingItem = cart.items.find(item => item.project_id === projectId);
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      const newItem = new CartItem();
      newItem.project_id = projectId;
      newItem.quantity = 1;
      newItem.unit_price = product.price;
      newItem.projectName = product.projectDetails?.name || product.name || '';
      newItem.projectImage = product.projectDetails?.previewImageUrl || product.gallery?.[0] || '';
      cart.items.push(newItem);
    }
    return await this.updateCart(cart);
  }
};

export default cartService;