import { createApp } from "vue";
import { createPinia } from "pinia";

import axios from "axios";

import App from "./App.vue";
import router from "./router";

// Event bus listeners
import "./eventBus/listeners/index";

import VueGtagPlugin from "vue-gtag";

import "./assets/main.css";
import "vue3-openlayers/styles.css";

import i18n, { SUPPORT_LOCALES } from "./locales/i18n";
import { ThemePlugin } from "./themes/useTheme";
import { gatePlugin } from "@m-media/vue3-gate-keeper";

import gates from "./router/gates";
import { metaTagPlugin } from "@m-media/vue3-meta-tags";
import { EventsPlugin } from "./eventBus/events";
import { useUserStore } from "./stores/user";

const app = createApp(App);

axios.defaults.withXSRFToken = true;
axios.defaults.withCredentials = true;
// Set accept header
axios.defaults.headers.common["X-Requested-With"] = "XMLHttpRequest";
axios.defaults.baseURL = import.meta.env.VITE_API_URL;

app.use(createPinia());
app.use(router);
app.use(i18n);

app.use(
  gatePlugin,
  {
    gateInstances: gates,
  },
  router
);

app.use(
  metaTagPlugin,
  {
    defaultName: import.meta.env.VITE_APP_NAME,
    defaultLocale: i18n.global.locale.value,
    locales: SUPPORT_LOCALES,
    preconnect: [
      import.meta.env.VITE_API_URL,
      "https://js.stripe.com",
      "https://hooks.stripe.com",
      "https://api.stripe.com",
      "https://www.googletagmanager.com",
    ],
    textCallback: (text: string) => {
      return i18n.global.t(text);
    },
  },
  router
);

app.use(
  VueGtagPlugin,
  {
    enabled: import.meta.env.PROD,
    bootstrap: import.meta.env.PROD,
    appName: import.meta.env.VITE_APP_NAME,
    config: { id: import.meta.env.VITE_GA_MEASUREMENT_ID },
    pageTrackerEnabled: false,
  },
  router
);

app.use(EventsPlugin);

app.use(ThemePlugin);

// Intercept axios 401 response and redirect to login
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    console.log(
      error.request,
      error.response,
      error.config.url,
      router.currentRoute.value.fullPath
    );
    if (error.response?.status === 403) {
      alert("You are not allowed to do this action.");
      // Go back one page
      router.go(-1);
    }

    if (error.response?.status === 401 && error.config.url !== "api/user") {
      // Set the userStore isAuthenticated to false
      const userStore = useUserStore();
      userStore.isAuthenticated = false;
      router.push({
        name: "login",
      });
    }
    return Promise.reject(error);
  }
);

app.mount("#app");
