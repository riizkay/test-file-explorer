import { createApp } from "vue";

import App from "./App.vue";
import { MotionPlugin } from "@vueuse/motion";

import { createVuetify } from "vuetify";

import "vuetify/styles"; // Import styles
import "./style.css";
import "vuetify/styles";
import "@mdi/font/css/materialdesignicons.css";
import * as components from "vuetify/components"; // Import all Vuetify components
import * as directives from "vuetify/directives"; // Import all Vuetify directives
import Toast from "vue-toastification";
import "vue-toastification/dist/index.css";

const vuetify = createVuetify({
  components,
  directives,
});
createApp(App)
  .use(vuetify)
  .use(Toast, {})
  .use(MotionPlugin)

  .mount("#app");
