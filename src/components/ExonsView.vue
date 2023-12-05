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
  mounted: function () {
    this.main();
  },
  methods: {
    main() {
      console.log(this.response.selector_short);
      this.getExons();
      var width = 600;
      var height = 600;
      var svg = d3
        .select("#svgcontainer")
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g");

      // svg
      //   .append("rect")
      //   .attr("x", 0)
      //   .attr("y", 0)
      //   .attr("width", 500)
      //   .attr("height", 400)
      //   .style("fill", "red");
      // svg
      //   .append("line")
      //   .attr("x1", 100)
      //   .attr("y1", 100)
      //   .attr("x2", 600)
      //   .attr("y2", 100)
      //   .style("stroke", "rgb(255,255,0)")
      //   .style("stroke-width", 2);
      // svg
      //   .append("text")
      //   .text(this.response.selector_short.exons.g)
      //   .attr("x", 20)
      //   .attr("y", 40);
      svg.append("text").text(this.getExons()).attr("x", 20).attr("y", 20);
      svg.append("text").text(this.getCds()).attr("x", 20).attr("y", 40);
      // let features = this.getFeatures();

      let features2 = this.getFeatures2();
      let rows = this.getRows(600, features2);

      let y = 60;
      let x = 0;
      let f_height = 40;
      for (let row of rows) {
        for (let f of row) {
          console.log(f);
          console.log(f.size);
          if (f.type == "feature") {
            svg
              .append("rect")
              .attr("id", "exon" + f.exon_index)
              .attr("x", x)
              .attr("y", y)
              .attr("width", f.size)
              .attr("height", f_height)
              .style("fill", "blue")
              .on("mouseover", function () {
                d3.selectAll("#exon" + f.exon_index).style("fill", "red");
              })
              .on("mouseout", function () {
                d3.selectAll("#exon" + f.exon_index).style("fill", "blue");
              });
            svg
              .append("text")
              .text(f.exon_index)
              .attr("x", x + f.size / 2)
              .attr("y", y + f_height / 1.6)
              .style("text-anchor", "middle")
              .style("fill", "white");
            if (f.part) {
              console.log("we should check the part type");
            } else {
              if (features2[f.exon_index].phase_start) {
                console.log("we should add the phase");
              }
            }
          }
          x += f.size;
        }
        y += 60;
        x = 0;
      }

      // let x = 0;
      // let x_l = 600;
      // let y = 60;
      // let previous_feature = "";
      // for (let f of features) {
      //   // console.log(f);
      //   let f_size = f[1] - f[0];
      //   // console.log(f_size);
      //   let x_offset = 20;
      //   if (previous_feature == "exon" && f[2] == "cds") {
      //     x_offset = 0;
      //   }
      //   previous_feature = f[2];
      //   if (f_size > x_l - x) {
      //     console.log("does not fit");
      //   } else {
      //     let f_height = 50;
      //     let y_offset = 0;
      //     if (f[2] == "exon") {
      //       f_height = 30;
      //       y_offset = 10;
      //     }
      //     svg
      //       .append("rect")
      //       .attr("x", x + x_offset)
      //       .attr("y", y + y_offset)
      //       .attr("width", f_size)
      //       .attr("height", f_height)
      //       .style("fill", "blue")
      //       .on("mouseover", function () {
      //         d3.select(this).style("fill", "red");
      //       })
      //       .on("mouseout", function () {
      //         d3.select(this).style("fill", "blue");
      //       });
      //   }
      //   x = x + f_size + x_offset;
      // }
      // svg
      //   .append("text")
      //   .text(features)
      //   .attr("x", 20)
      //   .attr("y", y + 100);
      // svg
      //   .append("polygon")
      //   .attr(
      //     "points",
      //     "0,190 50,190 50,170 150,170 150,230 50,230 50,210 0,210"
      //   )
      //   .style("fill", "blue")
      //   .on("mouseover", function () {
      //     d3.select(this).style("fill", "red");
      //   })
      //   .on("mouseout", function () {
      //     d3.select(this).style("fill", "blue");
      //   });
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
      console.log("-----");
      let exons = this.getExons();
      let cds = this.getCds();
      // let exons = [
      //   [0, 100],
      //   [200, 300],
      // ];
      // let cds = [99, 204];
      let features = [];
      for (let e of exons) {
        // console.log(e, cds);
        if (e[0] <= cds[0] && e[1] < cds[0]) {
          // console.log("cds after exon");
          features.push([e[0], e[1], "exon"]);
        } else if (e[0] <= cds[0] && e[1] < cds[1]) {
          // console.log("cds start within exon");
          features.push([e[0], cds[0], "exon"]);
          features.push([cds[0], e[1], "cds"]);
        } else if (e[1] > cds[0] && e[1] < cds[1]) {
          // console.log("exon within cds");
          features.push([e[0], e[1], "cds"]);
        } else if (e[0] < cds[1] && e[1] > cds[0]) {
          // console.log("cds end within exon");
          features.push([e[0], cds[1], "cds"]);
          features.push([cds[1], e[1], "exon"]);
        } else if (e[0] > cds[1] && e[1] > cds[1]) {
          // console.log("cds end before exon");
          features.push([e[0], e[1], "exon"]);
        }
      }
      return features;
    },
    getFeatures2() {
      let exons = this.getExons();
      let cds = this.getCds();
      let features = [];
      var previous_phase = 0;
      for (let e of exons) {
        var feature_type = "noncoding";
        var phase = 0;
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
      let gap = 20;
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
