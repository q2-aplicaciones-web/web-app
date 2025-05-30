import HomeComponent from "../public/pages/home.component.vue";
import { createRouter, createWebHistory } from "vue-router";
import CreateProjectComponent from "../design-lab/components/create-project.component.vue";
import DashboardComponent from "../public/pages/dashboard.component.vue";

const DesignLabComponent = () =>
    import("../public/pages/design-lab.component.vue");
const ProjectDetailComponent = () =>
    import("../design-lab/components/project-detail.component.vue");
const ProfileComponent = () =>
    import("../public/pages/profile.component.vue");

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
    { path: "/", name: "default", redirect: "/home" },
];

const router = createRouter({
    history: createWebHistory(import.meta.BASE_URL),
    routes: routes,
});

router.beforeEach((to, from, next) => {
    let baseTitle = "Q2";
    document.title = `${baseTitle} | ${to.meta["title"]}`;
    next();
});

export default router;
