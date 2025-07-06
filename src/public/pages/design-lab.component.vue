<script setup>
import ProjectListView from "../../design-lab/components/ProjectList.vue";
import { useRouter } from 'vue-router'

const router = useRouter()

function handleProjectSelected(projectId) {
    if (projectId === 'create') {
        router.push('/design-lab/new')
    } else if (projectId === 'new') {
        router.push('/design-lab/canvas')
    } else {
        router.push(`/design-lab/${projectId}`)
    }
}
</script>

<template>
    <section class="design-lab">
        <div class="projects-section">
            <ProjectListView @project-selected="handleProjectSelected" />
        </div>
    </section>
</template>

<style scoped>
.design-lab {
    flex: 1;
    padding: 1rem;
}

.design-lab h2 {
    margin: 0 0 2rem 0;
    color: #333;
    font-size: 2rem;
}

.color-selector-section {
    margin-bottom: 3rem;
    padding: 2rem;
    background: #f8f9fa;
    border-radius: 8px;
    border: 1px solid #e9ecef;
}

.color-selector-section h3,
.projects-section h3 {
    margin: 0 0 1.5rem 0;
    color: #495057;
    font-size: 1.4rem;
}

.projects-section {
    margin-top: 2rem;
}
</style>
