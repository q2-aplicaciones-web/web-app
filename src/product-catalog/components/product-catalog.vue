<template>
  <div class="product-list">
    <ProductCard
      v-for="product in products"
      :key="product.id"
      :product="product"
      @view="openDetail"
      @add-to-cart="addToCart"
    />
    <ProductDetailDialog
      v-if="selectedProductId"
      :productId="selectedProductId"
      :visible="dialogVisible"
      @update:visible="dialogVisible = $event"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import ProductCard from './product-card.vue';
import ProductDetailDialog from './product-detail-dialog.vue';
import productService from '../services/product.service.js';

const products = ref([]);
const selectedProductId = ref(null);
const dialogVisible = ref(false);

onMounted(async () => {
  products.value = await productService.getAllProducts();
});

function openDetail(product) {
  selectedProductId.value = product.id;
  dialogVisible.value = true;
}

function addToCart(product) {
  // Implementa la lógica de agregar al carrito aquí
  //alert('Producto agregado al carrito');
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

.product-list > * {
  flex: 1 1 260px;
  max-width: 300px;
  min-width: 260px;
  margin-bottom: 2rem;
  display: flex;
}

@media (max-width: 900px) {
  .product-list {
    justify-content: center;
    gap: 1rem;
  }
  .product-list > * {
    max-width: 90vw;
    min-width: 220px;
  }
}
</style>