
<script setup>
import Button from 'primevue/button';
import Card from 'primevue/card';
import Divider from 'primevue/divider';
</script>

<template>
  <div class="welcome-layout">
    <Card class="welcome-card">
      <template #title>
        <span>¡Bienvenido a la Plataforma!</span>
      </template>
      <template #content>
        <p>Accede rápidamente a las principales secciones:</p>
        <div class="links-list">
          <Button label="Diseño de Productos" icon="pi pi-palette" class="p-button-text" to="/design-lab" />
          <Button label="Catálogo de Productos" icon="pi pi-list" class="p-button-text" to="/product-catalog" />
          <Button label="Órdenes y Carrito" icon="pi pi-shopping-cart" class="p-button-text" to="/shopping-cart" />
          <Button label="Estadísticas" icon="pi pi-chart-bar" class="p-button-text" to="/analytics" />
          <Button label="Perfil" icon="pi pi-user" class="p-button-text" to="/profile" />
        </div>
        <Divider />
        <small>Utiliza el menú lateral para navegar por más opciones.</small>
      </template>
    </Card>
  </div>
</template>

<style scoped>
.welcome-layout {
  min-height: 70vh;
  display: flex;
  align-items: center;
  justify-content: center;
}
.welcome-card {
  min-width: 350px;
  max-width: 420px;
  width: 100%;
  box-shadow: 0 2px 12px rgba(0,0,0,0.08);
}
.links-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin: 1.5rem 0 1rem 0;
}
</style>
