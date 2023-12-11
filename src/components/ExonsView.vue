<template>
  <div>
    <div id="svgcontainer"></div>
    <div id="tooltip" class="hidden">
      <p>
        <strong>Exon <span id="exonnumber"></span></strong>
      </p>
      <p><span id="exonstart"></span> - <span id="exonend"></span></p>
    </div>
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
    draw2() {
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
      let rows = this.getRows(250, features);
      console.log(rows);
      this.render(features, width, 30, 50, 40);

      let y = 20;
      let x = 0;
      let f_height = 40;

      let color_out = "#1976D2";
      let color_on = "#0D47A1";

      for (let row of rows) {
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

                // Update Tooltip's position and text
                d3.select("#tooltip").select("#exonnumber").text(f.exon_index);

                d3.select("#tooltip")
                  .select("#exonstart")
                  .text(exon.exon_start);

                d3.select("#tooltip").select("#exonend").text(exon.exon_end);

                d3.select("#tooltip").classed("hidden", false);

                var xPos =
                  parseFloat(d3.select(this).attr("x")) +
                  f.size / 2 -
                  d3.select("#tooltip").node().getBoundingClientRect().width /
                    3;
                var yPos = parseFloat(d3.select(this).attr("y")) + f_height / 2;

                d3.select("#tooltip")
                  .style("left", xPos + "px")
                  .style("top", yPos + "px");
              })
              .on("mouseout", function () {
                d3.selectAll("#exon" + f.exon_index)
                  .transition()
                  .duration(200)
                  .style("cursor", "default")
                  .style("fill", color_out);
                d3.select("#tooltip").classed("hidden", true);
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
                if (exon.phase_start == 0) {
                  svg
                    .append("polygon")
                    .attr("points", [
                      [x - 10, y],
                      [x, y],
                      [x, y + f_height],
                      [x - 10, y + f_height],
                    ])
                    .style("fill", this.color_out)
                    .style("opacity", 0.7);
                } else if (exon.phase_start == 1) {
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
                if (exon.phase_end == 0) {
                  svg
                    .append("polygon")
                    .attr("points", [
                      [x + f.size, y],
                      [x + f.size + 10, y],
                      [x + f.size + 10, y + f_height],
                      [x + f.size, y + f_height],
                    ])
                    .style("fill", this.color_out)
                    .style("opacity", 0.7);
                } else if (exon.phase_end == 1) {
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
    draw() {
      this.getExons();
      var width = 500;
      var height = 600;
      var svg = d3
        .select("#svgcontainer")
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g");

      let exons = this.getFeatures();
      let features = this.render(exons, width, 30, 50, 40);

      let f_height = 40;

      let color_out = "#1976D2";
      // let color_on = "#0D47A1";

      for (let f of features) {
        console.log(f);
        svg
          .append("rect")
          .attr("x", f.x)
          .attr("y", f.y)
          .attr("width", f.size)
          .attr("height", f_height)
          .style("fill", color_out);
        if (f.phase_end) {
          svg
            .append("rect")
            .attr("x", f.x + f.size - 7)
            .attr("y", f.y + 2)
            .attr("width", 5)
            .attr("height", f_height - 4)
            .style("fill", "#E3F2FD")
            .style("opacity", 0.5);
        }
        if (f.phase_end == 2) {
          svg
            .append("rect")
            .attr("x", f.x + f.size - 14)
            .attr("y", f.y + 2)
            .attr("width", 5)
            .attr("height", f_height - 4)
            .style("fill", "#E3F2FD")
            .style("opacity", 0.5);
        }
        if (f.phase_start) {
          svg
            .append("rect")
            .attr("x", f.x + 2)
            .attr("y", f.y + 2)
            .attr("width", 5)
            .attr("height", f_height - 4)
            .style("fill", "#E3F2FD")
            .style("opacity", 0.5);
        }
        if (f.phase_start == 2) {
          svg
            .append("rect")
            .attr("x", f.x + 9)
            .attr("y", f.y + 2)
            .attr("width", 5)
            .attr("height", f_height - 4)
            .style("fill", "#E3F2FD")
            .style("opacity", 0.5);
        }
        svg
          .append("text")
          .text(f.exon_index)
          .attr("x", f.x + f.size / 2)
          .attr("y", f.y + f_height / 1.6)
          .style("text-anchor", "middle")
          .style("fill", "white");
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
    render(exons, width, gap, feature_min, feature_height) {
      console.log("--- render ---");
      console.log(exons, width);
      console.log("width", width);
      console.log("gap", gap);
      console.log("feature_min", feature_min);
      console.log("feature_height", feature_height);

      let scale = 1.5;
      console.log(scale);
      let remaining = width;
      let features = [];
      let y = 0;

      let running = true;
      while (running) {
        let smallers = [];
        for (const [i, exon] of exons.entries()) {
          console.log("---");
          let size = scale * (exon.exon_end - exon.exon_start);
          console.log("exon", i, "size", size, "remaining", remaining);
          console.log(exon.type);
          console.log(exon);

          if (remaining > size) {
            // enough to fit the exon size
            console.log("push x", width - remaining, "y", y);
            // check if the exon size is readable
            if (size < feature_min) {
              smallers.push([i, size]);
            }
            let feature = {
              x: width - remaining,
              y: y,
              size: size,
              exon_index: i,
            };
            // adding phasing information
            if (["coding_start", "coding"].includes(exon.type)) {
              if ([1, 2].includes(exon.phase_end)) {
                feature["phase_end"] = exon.phase_end;
              }
            }
            if (["coding_end", "coding"].includes(exon.type)) {
              if ([1, 2].includes(exon.phase_start)) {
                if (exon.phase_start == 1) {
                  feature["phase_start"] = 2;
                } else if (exon.phase_start == 2) {
                  feature["phase_start"] = 1;
                }
              }
            }
            features.push(feature);

            // update remaining
            if (remaining - size > gap) {
              remaining -= size + gap;
              console.log("update remaining to", remaining);
            } else {
              // not enough to start another exon
              console.log("remaining smaller then the gap", remaining - size);
              y += feature_height + gap;
              remaining = width;
              console.log("update remaining to width", remaining);
            }
          } else {
            // the exon should be split
            console.log("should split");
            // check first if the exon part size is readable
            if (size < feature_min) {
              smallers.push([i, size]);
            }

            // push the part to fit the current row
            console.log("push x", width - remaining, "y", y);
            let feature = {
              x: width - remaining,
              y: y,
              size: remaining,
              exon_index: i,
            };
            // adding phasing information
            if (["coding_end", "coding"].includes(exon.type)) {
              if ([1, 2].includes(exon.phase_start)) {
                if (exon.phase_start == 1) {
                  feature["phase_start"] = 2;
                } else if (exon.phase_start == 2) {
                  feature["phase_start"] = 1;
                }
              }
            }
            features.push(feature);

            // push the parts for other complete rows
            let extra_rows = Math.floor((size - remaining) / width);
            for (let j = 0; j < extra_rows; j += 1) {
              y += feature_height + gap;
              features.push({ x: 0, y: y, size: width, exon_index: i });
            }
            y += feature_height + gap;

            size = size - remaining - extra_rows * width;
            if (size < feature_min) {
              smallers.push([i, size]);
            }
            // push whatever remains on the last row
            console.log("push x", 0, "y", y, "size", size);

            feature = {
              x: 0,
              y: y,
              size: size,
              exon_index: i,
            };
            // adding phasing information
            features.push(feature);
            if (["coding_start", "coding"].includes(exon.type)) {
              if ([1, 2].includes(exon.phase_end)) {
                feature["phase_end"] = exon.phase_end;
              }
            }

            // update remaining
            remaining = width - size;
            if (remaining > gap) {
              remaining -= gap;
            } else {
              remaining = width;
              y += feature_height + gap;
            }
            console.log("update remaining to width", remaining);
          }
        }
        console.log("\n============ smallers");
        console.log(smallers);
        console.log("============ scale");
        console.log(scale);

        // running = false;

        if (smallers.length > 0) {
          console.log("entered");
          smallers = [];
          remaining = width;
          features = [];
          y = 0;

          if (scale > 4.0) {
            running = false;
          }
          scale += 0.05;
          console.log("scale updated to ", scale);
        } else {
          running = false;
        }
      }
      console.log("============ features");
      console.log(features);
      return features;
    },
    tryRender() {},
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

#tooltip {
  position: absolute;
  width: auto;
  height: auto;
  padding: 10px;
  background-color: #e3f2fd;
  -webkit-border-radius: 5px;
  -moz-border-radius: 5px;
  border-radius: 5px;
  -webkit-box-shadow: 4px 4px 10px rgba(0, 0, 0, 0.4);
  -moz-box-shadow: 4px 4px 10px rgba(0, 0, 0, 0.4);
  box-shadow: 4px 4px 10px rgba(0, 0, 0, 0.4);
  pointer-events: none;
}
#tooltip.hidden {
  display: none;
}
#tooltip p {
  margin: 0;
  font-family: sans-serif;
  font-size: 16px;
  line-height: 20px;
}
</style>
