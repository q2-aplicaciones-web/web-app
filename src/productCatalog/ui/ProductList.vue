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
import { useI18n } from 'vue-i18n';
import { useToast } from 'primevue/usetoast';
import ProductCard from './ProductCard.vue';
import productCatalogService from '../application/productCatalogService';
import { authenticationService } from '../../iam/services/authentication.service.js';
import localCartService from '../../orders-processing/services/local-cart.service.js';

const products = ref([]);
const loading = ref(false);
const error = ref('');
const userId = authenticationService.currentUserId?.value || 'demo-user';

const { t } = useI18n();
const toast = useToast();

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

async function addToCart(product) {
  try {
    await localCartService.addToCart(product.id);
    toast.add({
      severity: 'success',
      summary: t('catalog.addedToCart'),
      detail: `${product.projectTitle || product.name} ${t('catalog.addedToCart')}`,
      life: 3000
    });
  } catch (error) {
    console.error('Failed to add to cart:', error);
    toast.add({
      severity: 'error',
      summary: t('cart.error'),
      detail: t('cart.updateError'),
      life: 3000
    });
  }
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
