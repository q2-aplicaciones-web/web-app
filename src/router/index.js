import { createRouter, createWebHistory } from "vue-router";
import HomeComponent from "../public/pages/home.component.vue";
import CreateProjectComponent from "../design-lab/components/CreateProject.vue";
import DashboardComponent from "../public/pages/dashboard.component.vue";
import ShoppingCartComponent from "../public/pages/shopping-cart.component.vue";
import { authenticationGuard, guestGuard } from "../iam/services/authentication.guard.js";
import { useToast } from "primevue/usetoast";
import { env } from "../env";

// Lazy-loaded components
const DesignLabComponent = () =>
    import("../public/pages/design-lab.component.vue");
const ProjectDetailComponent = () =>
    import("../design-lab/components/ProjectDetail.vue");
const ProfileComponent = () =>
    import("../public/pages/profile.component.vue");
const ExplorePageComponent = () =>
    import("../public/pages/explore.component.vue");
const ManufacturerOrdersPageComponent = () =>
    import("../public/pages/manufacturer-orders-page.component.vue");

// IAM Components
const SignInComponent = () =>
    import("../iam/pages/sign-in.component.vue");
const SignUpComponent = () =>
    import("../iam/pages/sign-up.component.vue");

const routes = [
    // 🌐 Public routes (no authentication required)
    {
        path: "/sign-in",
        name: "sign-in",
        component: SignInComponent,
        meta: { title: "Sign In" },
        beforeEnter: guestGuard
    },
    {
        path: "/sign-up",
        name: "sign-up",
        component: SignUpComponent,
        meta: { title: "Sign Up" },
        beforeEnter: guestGuard
    },
    
    // 🔒 Protected routes (authentication required)
    {
        path: "/home",
        name: "home",
        component: HomeComponent,
        meta: { title: "Home" },
        beforeEnter: authenticationGuard
    },
    {
        path: "/dashboard",
        name: "dashboard",
        component: DashboardComponent,
        meta: { title: "Dashboard" },
        beforeEnter: authenticationGuard
    },
    {
        path: "/design-lab",
        name: "design-lab",
        component: DesignLabComponent,
        meta: { title: "Design Lab" },
        beforeEnter: authenticationGuard
    },
    {
        path: "/design-lab/new",
        name: "create-project",
        component: CreateProjectComponent,
        meta: { title: "Create Project" },
        beforeEnter: authenticationGuard
    },
    {
        path: "/design-lab/:id",
        name: "project-detail",
        component: ProjectDetailComponent,
        meta: { title: "Project Detail" },
        beforeEnter: authenticationGuard
    },
    {
        path: "/profile",
        name: "profile",
        component: ProfileComponent,
        meta: { title: "Profile" },
        beforeEnter: authenticationGuard
    },
    {
        path: "/shopping-cart",
        name: "shopping-cart",
        component: ShoppingCartComponent,
        meta: { title: "Shopping Cart" },
        beforeEnter: authenticationGuard
    },
    {
        path: "/explore",
        name: "explore",
        component: ExplorePageComponent,
        meta: { title: "Explore" },
        beforeEnter: authenticationGuard
    },
    {
        path: "/manufacturer-orders",
        name: "manufacturer-orders",
        component: ManufacturerOrdersPageComponent,
        meta: { 
            title: "Order Management"
        },
        beforeEnter: authenticationGuard
    },
    
    // 🔄 Default redirects
    { 
        path: "/", 
        name: "default", 
        redirect: "/sign-in" 
    },
    { 
        path: "/:pathMatch(.*)*", 
        name: "not-found", 
        redirect: "/sign-in" 
    }
];

const router = createRouter({
    history: createWebHistory(import.meta.BASE_URL),
    routes: routes,
});

// Global navigation guard for page titles
router.beforeEach((to, from, next) => {
    let baseTitle = "Q2";
    document.title = `${baseTitle} | ${to.meta["title"]}`;
    next();
});

export default router;
