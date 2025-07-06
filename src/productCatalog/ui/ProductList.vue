<template>
  <div class="product-list">
    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <p>Loading products...</p>
    </div>
    
    <!-- Error State -->
    <div v-else-if="error" class="error-state">
      <p>{{ error }}</p>
      <button @click="fetchProducts">Retry</button>
    </div>
    
    <!-- Products Display -->
    <template v-else-if="products.length">
      <ProductCard v-for="product in products" :key="product.id" :product="product" :userId="userId" @view="viewProduct" @add-to-cart="addToCart" />
    </template>
    
    <!-- Empty State -->
    <template v-else>
      <div class="no-products">No products available yet.</div>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import ProductCard from './ProductCard.vue';
import productCatalogService from '../application/productCatalogService';
import { authenticationService } from '../../iam/services/authentication.service.js';

const products = ref([]);
const loading = ref(false);
const error = ref('');
const userId = authenticationService.currentUserId?.value || 'demo-user';

async function fetchProducts() {
  loading.value = true;
  error.value = '';
  
  try {
    products.value = await productCatalogService.getAllProducts();
  } catch (err) {
    console.error('Error fetching products:', err);
    error.value = err.message || 'Failed to load products';
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  fetchProducts();
  window.addEventListener('focus', fetchProducts);
});

onUnmounted(() => {
  window.removeEventListener('focus', fetchProducts);
});

function viewProduct(product) {
  alert(`Product: ${product.projectTitle}`);
}

function addToCart(product) {
  alert(`Added to cart: ${product.projectTitle}`);
}
</script>

<style scoped>
.product-list {
  display: flex;
  flex-wrap: wrap;
  gap: 2rem;
  justify-content: flex-start;
  align-items: stretch;
  margin: 2rem auto 0 auto;
  max-width: 1200px;
}
.no-products {
  width: 100%;
  text-align: center;
  color: #888;
  font-size: 1.2rem;
  margin: 3rem 0;
}
.loading-state {
  width: 100%;
  text-align: center;
  color: #666;
  font-size: 1.1rem;
  margin: 3rem 0;
}
.error-state {
  width: 100%;
  text-align: center;
  color: #dc3545;
  font-size: 1.1rem;
  margin: 3rem 0;
}
.error-state button {
  margin-top: 1rem;
  padding: 0.5rem 1rem;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
.error-state button:hover {
  background: #0056b3;
}
</style>
