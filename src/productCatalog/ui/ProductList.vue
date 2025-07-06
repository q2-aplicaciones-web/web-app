<template>
  <div class="product-list">
    <template v-if="products.length">
      <Card v-for="product in products" :key="product.id" class="product-card">
        <template #header>
          <div class="product-preview">
            <img v-if="product.projectPreviewUrl" :src="product.projectPreviewUrl" :alt="product.projectTitle" />
            <div v-else class="no-preview">
              <i class="pi pi-image"></i>
              <span>No preview</span>
            </div>
          </div>
        </template>
        <template #title>
          <span class="product-title">{{ product.projectTitle || 'Sin nombre' }}</span>
        </template>
        <template #content>
          <div class="product-info">
            <div class="product-price">{{ product.priceCurrency }} {{ product.priceAmount }}</div>
            <div class="product-meta">
              <i class="pi pi-heart"></i> {{ product.likeCount }}
              <span class="product-status">{{ product.status }}</span>
            </div>
          </div>
        </template>
        <template #footer>
          <Button label="Ver" icon="pi pi-eye" @click="viewProduct(product)" />
        </template>
      </Card>
    </template>
    <template v-else>
      <div class="no-products">No hay productos ni proyectos disponibles.</div>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import Card from 'primevue/card';
import Button from 'primevue/button';
import productCatalogService from '../application/productCatalogService';

const products = ref([]);

onMounted(async () => {
  products.value = await productCatalogService.getAllProducts();
});

function viewProduct(product) {
  // Aquí puedes emitir un evento o mostrar un dialog con el detalle
  alert(`Producto: ${product.projectTitle}`);
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
.product-card {
  flex: 1 1 260px;
  max-width: 300px;
  min-width: 260px;
  margin-bottom: 2rem;
  display: flex;
  flex-direction: column;
}
.product-preview {
  width: 100%;
  height: 160px;
  display: flex;
  align-items: flex-end;
  justify-content: flex-end;
  overflow: hidden;
  position: relative;
}
.product-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.no-preview {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #bbb;
  font-size: 1.2rem;
}
.product-title {
  font-size: 1.1rem;
  font-weight: bold;
  margin: 0.5rem 0 0.25rem 0;
  min-height: 2.2em;
  color: #333;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  display: block;
  text-align: left;
}
.product-info {
  color: #222;
  padding: 0.5rem 0.5rem 0.5rem 0.5rem;
  border-radius: 0 0 12px 12px;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  min-height: 80px;
}
.product-price {
  color: #222;
  font-weight: 600;
  font-size: 1.05rem;
}
.product-meta {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #666;
}
.product-status {
  margin-left: 1rem;
  font-size: 0.95rem;
  color: #888;
}
.no-products {
  width: 100%;
  text-align: center;
  color: #888;
  font-size: 1.2rem;
  margin: 3rem 0;
}
</style>
