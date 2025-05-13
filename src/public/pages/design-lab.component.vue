<script setup>
import { ref, onMounted } from "vue";
import { ProjectService } from "../../design-lab/services/project.service.js";
import { ProjectAssembler } from "../../design-lab/services/project.assembler.js";
import Card from "primevue/card";
import Toast from "primevue/toast";
import { useToast } from "primevue/usetoast";

const projects = ref([]);
const loading = ref(true);
const error = ref(null);
const toast = useToast();

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
            <li v-for="project in projects" :key="project.id">
                <router-link
                    :to="`/design-lab/${project.id}`"
                    class="card-link"
                >
                    <Card>
                        <template #header>
                            <img
                                :src="project.previewImageUrl"
                                alt="Project preview"
                                class="project-image"
                            />
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

.project-image {
    width: 100%;
    height: 120px;
    object-fit: cover;
    border-radius: 4px 4px 0 0;
    background: #f4f4f4;
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
