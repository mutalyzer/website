import Vue from "vue";
import VueRouter from "vue-router";
import Home from "../views/Home.vue";
import About from "../views/About.vue";
import Normalizer from "../views/Normalizer.vue";
import NormalizerAlt from "../views/NormalizerAlt.vue";
import PositionConverter from "../views/PositionConverter.vue";
import DescriptionExtractor from "../views/DescriptionExtractor.vue";
import Mapper from "../views/Mapper.vue";
import BatchProcessor from "../views/BatchProcessor.vue";
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
    path: "/normalizer/:descriptionRouter?",
    props: true,
    name: "Normalizer",
    component: Normalizer,
  },
  {
    path: "/normalizeralt/:descriptionRouter?",
    props: true,
    name: "NormalizerAlt",
    component: NormalizerAlt,
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
    path: "/batchprocessor",
    props: true,
    name: "BatchProcessor",
    component: BatchProcessor,
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
