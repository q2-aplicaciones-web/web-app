<script setup>
import { ref, onMounted } from "vue";
import { ProjectService } from "../../design-lab/services/project.service.js";
import Card from "primevue/card";
import Toast from "primevue/toast";
import { useToast } from "primevue/usetoast";
import { DesignLabService } from "../../design-lab/services/design-lab.service.js";

const projects = ref([]);
const loading = ref(true);
const error = ref(null);
const toast = useToast();

const garmentColors = ref([]);
const garmentSizes = ref([]);

const garmentColorImages = import.meta.env.VITE_GARMENT_COLOR_IMAGE_URL;

function getGarmentColorCropStyle(colorValue) {
    const colorIndex = garmentColors.value.findIndex(
        (color) => color.value === colorValue
    );

    if (colorIndex === -1) return { backgroundPosition: "0 0" }; // Default to first color if not found

    const row = Math.floor(colorIndex / 4);
    const col = colorIndex % 4;

    return {
        backgroundImage: `url(${garmentColorImages})`,
        backgroundPosition: `-${col * 600}px -${row * 600}px`,
        backgroundSize: "2400px 2400px",
        backgroundRepeat: "no-repeat",
    };
}

function getStatusBadgeClass(status) {
    switch (status) {
        case 'blueprint':
            return 'status-blueprint';
        case 'in-progress':
            return 'status-in-progress';
        case 'completed':
            return 'status-completed';
        default:
            return 'status-default';
    }
}

function formatDate(dateString) {
    console.log("Formatting date:", dateString);
    return new Date(dateString).toLocaleDateString();
}

onMounted(async () => {
    try {
        const projectsResponse = await ProjectService.getProjects();
        console.log("Projects response:", projectsResponse);
        projects.value = projectsResponse;

        const garmentsColorsResponse = await DesignLabService.getGarmentColors();
        console.log("Garments colors response:", garmentsColorsResponse.data);
        garmentColors.value = garmentsColorsResponse.data;

        const garmentsSizesResponse = await DesignLabService.getGarmentSizes();
        console.log("Garments sizes response:", garmentsSizesResponse.data);
        garmentSizes.value = garmentsSizesResponse.data;

    } catch (err) {
        error.value = err;
        toast.add({
            severity: "error",
            summary: "Error",
            detail: err.message,
            life: 5000,
        });
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
            <li v-for="project in projects" :key="project.id">
                <router-link
                    :to="`/design-lab/${project.id}`"
                    class="card-link"
                >
                    <Card>
                        <template #header>
                            <div class="project-preview-container">
                                <div
                                    class="garment-preview"
                                    :style="
                                        getGarmentColorCropStyle(
                                            project.garmentColor
                                        )
                                    "
                                ></div>
                                <div class="status-badge" :class="getStatusBadgeClass(project.status)">
                                    {{ project.status }}
                                </div>
                            </div>
                        </template>
                        <template #title>
                            {{ project.name }}
                        </template>
                        <template #subtitle>
                            <div class="project-details">
                                <div class="detail-item">
                                    <span class="detail-label">Gender:</span>
                                    <span class="detail-value">{{ project.gender }}</span>
                                </div>
                                <div class="detail-item">
                                    <span class="detail-label">Size:</span>
                                    <span class="detail-value">{{ project.garmentSize }}</span>
                                </div>
                                <div class="detail-item">
                                    <span class="detail-label">Created:</span>
                                    <span class="detail-value">{{ formatDate(project.createdAt) }}</span>
                                </div>
                                <div class="detail-item">
                                    <span class="detail-label">Modified:</span>
                                    <span class="detail-value">{{ formatDate(project.lastModified) }}</span>
                                </div>
                                <div class="detail-item">
                                    <span class="detail-label">Layers:</span>
                                    <span class="detail-value">{{ project.layers?.length || 0 }}</span>
                                </div>
                            </div>
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
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 1.5rem;
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

.status-badge {
    position: absolute;
    top: 8px;
    right: 8px;
    padding: 4px 8px;
    border-radius: 12px;
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: capitalize;
    color: white;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.status-blueprint {
    background-color: #3b82f6;
}

.status-in-progress {
    background-color: #f59e0b;
}

.status-completed {
    background-color: #10b981;
}

.status-default {
    background-color: #6b7280;
}

.project-details {
    display: flex;
    flex-direction: column;
    gap: 4px;
    font-size: 0.875rem;
}

.detail-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.detail-label {
    color: #6b7280;
    font-weight: 500;
}

.detail-value {
    color: #374151;
    font-weight: 600;
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

.card-link {
    text-decoration: none;
    color: inherit;
    display: block;
    height: 100%;
}
</style>
