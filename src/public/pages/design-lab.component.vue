<script setup>
import { ref, onMounted, computed } from "vue";
import { ProjectService } from "../../design-lab/services/project.service.js";
import { ProjectAssembler } from "../../design-lab/services/project.assembler.js";
import Card from "primevue/card";
import Toast from "primevue/toast";
import { useToast } from "primevue/usetoast";

const projects = ref([]);
const loading = ref(true);
const error = ref(null);
const toast = useToast();

const garmentColors = [
  { label: "black", value: "#161615" },      // row 0, col 0
  { label: "gray", value: "#403D3B" },      // row 0, col 1
  { label: "light-gray", value: "#B3B1AF" },// row 0, col 2
  { label: "white", value: "#EDEDED" },     // row 0, col 3
  { label: "red", value: "#B51B14" },       // row 1, col 0
  { label: "pink", value: "#F459B0" },      // row 1, col 1
  { label: "light-purple", value: "#D890E4" },// row 1, col 2
  { label: "purple", value: "#693FA0" },    // row 1, col 3
  { label: "light-blue", value: "#00A5BC" },// row 2, col 0
  { label: "cyan", value: "#31B7C9" },      // row 2, col 1
  { label: "sky-blue", value: "#3F9BDC" },  // row 2, col 2
  { label: "blue", value: "#1B3D92" },      // row 2, col 3
  { label: "green", value: "#1B8937" },     // row 3, col 0
  { label: "light-green", value: "#5BBE65" },// row 3, col 1
  { label: "yellow", value: "#FECD08" },    // row 3, col 2
  { label: "dark-yellow", value: "#F2AB00" } // row 3, col 3
];

const garmentColorImages = import.meta.env.VITE_GARMENT_COLOR_IMAGE_URL;

function getGarmentColorCropStyle(colorLabel) {
    const colorIndex = garmentColors.findIndex(color => color.label === colorLabel);
    
    if (colorIndex === -1) return { backgroundPosition: '0 0' }; // Default to first color if not found

    const row = Math.floor(colorIndex / 4);
    const col = colorIndex % 4;
    
    return {
        backgroundImage: `url(${garmentColorImages})`,
        backgroundPosition: `-${col * 600}px -${row * 600}px`,
        backgroundSize: '2400px 2400px',
        backgroundRepeat: 'no-repeat'
    };
};

onMounted(async () => {
    try {
        const response = await new ProjectService()
            .getProjects()
            .then((res) => {
                const projects = ProjectAssembler.ToEntitiesFromResponse(
                    res.data
                );
                return projects;
            });
        projects.value = response;
    } catch (err) {
        error.value = err;
        toast.add({ severity: 'error', summary: 'Error', detail: err.message, life: 5000 });
    } finally {
        loading.value = false;
    }
});
</script>

<template>
    <Toast />
    <section class="design-lab">
        <h2>Projects</h2>
        <div v-if="loading">Loading...</div>
        <div v-else-if="error">Error: {{ error.message }}</div>
        <ul v-else>
            <li v-for="project in projects" :key="project.id">                <router-link
                    :to="`/design-lab/${project.id}`"
                    class="card-link"
                >
                    <Card>
                        <template #header>
                            <div class="project-preview-container">
                                <div 
                                    class="garment-preview"
                                    :style="getGarmentColorCropStyle(project.garmentColor)"
                                ></div>
                            </div>
                        </template>
                        <template #subtitle>
                            {{ project.name }}
                        </template>
                    </Card>
                </router-link>
            </li>
        </ul>
    </section>
</template>

<style scoped>
.design-lab {
    flex: 1;
    padding: 1rem;
}

ul {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 1rem;
    list-style: none;
    padding: 0;
    margin: 0;
}

li {
    padding: 0;
}

.project-card {
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    padding: 1rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    min-height: 220px;
}

.project-preview-container {
    position: relative;
    width: 100%;
    height: 200px;
    display: flex;
    justify-content: center;
    align-items: center;
    overflow: hidden;
    background-color: #f9f9f9;
    border-radius: 8px 8px 0 0;
}

.project-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 8px 8px 0 0;
    background: #f4f4f4;
}

.garment-preview {
    width: 100%;
    height: 100%;
    background-repeat: no-repeat;
    background-position: center;
    transform: scale(0.9); /* Slightly scale down to ensure it fits nicely */
}

.project-name {
    font-weight: bold;
    font-size: 1.1rem;
    text-align: center;
}

.card-link {
    text-decoration: none;
    color: inherit;
    display: block;
    height: 100%;
}
</style>
