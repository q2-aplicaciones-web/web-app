<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { ProjectService } from "../../design-lab/services/project.service.js";
import Card from "primevue/card";
import Button from "primevue/button";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import ProgressSpinner from "primevue/progressspinner";
import { useToast } from "primevue/usetoast";

const router = useRouter();
const toast = useToast();

const projects = ref([]);
const loading = ref(true);
const stats = ref({
  totalProjects: 0,
  blueprintProjects: 0,
  designedGarments: 0,
  completedProjects: 0
});

onMounted(async () => {
  try {
    await loadProjects();
    calculateStats();
  } catch (err) {
    toast.add({
      severity: "error",
      summary: "Error",
      detail: "Failed to load projects. Please try again.",
      life: 3000
    });
    console.error("Error loading projects:", err);
  } finally {
    loading.value = false;
  }
});

async function loadProjects() {
  const response = await new ProjectService().getProjects();
  // Normalize project data to handle different naming conventions
  projects.value = response.data.map(normalizeProject);
}

function normalizeProject(project) {
  return {
    id: project.id,
    name: project.name,
    userId: project.userId || project.user_id,
    createdAt: project.createdAt || project.created_at,
    lastModified: project.lastModified || project.last_modified,
    status: project.status,
    genre: project.genre,
    garmentColor: project.garmentColor || project.tshirt_color,
    garmentSize: project.garmentSize || project.tshirt_size,
    previewImageUrl: project.previewImageUrl || project.preview_image_url,
    canvas: project.canvas,
  };
}

function calculateStats() {
  stats.value.totalProjects = projects.value.length;
  stats.value.blueprintProjects = projects.value.filter(p => p.status === "blueprint").length;
  stats.value.designedGarments = projects.value.filter(p => p.status === "designed-garment").length;
  stats.value.completedProjects = projects.value.filter(p => p.status === "completed").length;
}

function getColorDisplay(color) {
  if (!color) return 'Unknown';
  
  // If it's a hex color, return it
  if (typeof color === 'string' && color.startsWith('#')) {
    return color;
  }
  
  // If it's a named color (like "black", "red")
  if (typeof color === 'string') {
    // Capitalize the first letter of each word
    return color.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  }
  
  return color.toString();
}

function navigateToProject(project) {
  router.push(`/design-lab/${project.id}`);
}

function formatDate(value) {
  if (!value) return '';
  return new Date(value).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

function createNewProject() {
  router.push("/design-lab/new");
}
</script>

<template>
  <section class="dashboard-page">
    <h1 class="dashboard-title">Design Lab Dashboard</h1>
    
    <div class="dashboard-stats">
      <Card class="stat-card">
        <template #title>Total Projects</template>
        <template #content>
          <div class="stat-value">{{ stats.totalProjects }}</div>
        </template>
      </Card>
      
      <Card class="stat-card">
        <template #title>Blueprints</template>
        <template #content>
          <div class="stat-value">{{ stats.blueprintProjects }}</div>
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
          <div class="stat-value">{{ stats.completedProjects }}</div>
        </template>
      </Card>
    </div>
    
    <div class="projects-section">
      <div class="table-header">
        <h2>Your Projects</h2>
        <Button 
          label="Create New Project" 
          icon="pi pi-plus" 
          @click="createNewProject" 
          class="create-btn" 
        />
      </div>
      
      <div v-if="loading" class="loading-container">
        <ProgressSpinner />
        <p>Loading projects...</p>
      </div>
        <DataTable 
        v-else
        :value="projects" 
        :paginator="true" 
        :rows="5"
        :rowsPerPageOptions="[5, 10, 20]"
        tableStyle="min-width: 50rem"
        stripedRows
        @row-click="(e) => navigateToProject(e.data)"
        class="project-table"
      >
        <Column field="name" header="Project Name" sortable>
          <template #body="{ data }">
            <div class="project-name-cell">
              <div 
                class="mini-tshirt-preview"
                :style="{ backgroundColor: data.garmentColor }"
              ></div>
              <span>{{ data.name }}</span>
            </div>
          </template>
        </Column>
        <Column field="genre" header="Genre" sortable>
          <template #body="{ data }">
            <span class="capitalize-text">{{ data.genre }}</span>
          </template>
        </Column>        <Column field="garmentColor" header="Color">
          <template #body="{ data }">
            <div class="color-pill">
              <span 
                class="color-swatch" 
                :style="{ backgroundColor: data.garmentColor }"
              ></span>
              <span class="color-name">
                {{ getColorDisplay(data.garmentColor) }}
              </span>
            </div>
          </template>
        </Column>
        <Column field="garmentSize" header="Size" sortable></Column>
        <Column field="status" header="Status" sortable>
          <template #body="{ data }">
            <span class="status-badge" :class="data.status">
              {{ data.status.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) }}
            </span>
          </template>
        </Column>
        <Column field="createdAt" header="Created" sortable>
          <template #body="{ data }">
            {{ formatDate(data.createdAt) }}
          </template>
        </Column>
        <Column field="lastModified" header="Last Modified" sortable>
          <template #body="{ data }">
            {{ formatDate(data.lastModified) }}
          </template>
        </Column>
        <Column header="Actions">
          <template #body="{ data }">
            <Button 
              icon="pi pi-pencil" 
              @click.stop="navigateToProject(data)" 
              text 
              rounded 
              aria-label="Edit"
            />
          </template>
        </Column>
      </DataTable>
    </div>
  </section>
</template>

<style scoped>
.dashboard-page {
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.dashboard-title {
  font-size: 2rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: var(--primary-color);
}

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

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.project-table {
  cursor: pointer;
}

.project-name-cell {
  display: flex;
  align-items: center;
  gap: 10px;
}

.mini-tshirt-preview {
  width: 32px;
  height: 32px;
  border-radius: 4px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  position: relative;
  overflow: hidden;
}

.mini-tshirt-preview::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: url('/tshirt-outline.svg');
  background-size: contain;
  background-position: center;
  background-repeat: no-repeat;
  opacity: 0.5;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  gap: 1rem;
}

.color-pill {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.color-swatch {
  display: inline-block;
  width: 20px;
  height: 20px;
  border-radius: 4px;
  border: 1px solid rgba(0, 0, 0, 0.1);
}

.color-name {
  font-size: 0.9rem;
}

.status-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  font-size: 0.85rem;
  font-weight: 500;
}

.status-badge.blueprint {
  background-color: #E3F2FD;
  color: #1565C0;
}

.status-badge.designed-garment {
  background-color: #E8F5E9;
  color: #2E7D32;
}

.status-badge.completed {
  background-color: #F3E5F5;
  color: #7B1FA2;
}

.capitalize-text {
  text-transform: capitalize;
}
</style>
