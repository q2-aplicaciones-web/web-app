<template>
  <div class="p-4">
    <h1 class="text-3xl font-bold mb-4">Orders</h1>
    <Button icon="pi pi-refresh" label="Refresh Orders" class="mb-4" @click="fetchOrders" outlined size="small" style="float:right" :loading="loading" />
    <div v-if="loading" class="p-4 text-center text-lg">Cargando órdenes...</div>
    <div v-else-if="!orders.length" class="p-4 text-center text-lg text-color-secondary">No hay órdenes asignadas.</div>
    <div v-else class="p-grid p-nogutter" style="gap:2rem;">
      <div v-for="order in orders" :key="order.id" class="p-col-12 p-md-6">
        <Card>
          <template #title>
            <div class="flex align-items-center gap-2">
              <span>Order #{{ order.orderId }}</span>
              <Tag :value="order.status" :severity="statusSeverity(order.status)" />
              <span class="text-xs text-color-secondary ml-2">Received: {{ formatDate(order.receivedDate) }}</span>
            </div>
          </template>
          <template #content>
            <div class="mb-2">
              <h3 class="text-lg font-semibold mb-1">Customer Information</h3>
              <div><b>Name:</b> {{ order.customerName }}</div>
              <div><b>Address:</b> {{ order.customerAddress }}</div>
            </div>
            <Divider />
            <div class="mb-2">
              <h3 class="text-lg font-semibold mb-1">Items</h3>
              <div v-for="item in order.items" :key="item.id" class="flex align-items-center gap-2 mb-2">
                <img :src="item.previewImageUrl || 'https://primefaces.org/cdn/primevue/images/product-placeholder.svg'" alt="preview" width="48" height="48" style="border-radius:8px;object-fit:cover;" />
                <div>
                  <div class="font-medium">Project #{{ item.projectId }}</div>
                  <div class="text-xs">{{ item.quantity }} x ${{ item.unitPrice.toFixed(2) }}</div>
                </div>
              </div>
              <div class="text-right font-bold mt-2">Total: ${{ order.totalAmount.toFixed(2) }}</div>
            </div>
            <Divider />
            <div>
              <h3 class="text-lg font-semibold mb-1">Update Status</h3>
              <Dropdown v-model="order.status" :options="statusOptions" optionLabel="label" optionValue="value" class="w-12rem mr-2" @change="onStatusChange(order)" />
            </div>
          </template>
        </Card>
      </div>
    </div>
    <Toast ref="toast" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useManufacturerOrders } from '../services/manufacturer-orders.service.js';
import Card from 'primevue/card';
import Tag from 'primevue/tag';
import Button from 'primevue/button';
import Divider from 'primevue/divider';
import Dropdown from 'primevue/dropdown';
import Toast from 'primevue/toast';
import { useToast } from 'primevue/usetoast';

const { getManufacturerOrders, updateFulfillmentStatus } = useManufacturerOrders();
const orders = ref([]);
const toast = useToast();
const loading = ref(false);

const statusOptions = [
  { label: 'Pending', value: 'pending' },
  { label: 'Delivered', value: 'delivered' },
  { label: 'Shipped', value: 'shipped' },
  { label: 'Cancelled', value: 'cancelled' }
];

function statusSeverity(status) {
  switch (status) {
    case 'pending': return 'warning';
    case 'delivered': return 'success';
    case 'shipped': return 'info';
    case 'cancelled': return 'danger';
    default: return 'secondary';
  }
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleString();
}

async function fetchOrders() {
  loading.value = true;
  try {
    const result = await getManufacturerOrders();
    orders.value = result;
    if (!result.length) {
      toast.add({ severity: 'info', summary: 'Sin órdenes', detail: 'No hay órdenes asignadas a tu usuario.', life: 4000 });
    }
  } catch (e) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar las órdenes', life: 4000 });
  } finally {
    loading.value = false;
  }
}

async function onStatusChange(order) {
  try {
    await updateFulfillmentStatus(order.id, order.status);
    toast.add({ severity: 'success', summary: 'Estado actualizado', detail: `Orden #${order.orderId} actualizada a ${order.status}`, life: 3000 });
    fetchOrders();
  } catch (e) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo actualizar el estado', life: 3000 });
  }
}

onMounted(fetchOrders);
</script>

<style scoped>
.p-card {
  min-height: 400px;
}
</style>
