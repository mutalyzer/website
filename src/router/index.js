import Vue from "vue";
import VueRouter from "vue-router";
import Home from "../views/Home.vue";
import About from "../views/About.vue";
import NameChecker from "../views/NameChecker.vue";
import PositionConverter from "../views/PositionConverter.vue";
import DescriptionExtractor from "../views/DescriptionExtractor.vue";

Vue.use(VueRouter);

const routes = [
  {
    path: "/",
    name: "Home",
    component: Home,
  },
  {
    path: "/about",
    name: "About",
    component: About,
  },
  {
    path: "/namechecker/:descriptionRouter?",
    props: true,
    name: "NameChecker",
    component: NameChecker,
  },
  {
    path: "/positionconverter",
    name: "PositionConverter",
    component: PositionConverter,
    // Re-add the lazy loading stuff
  },
  {
    path: "/descriptionextractor",
    name: "DescriptionExtractor",
    component: DescriptionExtractor,
  },
  {
    path: "/api",
  },
  {
    path: "*",
    name: "catchAll",
    component: Home,
  },
];

const router = new VueRouter({
  mode: "history",
  base: process.env.BASE_URL,
  routes,
});

export default router;
