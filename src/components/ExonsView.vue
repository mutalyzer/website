<template>
  <div>
    <div id="svgcontainer"></div>
  </div>
</template>

<script>
import * as d3 from "d3";

export default {
  name: "ExonsView",
  props: {
    response: null,
  },
  data: () => ({
    color_out: "#1565C0",
    color_on: "#0D47A1",
  }),
  mounted: function () {
    this.draw();
  },
  methods: {
    draw() {
      this.getExons();
      var width = 600;
      var height = 600;
      var svg = d3
        .select("#svgcontainer")
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g");

      let features = this.getFeatures();
      let rows = this.getRows(600, features);

      let y = 20;
      let x = 0;
      let f_height = 40;

      let color_out = "#1976D2";
      let color_on = "#0D47A1";
      console.log("======");
      for (let row of rows) {
        console.log("-------");
        for (let f of row) {
          if (f.type == "feature") {
            let exon = features[f.exon_index];
            svg
              .append("rect")
              .attr("id", "exon" + f.exon_index)
              .attr("x", x)
              .attr("y", y)
              .attr("width", f.size)
              .attr("height", f_height)
              .style("fill", color_out)
              .on("mouseover", function () {
                d3.selectAll("#exon" + f.exon_index)
                  .transition()
                  .duration(200)
                  .style("cursor", "pointer")
                  .style("fill", color_on);
              })
              .on("mouseout", function () {
                d3.selectAll("#exon" + f.exon_index)
                  .transition()
                  .duration(200)
                  .style("cursor", "default")
                  .style("fill", color_out);
              });
            svg
              .append("text")
              .text(f.exon_index)
              .attr("x", x + f.size / 2)
              .attr("y", y + f_height / 1.6)
              .style("text-anchor", "middle")
              .style("fill", "white")
              .on("mouseover", function () {
                d3.selectAll("#exon" + f.exon_index)
                  .transition()
                  .duration(200)
                  .style("cursor", "pointer")
                  .style("fill", color_on);
              })
              .on("mouseout", function () {
                d3.selectAll("#exon" + f.exon_index)
                  .transition()
                  .duration(200)
                  .style("cursor", "default")
                  .style("fill", color_out);
              });
            if ("part" in exon) {
              console.log("we should check the part type");
            } else {
              if ("phase_start" in exon) {
                if (exon.phase_start == 1) {
                  svg
                    .append("polygon")
                    .attr("points", [
                      [x - 10, y],
                      [x, y],
                      [x, y + f_height],
                      [x - 10, y + f_height],
                      [x, y + f_height / 2],
                    ])
                    .style("fill", this.color_out)
                    .style("opacity", 0.7);
                } else if (exon.phase_start == 2) {
                  svg
                    .append("polygon")
                    .attr("points", [
                      [x, y],
                      [x - 10, y + f_height / 2],
                      [x, y + f_height],
                    ])
                    .style("fill", this.color_out)
                    .style("opacity", 0.7);
                }
              }
              if ("phase_end" in exon) {
                if (exon.phase_end == 1) {
                  svg
                    .append("polygon")
                    .attr("points", [
                      [x + f.size, y],
                      [x + f.size + 10, y + f_height / 2],
                      [x + f.size, y + f_height],
                    ])
                    .style("fill", this.color_out)
                    .style("opacity", 0.7);
                } else if (exon.phase_end == 2) {
                  svg
                    .append("polygon")
                    .attr("points", [
                      [x + f.size, y],
                      [x + f.size + 10, y],
                      [x + f.size + 5, y + f_height / 2],
                      [x + f.size + 10, y + f_height],
                      [x + f.size, y + f_height],
                    ])
                    .style("fill", this.color_out)
                    .style("opacity", 0.7);
                }
              }
            }
          }
          x += f.size;
        }
        y += 60;
        x = 0;
      }
    },
    getExons() {
      let exons = [];
      for (let e of this.response.selector_short.exon.g) {
        exons.push([parseInt(e[0]) - 1, parseInt(e[1])]);
      }
      return exons;
    },
    getCds() {
      let cds = [];
      for (let e of this.response.selector_short.cds.g) {
        cds.push([parseInt(e[0]), parseInt(e[1])]);
      }
      cds = [cds[0][0] - 1, cds[0][1]];
      return cds;
    },
    getFeatures() {
      let exons = this.getExons();
      let cds = this.getCds();
      let features = [];
      let previous_phase = 0;
      for (let e of exons) {
        let feature_type = "noncoding";
        let phase = 0;
        if (e[0] <= cds[0] && e[1] < cds[1]) {
          feature_type = "coding_start";
          phase = (e[1] - cds[0]) % 3;
        } else if (e[1] > cds[0] && e[1] < cds[1]) {
          feature_type = "coding";
          phase = (previous_phase + e[1] - e[0]) % 3;
        } else if (e[0] < cds[1] && e[1] > cds[0]) {
          feature_type = "coding_end";
          phase = (previous_phase + cds[1] - e[0]) % 3;
        } else if (e[0] < cds[1] && e[1] > cds[1]) {
          feature_type = "coding_within_exon";
          phase = (cds[1] - cds[0]) % 3;
        }
        features.push({
          exon_start: e[0],
          exon_end: e[1],
          type: feature_type,
          phase_start: previous_phase,
          phase_end: phase,
        });
        previous_phase = phase;
      }
      return features;
    },
    getRows(width, features) {
      console.log("-----");
      let gap = 30;
      let row_width = 0;
      let remaining = width - row_width;
      let rows = [];
      let row = [];

      for (const [i, f] of features.entries()) {
        let f_size = f.exon_end - f.exon_start;
        if (remaining - f_size > 0) {
          // Fits
          remaining -= f_size;
          row.push({ size: f_size, type: "feature", exon_index: i });
        } else {
          // Does not fit
          row.push({
            size: remaining,
            type: "feature",
            exon_index: i,
            part: "start",
          });
          rows.push(row);
          let extra_rows = Math.floor((f_size - remaining) / width);
          for (let j = 0; j < extra_rows; j += 1) {
            rows.push([
              { size: width, type: "feature", exon_index: i, part: "between" },
            ]);
          }
          row = [
            {
              size: f_size - remaining - extra_rows * width,
              type: "feature",
              exon_index: i,
              part: "end",
            },
          ];
          remaining = width - (f_size - remaining - extra_rows * width);
        }
        if (remaining > gap) {
          remaining -= gap;
          row.push({ size: gap, feature: "gap" });
        } else {
          rows.push(row);
          row = [];
        }
      }
      if (row) {
        rows.push(row);
      }
      return rows;
    },
  },
};
</script>
<style scoped src="../assets/main.css"></style>
<style lang="scss" scoped>
.protein-description {
  text-decoration: none;
  margin: 0;
  padding: 2px;
  font-family: monospace;
  display: inline;

  color: #004d40;
  background-color: #ffffff;
  padding-left: 10px;
  padding-right: 10px;
  padding-top: 5px;
  padding-bottom: 5px;
}

.protein-seq {
  margin-left: 5px;
  padding: 10px;
  text-decoration: none;
  font-family: monospace;
  display: block;
  color: #004d40;
  background-color: #efefef;
  overflow-wrap: break-word;
}

.protein-equal {
  margin: 0;
  padding: 0;
  text-decoration: none;
  font-family: monospace;
  display: inline;
  color: #000000;
  overflow-wrap: break-word;
}

.protein-diff {
  margin: 0;
  padding: 0;
  text-decoration: none;
  font-family: monospace;
  display: inline;
  font-weight: bold;
  color: #990000;
  overflow-wrap: break-word;
}
</style>
