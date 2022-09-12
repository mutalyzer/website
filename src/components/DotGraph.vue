<template>
  <div>
    <div id="dot-graph" style="text-align: center; display: inline-block"></div>
  </div>
</template>

<script>
import { graphviz } from "d3-graphviz";

export default {
  name: "DotGraph",
  props: {
    data: null,
  },
  mounted() {
    graphviz("#dot-graph").dot(this.data).render();
  },
};
</script>
