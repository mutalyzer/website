<template>
  <div>
    <div
      id="dot-graph"
      style="
        width: 100%;
        margin: auto;
        text-align: center;
        display: inline-block;
      "
    ></div>
  </div>
</template>

<script>
import { graphviz } from "d3-graphviz";

export default {
  name: "DotGraph",
  props: {
    dottext: null,
  },
  data: () => ({
    width: document.getElementById("dot-graph-container").offsetWidth - 40,
  }),
  mounted() {
    this.drawGraph();
  },
  methods: {
    drawGraph() {
      graphviz("#dot-graph")
        .fit(true)
        .width(this.width)
        .height(this.width / 3)
        .dot(this.dottext)
        .render();
    },
  },
};
</script>
