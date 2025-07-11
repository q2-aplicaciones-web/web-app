<script setup>
import { usePrimeVue } from "primevue/config";
import Sidebar from "primevue/sidebar";
import Button from "primevue/button";
import Menu from "primevue/menu";
import Toolbar from "primevue/toolbar";
import Toast from "primevue/toast";
import Popover from "primevue/popover";
import { useRouter, useRoute } from "vue-router";
import { ref, computed, provide, watch, nextTick, onMounted, onUnmounted } from "vue";
import ShoppingCartPopover from "./orders-processing/components/shopping-cart-popover.vue";
import localCartService from "./orders-processing/services/local-cart.service.js";
import { authenticationService } from "./iam/services/authentication.service.js";
import { useI18n } from 'vue-i18n';
import { env } from './env.js';

const router = useRouter();
const route = useRoute();

// Authentication reactive state
const isSignedIn = computed(() => authenticationService.isSignedIn.value);
const currentUsername = computed(() => authenticationService.currentUsername.value);

// Check if current route is an authentication route
const isAuthRoute = computed(() => {
  return ['sign-in', 'sign-up'].includes(route.name);
});

// Check if user has manufacturer role
const isManufacturer = computed(() => {
  return authenticationService.isManufacturer();
});

// Setup reactivity for menu based on role changes
const menuItems = ref([]);

// Create a reactive title reference
const dynamicTitle = ref(null);
const isEditingTitle = ref(false);
const editableTitle = ref('');
const titleInput = ref(null);
const updateProjectFunction = ref(null);
const popoverRef = ref(null);
const currentUserId = ref(authenticationService.currentUserId.value || "user-1");
const currencyCode = ref(env.currencyCode || 'USD'); // Currency from environment config
const cartItemCount = ref(0);

// Watch for user ID changes
watch(() => authenticationService.currentUserId.value, (newUserId) => {
  currentUserId.value = newUserId || "user-1";
});

// Cart item count watcher
function updateCartCount() {
  cartItemCount.value = localCartService.getCartItemCount();
}

// Update cart count on mount and periodically
onMounted(() => {
  updateCartCount();
  // Update cart count every 2 seconds to catch changes from other parts of the app
  setInterval(updateCartCount, 2000);
});

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
    popoverRef.value.toggle(event);
}

// Watch for route changes to reset dynamic title when navigating away
watch(route, (newRoute) => {
  // Reset dynamic title when route changes, unless it's the same route with different params
  if (newRoute.name !== 'project-detail') {
    dynamicTitle.value = null;
  }
}, { immediate: true });

// i18n setup
const { locale, t } = useI18n();

// Create a function to build menu items based on role (moved after t is defined)
function buildMenuItems() {
  const baseItems = [
    {
        label: t('navigation.home'),
        icon: "pi pi-home",
        command: () => {
            router.push("/home");
        },
    },
    {
        label: t('navigation.dashboard'),
        icon: "pi pi-chart-bar",
        command: () => {
            router.push("/dashboard");
        },
    },
    {
        label: t('navigation.explore'),
        icon: "pi pi-compass",
        command: () => {
            router.push("/explore");
        },
    },
    {
        label: t('navigation.designLab'),
        icon: "pi pi-cog",
        command: () => {
            router.push("/design-lab");
        },
    }
  ];
  
  // Add manufacturer-specific menu items
  if (isManufacturer.value) {
    baseItems.push({
      label: t('navigation.order_management'),
      icon: "pi pi-list",
      command: () => {
          router.push("/manufacturer-orders");
      }
    });
  }

  // Add settings if user is authenticated
  if (isSignedIn.value) {
    baseItems.push({
      label: t('navigation.settings'),
      icon: "pi pi-cog",
      command: () => {
        router.push("/settings");
      },
    });
  }

  // Add separator and sign out at the bottom
  if (isSignedIn.value) {
    baseItems.push(
      { separator: true },
      {
        label: t('navigation.sign_out'),
        icon: "pi pi-sign-out",
        command: () => {
          if (confirm('Are you sure you want to sign out?')) {
            authenticationService.signOut();
            router.push('/sign-in');
          }
        },
      }
    );
  }
  
  return baseItems;
}

// Initialize menu items
menuItems.value = buildMenuItems();

// Listen for authentication state changes and update menu
onMounted(() => {
  // Watch for role/authentication changes
  watch([isSignedIn, isManufacturer], () => {
    menuItems.value = buildMenuItems();
  });
});

function toggleLanguage() {
  locale.value = locale.value === 'en' ? 'es' : 'en';
}

// Watch for language changes to update menu labels
watch(locale, () => {
  menuItems.value = buildMenuItems();
});
</script>

<template>
    <Toast />
    <main>
        <!-- Show navigation only for authenticated users on protected routes -->
        <section v-if="isSignedIn && !isAuthRoute" class="content">
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
                        <!-- Authenticated user toolbar -->
                        <template v-if="isSignedIn">
                            <Button
                                label="Create"
                                icon="pi pi-plus"
                                severity="primary"
                                @click="router.push('/design-lab/new')"
                            />
                            <div class="cart-button-container">
                                <Button
                                    icon="pi pi-shopping-cart"
                                    severity="secondary"
                                    rounded
                                    text
                                    aria-label="Cart"
                                    @click="showCartPopover"
                                />
                                <span v-if="cartItemCount > 0" class="cart-badge">{{ cartItemCount }}</span>
                            </div>
                            <Popover ref="popoverRef">
                                <ShoppingCartPopover :user-id="currentUserId" :currency-code="currencyCode" />
                            </Popover>
                            <Button
                                :label="t('language.switch')"
                                icon="pi pi-globe"
                                severity="secondary"
                                rounded
                                text
                                aria-label="Change language"
                                @click="toggleLanguage"
                                style="margin-left: 0.5rem;"
                            />
                            <Button
                                icon="pi pi-user"
                                severity="secondary"
                                rounded
                                text
                                aria-label="Profile"
                                @click="router.push('/profile')"
                            />
                        </template>
                    </div>
                </template>
            </Toolbar>
            <router-view />
        </section>
        
        <!-- Show only router-view for auth routes -->
        <section v-else class="auth-content">
            <router-view />
        </section>
        
        <!-- Sidebar for authenticated users -->
        <div v-if="isSignedIn && !isAuthRoute" class="sidebar">
            <Menu :model="menuItems" />
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

.auth-content {
    flex: 1;
    width: 100%;
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

.cart-button-container {
    position: relative;
    display: inline-block;
}

.cart-badge {
    position: absolute;
    top: -8px;
    right: -8px;
    background: var(--red-500);
    color: white;
    border-radius: 50%;
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.75rem;
    font-weight: 600;
    min-width: 20px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}
</style>
