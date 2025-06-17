import axios from 'axios';
import { env } from '../../env';

export default {
  async getAllProducts() {
    // Obtener productos y proyectos en paralelo
    const [productsRes, projectsRes] = await Promise.all([
      axios.get(`${env.apiBaseUrl}/catalog`),
      axios.get(`${env.apiBaseUrl}/projects`)
    ]);
    const products = productsRes.data;
    const projects = projectsRes.data;
    // Enriquecer cada producto con los detalles del proyecto
    return products.map(product => {
      const project = projects.find(p => p.id === product.project_id);
      return {
        ...product,
        projectDetails: project || null
      };
    });
  },
  // Otros métodos aquí...
};