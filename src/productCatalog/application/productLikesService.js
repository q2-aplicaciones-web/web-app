// Aplicación: productLikesService.js
import api from '../infrastructure/productLikesApi';

export default {
  likeProduct: api.like,
  unlikeProduct: api.unlike,
  getLikeCount: api.getCount
};
