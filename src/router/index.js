import Vue from "vue";
import VueRouter from "vue-router";
import Home from "../views/Home.vue";
import About from "../views/About.vue";
import NameChecker from "../views/NameChecker.vue";
import PositionConverter from "../views/PositionConverter.vue";
import DescriptionExtractor from "../views/DescriptionExtractor.vue";
import Mapper from "../views/Mapper.vue";
import BatchChecker from "../views/BatchChecker.vue";
import Algebra from "../views/Algebra.vue";

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
    path: "/mapper",
    props: true,
    name: "Mapper",
    component: Mapper,
  },
  {
    path: "/batchchecker",
    props: true,
    name: "BatchChecker",
    component: BatchChecker,
  },
  {
    path: "/algebra",
    props: true,
    name: "Algebra",
    component: Algebra,
  },
  {
    path: "/api",
  },
  {
    path: "*",
    name: "catchAll",
    redirect: "/",
  },
];

const router = new VueRouter({
  mode: "history",
  base: process.env.BASE_URL,
  routes,
});

export default router;
