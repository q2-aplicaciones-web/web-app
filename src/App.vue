<script setup>
import { usePrimeVue } from "primevue/config";
import Sidebar from "primevue/sidebar";
import Button from "primevue/button";
import Menu from "primevue/menu";
import Toolbar from "primevue/toolbar";
import { useRouter, useRoute } from "vue-router";

const router = useRouter();
const route = useRoute();

const items = [
    {
        label: "Home",
        icon: "pi pi-home",
        command: () => {
            router.push("/home");
        },
    },
    {
        label: "Dashboard",
        icon: "pi pi-chart-bar",
        command: () => {
            router.push("/dashboard");
        },
    },
    {
        label: "Templates",
        icon: "pi pi-clone",
        command: () => {
            router.push("/templates");
        },
    },
    {
        label: "Favorites",
        icon: "pi pi-star",
        command: () => {
            router.push("/favorites");
        },
    },
    {
        label: "Explore",
        icon: "pi pi-compass",
        command: () => {
            router.push("/explore");
        },
    },
    {
        label: "Projects",
        icon: "pi pi-briefcase",
        command: () => {
            router.push("/projects");
        },
    },
    {
        label: "Design Lab",
        icon: "pi pi-cog",
        command: () => {
            router.push("/design-lab");
        },
    },
];
</script>

<template>
    <Toast />
    <main>
        <section class="content">
            <Toolbar>
                <template #start>
                    <h2>{{ route.meta.title }}</h2>
                </template>
                <template #end>
                    <div class="user-menu">
                        <Button
                            label="Create"
                            icon="pi pi-plus"
                            severity="primary"
                            @click="router.push('/design-lab/new')"
                        />
                        <Button
                            icon="pi pi-shopping-cart"
                            severity="secondary"
                            rounded
                            text
                            aria-label="Cart"
                        />
                        <Button
                            icon="pi pi-user"
                            severity="secondary"
                            rounded
                            text
                            aria-label="User"
                        />
                    </div>
                </template>
            </Toolbar>
            <router-view />
        </section>
        <div class="sidebar">
            <Menu :model="items">
                <template #start>
                    <div class="menu-header">Q2</div>
                </template>
            </Menu>
        </div>
    </main>
</template>

<style scoped>
main {
    display: flex;
    width: 100%;
}

.content {
    flex: 1;
    display: flex;
    flex-direction: column;
}

.sidebar {
    display: flex;
}

.menu-header {
    font-weight: bold;
    font-size: 1.2rem;
    margin-bottom: 1rem;
    padding: 0 1rem;
    display: flex;
    align-items: center;
    height: 65px;
}

.user-menu {
    display: flex;
    gap: 1rem;
}

:deep(.p-menu),
:deep(.p-toolbar) {
    border-radius: 0 !important;
}
</style>
