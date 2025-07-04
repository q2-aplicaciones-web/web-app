import { createRouter, createWebHistory } from "vue-router";
import HomeComponent from "../public/pages/home.component.vue";
import CreateProjectComponent from "../design-lab/components/create-project.component.vue";
import DashboardComponent from "../public/pages/dashboard.component.vue";
import ShoppingCartComponent from "../public/pages/shopping-cart.component.vue";
import { useRoleDomain, ROLE_NAMES } from "../access-security/services/role-domain.service";
import { useToast } from "primevue/usetoast";
import { env } from "../env";

const DesignLabComponent = () =>
    import("../public/pages/design-lab.component.vue");
const ProjectDetailComponent = () =>
    import("../design-lab/components/project-detail.component.vue");
const ProfileComponent = () =>
    import("../public/pages/profile.component.vue");
const ExplorePageComponent = () =>
    import("../public/pages/explore.component.vue");
const ManufacturerOrdersPageComponent = () =>
    import("../public/pages/manufacturer-orders-page.component.vue");

const routes = [
    {
        path: "/home",
        name: "home",
        component: HomeComponent,
        meta: { title: "Home" },
    },
    {
        path: "/dashboard",
        name: "dashboard",
        component: DashboardComponent,
        meta: { title: "Dashboard" },
    },
    {
        path: "/design-lab",
        name: "design-lab",
        component: DesignLabComponent,
        meta: { title: "Design Lab" },
    },
    {
        path: "/design-lab/new",
        name: "create-project",
        component: CreateProjectComponent,
        meta: { title: "Create Project" },
    },
    {
        path: "/design-lab/:id",
        name: "project-detail",
        component: ProjectDetailComponent,
        meta: { title: "Project Detail" },
    },
    {
        path: "/profile",
        name: "profile",
        component: ProfileComponent,
        meta: { title: "Profile" },
    },
    {
        path: "/shopping-cart",
        name: "shopping-cart",
        component: ShoppingCartComponent,
        meta: { title: "Shopping Cart" },
    },
    {
        path: "/explore",
        name: "explore",
        component: ExplorePageComponent,
        meta: { title: "Explore" },
    },
    {
        path: "/manufacturer-orders",
        name: "manufacturer-orders",
        component: ManufacturerOrdersPageComponent,
        meta: { 
            title: "Order Management",
            requiresManufacturer: true
        },
    },
    { path: "/", name: "default", redirect: "/home" },
];

const router = createRouter({
    history: createWebHistory(import.meta.BASE_URL),
    routes: routes,
});

router.beforeEach((to, from, next) => {
    let baseTitle = "Q2";
    document.title = `${baseTitle} | ${to.meta["title"]}`;

    // Check for routes that require manufacturer role
    if (to.matched.some(record => record.meta.requiresManufacturer)) {
        const { getCurrentRole, ROLES } = useRoleDomain();
        
        // Check if the current role can access this route
        if (getCurrentRole() !== ROLE_NAMES.MANUFACTURER && getCurrentRole() !== ROLE_NAMES.ADMIN) {
            // Redirect to home if not authorized
            console.warn('Access denied: Manufacturer role required');
            
            // Create a notification for the user
            setTimeout(() => {
                const toast = useToast();
                if (toast) {
                    toast.add({
                        severity: 'warn',
                        summary: 'Access Restricted',
                        detail: 'You need manufacturer privileges to access this area',
                        life: 5000
                    });
                }
            }, 100);
            
            next({ path: env.defaultRedirectPath || '/home' });
            return;
        }
    }
    
    next();
});

export default router;
