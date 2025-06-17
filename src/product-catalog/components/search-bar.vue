<template>
  <div class="search-bar">
    <InputText v-model="search" placeholder="Hinted search text" />
    <Button icon="pi pi-search" />
  </div>
</template>

<script setup>
import { ref } from 'vue';
import InputText from 'primevue/inputtext';
import Button from 'primevue/button';

const search = ref('');
</script>