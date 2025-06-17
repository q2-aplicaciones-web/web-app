import axios from 'axios';
import { env } from '../../env';

export default {
  async getComments(productId) {
    const { data } = await axios.get(`${env.apiBaseUrl}/comments?productId=${productId}`);
    return data;
  },
  // Otros métodos aquí...
};