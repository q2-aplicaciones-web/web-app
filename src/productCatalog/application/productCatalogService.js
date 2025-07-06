// Aplicación: productCatalogService.js
import api from '../infrastructure/productCatalogApi';

export default {
  getAllProducts: api.getAll,
  getProductById: api.getById,
  createProduct: api.create,
  updateProduct: api.update,
  deleteProduct: api.delete
};
