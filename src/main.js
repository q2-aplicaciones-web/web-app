import { createApp } from "vue";
import "./style.css";
import App from "./app.vue";
import { PrimeVue } from "@primevue/core";
import "primeflex/primeflex.css";
import "primeicons/primeicons.css";
import Aura from "@primeuix/themes/aura";
import router from "./router/index.js";
import ToastService from "primevue/toastservice";

const app = createApp(App)
    .use(router)
    .use(PrimeVue, { ripple: true, theme: { preset: Aura } })
    .use(ToastService);

app.mount("#app");
