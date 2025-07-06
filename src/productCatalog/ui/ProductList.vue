<template>
  <div class="product-list">
    <template v-if="products.length">
      <ProductCard v-for="product in products" :key="product.id" :product="product" :userId="userId" @view="viewProduct" @add-to-cart="addToCart" />
    </template>
    <template v-else>
      <div class="no-products">No hay productos ni proyectos disponibles.</div>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import ProductCard from './ProductCard.vue';
import productCatalogService from '../application/productCatalogService';

const products = ref([]);
const userId = 'demo-user'; // Reemplaza por el userId real

async function fetchProducts() {
  products.value = await productCatalogService.getAllProducts();
}

onMounted(() => {
  fetchProducts();
  window.addEventListener('focus', fetchProducts);
});

onUnmounted(() => {
  window.removeEventListener('focus', fetchProducts);
});

function viewProduct(product) {
  alert(`Producto: ${product.projectTitle}`);
}
function addToCart(product) {
  alert(`Agregado al carrito: ${product.projectTitle}`);
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
</style>
