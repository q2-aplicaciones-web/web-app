<template>
  <Dialog v-model:visible="internalVisible" modal header="Product Details" :closable="true">
    <div v-if="product">
      <img v-if="product.gallery?.length" :src="product.gallery[0]" :alt="product.projectDetails?.name || product.name" style="width:100%;max-width:300px;border-radius:8px;margin-bottom:1rem;" />
      <div>
        <p><strong>User:</strong> <span v-if="user">{{ user.profile?.first_name }} {{ user.profile?.last_name }} ({{ user.email }})</span><span v-else>{{ product.projectDetails?.userId || product.userId }}</span></p>
        <p><strong>Price:</strong> S/. {{ product.price?.toFixed ? product.price.toFixed(2) : product.price }}</p>
        <p><strong>Color:</strong> <span :style="{ backgroundColor: product.projectDetails?.garmentColor, display: 'inline-block', width: '16px', height: '16px', border: '1px solid #ccc', marginRight: '6px', verticalAlign: 'middle' }" class="color-box"></span> {{ product.projectDetails?.garmentColor }}</p>
        <p><strong>Size:</strong> {{ product.projectDetails?.garmentSize }}</p>
        <p><strong>Gender:</strong> {{ product.projectDetails?.gender }}</p>
        <p><strong>Rating:</strong> {{ product.rating }}</p>
        <p><strong>Likes:</strong> {{ product.likes }}</p>
        <p><strong>Tags:</strong> {{ product.tags?.join(', ') }}</p>
        <p><strong>Status:</strong> {{ product.status }}</p>
        <p><strong>Created:</strong> {{ product.projectDetails?.createdAt || product.createdAt }}</p>
        <p><strong>Last Modified:</strong> {{ product.projectDetails?.lastModified }}</p>
        <p><strong>Manufacturer:</strong> {{ product.manufacturerId }}</p>
        <p><strong>Project ID:</strong> {{ product.projectId || product.projectDetails?.id }}</p>
        <p><strong>Product ID:</strong> {{ product.id }}</p>
        <p><strong>Comments:</strong> <span v-if="product.comments && product.comments.length">{{ product.comments.length }}</span><span v-else>0</span></p>
      </div>
    </div>
    <div v-else style="text-align:center;padding:2rem;">Cargando...</div>
  </Dialog>
</template>

<script setup>
import { defineProps, ref, watch } from 'vue';
import Dialog from 'primevue/dialog';
import ProductService from '../../product-catalog/services/product.service';
import { authenticationService } from '../../iam/services/authentication.service.js';

const props = defineProps({
  productId: [String, Number],
  visible: Boolean
});

const internalVisible = ref(false);
const product = ref(null);
const user = ref(null);

watch(() => props.visible, (val) => {
  internalVisible.value = val;
});

watch(() => props.productId, async (id) => {
  if (id) {
    internalVisible.value = true;
    await fetchProductAndUser(id);
  } else {
    internalVisible.value = false;
    product.value = null;
    user.value = null;
  }
}, { immediate: true });

async function fetchProductAndUser(id) {
  product.value = null;
  user.value = null;
  try {
    // Buscar todos los productos y encontrar el correcto
    const products = await ProductService.getAllProducts();
    const found = products.find(p => p.id == id || p.id === id);
    product.value = found || null;
    if (product.value) {
      const userId = product.value.projectDetails?.userId || product.value.userId;
      if (userId) {
        try {
          // For now, use a mock user object since UserService is removed
          user.value = {
            id: userId,
            username: `User ${userId}`,
            // You can extend this with actual user data when available
          };
        } catch (e) {
          user.value = null;
        }
      }
    }
  } catch (e) {
    product.value = null;
    user.value = null;
  }
}
</script>

<style scoped>
.color-box {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 1px solid #ccc;
  margin-right: 6px;
  vertical-align: middle;
}
</style>