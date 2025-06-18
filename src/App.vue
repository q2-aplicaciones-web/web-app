<script setup>
import { usePrimeVue } from "primevue/config";
import Sidebar from "primevue/sidebar";
import Button from "primevue/button";
import Menu from "primevue/menu";
import Toolbar from "primevue/toolbar";
import Toast from "primevue/toast";
import OverlayPanel from "primevue/overlaypanel";
import { useRouter, useRoute } from "vue-router";
import { ref, computed, provide, watch, nextTick, getCurrentInstance } from "vue";
import ShoppingCartPopover from "./orders-processing/components/shopping-cart-popover.vue";

const router = useRouter();
const route = useRoute();

// Create a reactive title reference
const dynamicTitle = ref(null);
const isEditingTitle = ref(false);
const editableTitle = ref('');
const titleInput = ref(null);
const updateProjectFunction = ref(null);
const overlayPanelRef = ref(null);
const currentUserId = ref("user-1"); // Simulación: el usuario actual es el 1
const currencyCode = ref('PEN'); // Permite cambiar el tipo de moneda

// Provide the dynamic title so child components can update it
provide('pageTitle', {
  title: dynamicTitle,
  setTitle: (newTitle) => {
    dynamicTitle.value = newTitle;
  },
  setUpdateFunction: (updateFn) => {
    updateProjectFunction.value = updateFn;
  }
});

// Computed property for the displayed title
const displayTitle = computed(() => {
  return dynamicTitle.value || route.meta.title || 'Q2';
});

// Functions for title editing
function startEditingTitle() {
  // Only allow editing if we're on a project detail page, have a dynamic title, and it's actually a project name
  if (route.name === 'project-detail' && dynamicTitle.value && dynamicTitle.value.trim()) {
    isEditingTitle.value = true;
    editableTitle.value = dynamicTitle.value;
    // Focus the input field after the DOM updates
    nextTick(() => {
      if (titleInput.value) {
        titleInput.value.focus();
        titleInput.value.select();
      }
    });
  }
}

function saveTitle() {
  console.log('saveTitle called with:', editableTitle.value.trim());
  if (editableTitle.value.trim() && route.name === 'project-detail') {
    const newTitle = editableTitle.value.trim();
    
    // Only update if the title actually changed
    if (newTitle !== dynamicTitle.value) {
      console.log('Title changed from', dynamicTitle.value, 'to', newTitle);
      dynamicTitle.value = newTitle;
      // Update document title as well
      document.title = `Q2 | ${newTitle}`;
      
      // Use the stored update function
      if (updateProjectFunction.value) {
        console.log('Calling updateProjectFunction with:', newTitle);
        updateProjectFunction.value(newTitle);
      } else {
        console.log('No updateProjectFunction available');
      }
    } else {
      console.log('Title unchanged, not saving');
    }
  } else {
    console.log('Invalid conditions for saving:', {
      hasTitle: !!editableTitle.value.trim(),
      isProjectDetail: route.name === 'project-detail'
    });
  }
  isEditingTitle.value = false;
}

function cancelEdit() {
  isEditingTitle.value = false;
  editableTitle.value = '';
}

function handleTitleKeydown(event) {
  if (event.key === 'Enter') {
    saveTitle();
  } else if (event.key === 'Escape') {
    cancelEdit();
  }
}

function showCartPopover(event) {
    overlayPanelRef.value.toggle(event);
}

// Watch for route changes to reset dynamic title when navigating away
watch(route, (newRoute) => {
  // Reset dynamic title when route changes, unless it's the same route with different params
  if (newRoute.name !== 'project-detail') {
    dynamicTitle.value = null;
  }
}, { immediate: true });

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
        label: "Explore",
        icon: "pi pi-compass",
        command: () => {
            router.push("/explore");
        },
    },
    {
        label: "Design Lab",
        icon: "pi pi-cog",
        command: () => {
            router.push("/design-lab");
        },
    },
    {
        label: "Order Management",
        icon: "pi pi-list",
        command: () => {
            router.push("/manufacturer-orders");
        },
    },
    {
        label: "Settings",
        icon: "pi pi-cog",
        command: () => {
            router.push("/settings");
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
                    <div class="title-container">
                        <h2 
                            v-if="!isEditingTitle" 
                            @dblclick="startEditingTitle"
                            :class="{ 
                                'editable-title': route.name === 'project-detail' && dynamicTitle && dynamicTitle.trim(),
                                'non-editable': !(route.name === 'project-detail' && dynamicTitle && dynamicTitle.trim())
                            }"
                            :title="route.name === 'project-detail' && dynamicTitle && dynamicTitle.trim() ? 'Double-click to edit project name' : ''"
                        >
                            {{ displayTitle }}
                        </h2>
                        <Button
                            v-if="!isEditingTitle && route.name === 'project-detail' && dynamicTitle && dynamicTitle.trim()"
                            icon="pi pi-pencil"
                            @click="startEditingTitle"
                            class="edit-title-btn"
                            size="small"
                            text
                            rounded
                            :title="'Edit project name'"
                        />
                        <input
                            v-if="isEditingTitle"
                            v-model="editableTitle"
                            @keydown="handleTitleKeydown"
                            @blur="saveTitle"
                            class="title-input"
                            ref="titleInput"
                            type="text"
                        />
                    </div>
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
                            @click="showCartPopover"
                        />
                        <OverlayPanel ref="overlayPanelRef">
                            <ShoppingCartPopover :user-id="currentUserId" :currency-code="currencyCode" />
                        </OverlayPanel>
                        <Button
                            icon="pi pi-user"
                            severity="secondary"
                            rounded
                            text
                            aria-label="Profile"
                            @click="router.push('/profile')"
                        />
                    </div>
                </template>
            </Toolbar>
            <router-view />
        </section>
        <div class="sidebar">
            <Menu :model="items" />
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

.title-container {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.edit-title-btn {
    opacity: 0.6;
    transition: opacity 0.2s ease;
    margin-left: 0.25rem;
}

.edit-title-btn:hover {
    opacity: 1;
}

.title-container:hover .edit-title-btn {
    opacity: 0.8;
}

.editable-title {
    cursor: pointer;
    padding: 4px 8px;
    border-radius: 4px;
    transition: background-color 0.2s;
}

.editable-title:hover {
    background-color: var(--surface-100);
}

.non-editable {
    cursor: default;
}

.title-input {
    font-size: 1.5rem;
    font-weight: 600;
    padding: 4px 8px;
    border: 2px solid var(--primary-color);
    border-radius: 4px;
    background: transparent; /* Transparent background */
    outline: none;
    font-family: inherit;
    margin: 0;
    color: inherit; /* Inherit text color from parent */
}

:deep(.p-menu),
:deep(.p-toolbar) {
    border-radius: 0 !important;
}
</style>
