import { createRouter, createWebHistory } from "vue-router";
import Home from "../views/Home.vue";
import About from "../views/About.vue";
import Normalizer from "../views/Normalizer.vue";
import NormalizerAlt from "../views/NormalizerAlt.vue";
import PositionConverter from "../views/PositionConverter.vue";
import DescriptionExtractor from "../views/DescriptionExtractor.vue";
import Mapper from "../views/Mapper.vue";
import BatchProcessor from "../views/BatchProcessor.vue";
import Algebra from "../views/Algebra.vue";

const routes = [
  { path: "/", name: "Home", component: Home },
  { path: "/about", name: "About", component: About },
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
  },
  {
    path: "/descriptionextractor",
    name: "DescriptionExtractor",
    component: DescriptionExtractor,
  },
  { path: "/mapper", props: true, name: "Mapper", component: Mapper },
  {
    path: "/batchprocessor",
    props: true,
    name: "BatchProcessor",
    component: BatchProcessor,
  },
  { path: "/algebra", props: true, name: "Algebra", component: Algebra },
  { path: "/:pathMatch(.*)*", name: "catchAll", redirect: "/" },
];

export default createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});
