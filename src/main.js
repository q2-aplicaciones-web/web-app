import { createApp } from "vue";
import "./style.css";
import App from "./App.vue";
import { PrimeVue } from "@primevue/core";
import "primeflex/primeflex.css";
import "primeicons/primeicons.css";
import Aura from "@primeuix/themes/aura";
import router from "./router/index.js";
import { i18n } from "./i18n.js";
import ToastService from "primevue/toastservice";
import Toast from "primevue/toast";
import Tooltip from "primevue/tooltip";

const app = createApp(App)
    .use(router)
    .use(i18n)
    .use(PrimeVue, { ripple: true, theme: { preset: Aura } })
    .use(ToastService);

// Register Toast component globally
app.component('Toast', Toast);

// Register Tooltip directive globally
app.directive('tooltip', Tooltip);

app.mount("#app");
