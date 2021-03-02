import Vue from "vue";
import vuetify from "./plugins/vuetify";
import "./plugins/axios";
import router from "./router";
import store from "./store";
import App from "./App.vue";
import "./assets/main.css";
import Clipboard from "v-clipboard";
Vue.use(Clipboard);

Vue.config.productionTip = false;

new Vue({
  router,
  store,
  vuetify,
  render: (h) => h(App),
}).$mount("#app");
