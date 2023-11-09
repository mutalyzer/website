<template>
  <div>
    <v-btn icon color="primary" @click="getSvg">
      <v-icon>mdi-download</v-icon>
    </v-btn>
    <v-btn icon color="primary" @click="resetGraph">
      <v-icon>mdi-arrow-expand-all</v-icon>
    </v-btn>
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
    window.addEventListener("resize", this.handleResize);
  },
  beforeDestroy: function () {
    window.removeEventListener("resize", this.handleResize);
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
    handleResize() {
      if (document.getElementById("dot-graph")) {
        this.width =
          document.getElementById("dot-graph-container").offsetWidth - 40;
        this.drawGraph();
      }
    },
    getSvg() {
      var svg = document.getElementById("dot-graph");

      var serializer = new XMLSerializer();
      var svg_content = serializer.serializeToString(svg);
      svg_content = svg_content.substring(svg_content.indexOf(">") + 1);
      svg_content = svg_content.replace("</div>", "");

      //add name spaces.
      if (
        !svg_content.match(/^<svg[^>]+xmlns="http:\/\/www\.w3\.org\/2000\/svg"/)
      ) {
        svg_content = svg_content.replace(
          /^<svg/,
          '<svg xmlns="http://www.w3.org/2000/svg"'
        );
      }
      if (
        !svg_content.match(/^<svg[^>]+"http:\/\/www\.w3\.org\/1999\/xlink"/)
      ) {
        svg_content = svg_content.replace(
          /^<svg/,
          '<svg xmlns:xlink="http://www.w3.org/1999/xlink"'
        );
      }

      //add xml declaration
      svg_content = '<?xml version="1.0" standalone="no"?>\r\n' + svg_content;

      var outputContent =
        "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg_content);

      var download_link = document.createElement("a");
      download_link.setAttribute("href", outputContent);
      download_link.setAttribute("download", "graph.svg");
      document.body.appendChild(download_link);
      download_link.click();
    },
    resetGraph() {
      graphviz("#dot-graph").resetZoom();
    },
  },
};
</script>
