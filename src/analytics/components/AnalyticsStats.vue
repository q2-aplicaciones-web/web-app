<!-- filepath: /home/giks/Documentos/APPS-WEB/web-app/src/analytics/components/AnalyticsStats.vue -->
<template>
  <div v-if="analytics" class="dashboard-stats">
    <Card class="stat-card">
      <template #title>Total Projects</template>
      <template #content>
        <div class="stat-value">{{ stats.totalProjects }}</div>
      </template>
    </Card>
    <Card class="stat-card">
      <template #title>Blueprints</template>
      <template #content>
        <div class="stat-value">{{ stats.blueprints }}</div>
      </template>
    </Card>
    <Card class="stat-card">
      <template #title>Designed Garments</template>
      <template #content>
        <div class="stat-value">{{ stats.designedGarments }}</div>
      </template>
    </Card>
    <Card class="stat-card">
      <template #title>Completed</template>
      <template #content>
        <div class="stat-value">{{ stats.completed }}</div>
      </template>
    </Card>
  </div>
</template>

<script setup>
import Card from "primevue/card";
import { computed } from "vue";

const props = defineProps({
  analytics: Object,
  projects: {
    type: Array,
    default: undefined
  }
});

// Si analytics viene del backend, úsalo. Si no, calcula los stats localmente con projects
const stats = computed(() => {
  if (props.analytics) {
    return {
      totalProjects: props.analytics.totalProjects,
      blueprints: props.analytics.blueprints,
      designedGarments: props.analytics.designedGarments,
      completed: props.analytics.completed
    };
  } else if (props.projects) {
    return {
      totalProjects: props.projects.length,
      blueprints: props.projects.filter(p => p.status === "blueprint").length,
      designedGarments: props.projects.filter(p => p.status === "designed-garment").length,
      completed: props.projects.filter(p => p.status === "completed").length
    };
  } else {
    return {
      totalProjects: 0,
      blueprints: 0,
      designedGarments: 0,
      completed: 0
    };
  }
});
</script>

<style scoped>
.dashboard-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}
.stat-card {
  min-height: 120px;
  border-radius: 8px;
  transition: transform 0.2s, box-shadow 0.2s;
}
.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.08);
}
.stat-value {
  font-size: 2.5rem;
  font-weight: 700;
  text-align: center;
  color: var(--primary-color);
}
</style>
