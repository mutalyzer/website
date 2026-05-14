import { createApp } from "vue";
import vuetify from "./plugins/vuetify";
import router from "./router";
import App from "./App.vue";
import "./assets/main.css";

createApp(App).use(router).use(vuetify).mount("#app");
