<template>
  <div>
    <div id="svgcontainer"></div>
    <div id="exontip" class="hidden">
      <p>
        <strong>Exon <span id="exonnumber"></span></strong>
      </p>
      <p><span id="exonstart"></span> - <span id="exonend"></span></p>
    </div>
    <div id="phasetip" class="hidden">
      <p>
        <strong>Phase</strong>
      </p>
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
    draw() {
      this.getExons();
      var width = 700;
      var height = 800;
      let feature_height = 40;
      let gap = 30;
      let feature_min = 50;
      var svg = d3
        .select("#svgcontainer")
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g");

      let exons = this.getFeatures();
      let cds = this.getCds();
      let features = this.render(
        exons,
        cds,
        width,
        gap,
        feature_min,
        feature_height
      );

      // let color_out = "#1976D2";
      let color_out = "#0D47A1";
      // let color_on = "#0D47A1";
      let color_phase = "#FFCC80";

      for (let f of features) {
        console.log(f);
        let exon = exons[f.exon_index];
        let y_offset = 0;
        let height_offset = 0;
        if (f.type == "noncoding") {
          y_offset = feature_height / 4;
          height_offset = feature_height / 2;
        }
        // exons
        svg
          .append("rect")
          .attr("id", "exon_" + f.exon_index)
          .attr("x", f.x)
          .attr("y", f.y + y_offset)
          .attr("width", f.size)
          .attr("height", feature_height - height_offset)
          .style("fill", color_out)
          .style("opacity", 0.8)
          .on("mouseover", function () {
            d3.selectAll("#exon_" + f.exon_index)
              .transition()
              .duration(200)
              .style("cursor", "pointer")
              .style("opacity", 1);
            // Update Exontip's position and text
            d3.select("#exontip").select("#exonnumber").text(f.exon_index);
            d3.select("#exontip").select("#exonstart").text(exon.exon_start);
            d3.select("#exontip").select("#exonend").text(exon.exon_end);
            d3.select("#exontip").classed("hidden", false);
            var xPos =
              parseFloat(d3.select(this).attr("x")) +
              f.size / 2 -
              d3.select("#exontip").node().getBoundingClientRect().width / 3;
            var yPos =
              parseFloat(d3.select(this).attr("y")) + feature_height / 2;
            d3.select("#exontip")
              .style("left", xPos + "px")
              .style("top", yPos + "px");
          })
          .on("mouseout", function () {
            d3.selectAll("#exon_" + f.exon_index)
              .transition()
              .duration(200)
              .style("cursor", "default")
              .style("fill", color_out)
              .style("opacity", 0.8);
            d3.select("#exontip").classed("hidden", true);
          });

        // phasing rectangles
        // exon end
        if (f.phase_end) {
          svg
            .append("rect")
            .attr("id", "exon_phase_" + f.exon_index)
            .attr("x", f.x + f.size - 7)
            .attr("y", f.y + 2)
            .attr("width", 5)
            .attr("height", f.height - 4)
            .style("fill", color_phase)
            .style("opacity", 0.5)
            .on("mouseover", function () {
              d3.selectAll("#exon_phase_" + f.exon_index)
                .transition()
                .duration(200)
                .style("cursor", "pointer")
                .style("opacity", 1);
              // Update Exontip's position and text
              d3.select("#phasetip").classed("hidden", false);
              var xPos =
                parseFloat(d3.select(this).attr("x")) +
                5 -
                d3.select("#phasetip").node().getBoundingClientRect().width / 3;
              var yPos = parseFloat(d3.select(this).attr("y")) + feature_height;
              d3.select("#phasetip")
                .style("left", xPos + "px")
                .style("top", yPos + "px");
            })
            .on("mouseout", function () {
              d3.selectAll("#exon_phase_" + f.exon_index)
                .transition()
                .duration(200)
                .style("cursor", "default")
                .style("opacity", 0.5);
              d3.select("#phasetip").classed("hidden", true);
            });
        }
        if (f.phase_end == 2) {
          svg
            .append("rect")
            .attr("id", "exon_phase_" + f.exon_index)
            .attr("x", f.x + f.size - 14)
            .attr("y", f.y + 2)
            .attr("width", 5)
            .attr("height", f.height - 4)
            .style("fill", color_phase)
            .style("opacity", 0.5)
            .on("mouseover", function () {
              d3.selectAll("#exon_phase_" + f.exon_index)
                .transition()
                .duration(200)
                .style("cursor", "pointer")
                .style("opacity", 1);
              // Update Exontip's position and text
              d3.select("#phasetip").classed("hidden", false);
              var xPos =
                parseFloat(d3.select(this).attr("x")) +
                5 -
                d3.select("#phasetip").node().getBoundingClientRect().width / 3;
              var yPos = parseFloat(d3.select(this).attr("y")) + feature_height;
              d3.select("#phasetip")
                .style("left", xPos + "px")
                .style("top", yPos + "px");
            })
            .on("mouseout", function () {
              d3.selectAll("#exon_phase_" + f.exon_index)
                .transition()
                .duration(200)
                .style("cursor", "default")
                .style("opacity", 0.5);
              d3.select("#phasetip").classed("hidden", true);
            });
        }
        // exon start
        if (f.phase_start) {
          svg
            .append("rect")
            .attr("id", "exon_phase_" + (f.exon_index - 1))
            .attr("x", f.x + 2)
            .attr("y", f.y + 2)
            .attr("width", 5)
            .attr("height", f.height - 4)
            .style("fill", color_phase)
            .style("opacity", 0.5)
            .on("mouseover", function () {
              d3.selectAll("#exon_phase_" + (f.exon_index - 1))
                .transition()
                .duration(200)
                .style("cursor", "pointer")
                .style("opacity", 1);
              // Update Exontip's position and text
              d3.select("#phasetip").classed("hidden", false);
              var xPos =
                parseFloat(d3.select(this).attr("x")) +
                5 -
                d3.select("#phasetip").node().getBoundingClientRect().width / 3;
              var yPos = parseFloat(d3.select(this).attr("y")) + feature_height;
              d3.select("#phasetip")
                .style("left", xPos + "px")
                .style("top", yPos + "px");
            })
            .on("mouseout", function () {
              d3.selectAll("#exon_phase_" + (f.exon_index - 1))
                .transition()
                .duration(200)
                .style("cursor", "default")
                .style("opacity", 0.5);
              d3.select("#phasetip").classed("hidden", true);
            });
        }
        if (f.phase_start == 2) {
          svg
            .append("rect")
            .attr("id", "exon_phase_" + (f.exon_index - 1))
            .attr("x", f.x + 9)
            .attr("y", f.y + 2)
            .attr("width", 5)
            .attr("height", f.height - 4)
            .style("fill", color_phase)
            .style("opacity", 0.5)
            .on("mouseover", function () {
              d3.selectAll("#exon_phase_" + (f.exon_index - 1))
                .transition()
                .duration(200)
                .style("cursor", "pointer")
                .style("opacity", 1);
              // Update Exontip's position and text
              d3.select("#phasetip").classed("hidden", false);
              var xPos =
                parseFloat(d3.select(this).attr("x")) +
                5 -
                d3.select("#phasetip").node().getBoundingClientRect().width / 3;
              var yPos = parseFloat(d3.select(this).attr("y")) + feature_height;
              d3.select("#phasetip")
                .style("left", xPos + "px")
                .style("top", yPos + "px");
            })
            .on("mouseout", function () {
              d3.selectAll("#exon_phase_" + (f.exon_index - 1))
                .transition()
                .duration(200)
                .style("cursor", "default")
                .style("opacity", 0.5);
              d3.select("#phasetip").classed("hidden", true);
            });
        }
        // text
        svg
          .append("text")
          .text(f.exon_index)
          .attr("x", f.x + f.size / 2)
          .attr("y", f.y + f.height / 1.6)
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
    render(exons, cds, width, gap, feature_min, feature_height) {
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
            let feature = {};

            // split into coding and noncoding
            if (["coding_start", "coding_end"].includes(exon.type)) {
              let coding_size = scale * (cds[0] - exon.exon_start);
              if (exon.type == "coding_end") {
                coding_size = scale * (cds[1] - exon.exon_start);
              }
              features.push({
                x: width - remaining,
                y: y,
                size: size - coding_size,
                exon_index: i,
                type: "noncoding",
                height: feature_height,
              });
              feature = {
                x: width - remaining + (size - coding_size),
                y: y,
                size: coding_size,
                exon_index: i,
                type: "coding",
                height: feature_height,
              };
            } else {
              feature = {
                x: width - remaining,
                y: y,
                size: size,
                exon_index: i,
                height: feature_height,
                type: exon.type,
              };
            }
            // adding phasing information
            this.addPhasingStart(exon, feature);
            this.addPhasingEnd(exon, feature);

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

            if (exon.type == "coding_end") {
              // the coding part
              let coding_size = scale * (cds[1] - exon.exon_start);
              let s = this.splitFeature(
                i,
                width,
                gap,
                feature_min,
                feature_height,
                coding_size,
                remaining,
                y,
                "coding"
              );
              // adding phasing information
              this.addPhasingStart(exon, s.features[0]);
              this.addPhasingEnd(exon, s.features[s.features.length - 1]);

              features.push(...s.features);
              smallers.push(...s.smallers);
              remaining = s.remaining;
              y = s.y;

              // the noncoding part
              s = this.splitFeature(
                i,
                width,
                gap,
                feature_min,
                feature_height,
                size - coding_size,
                remaining,
                y,
                "noncoding"
              );
              features.push(...s.features);
              smallers.push(...s.smallers);
              remaining = s.remaining;
              y = s.y;
            } else if (exon.type == "coding") {
              let s = this.splitFeature(
                i,
                width,
                gap,
                feature_min,
                feature_height,
                size,
                remaining,
                y,
                "coding"
              );

              // adding phasing information
              this.addPhasingStart(exon, s.features[0]);
              this.addPhasingEnd(exon, s.features[s.features.length - 1]);

              features.push(...s.features);
              smallers.push(...s.smallers);
              remaining = s.remaining;
              y = s.y;
            } else {
              let splitted = this.splitFeature(
                i,
                width,
                gap,
                feature_min,
                feature_height,
                size,
                remaining,
                y,
                "noncoding"
              );
              features.push(...splitted.features);
              smallers.push(...splitted.smallers);
              remaining = splitted.remaining;
              y = splitted.y;
            }
            // update remaining
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
    splitFeature(
      i,
      width,
      gap,
      feature_min,
      feature_height,
      size,
      remaining,
      y,
      feature_type
    ) {
      let features = [];
      let smallers = [];
      // check first if the feature part size is readable
      if (size < feature_min) {
        smallers.push([i, size]);
      }

      // push the part to fit the current row
      console.log("push x", width - remaining, "y", y);
      features.push({
        x: width - remaining,
        y: y,
        size: remaining,
        exon_index: i,
        height: feature_height,
        type: feature_type,
      });

      // push the parts for other complete rows
      let extra_rows = Math.floor((size - remaining) / width);
      for (let j = 0; j < extra_rows; j += 1) {
        y += feature_height + gap;
        features.push({
          x: 0,
          y: y,
          size: width,
          exon_index: i,
          height: feature_height,
          type: feature_type,
        });
      }
      y += feature_height + gap;

      size = size - remaining - extra_rows * width;
      if (size < feature_min) {
        smallers.push([i, size]);
      }
      // push whatever remains on the last row
      console.log("push x", 0, "y", y, "size", size);

      features.push({
        x: 0,
        y: y,
        size: size,
        exon_index: i,
        height: feature_height,
        type: feature_type,
      });

      // update remaining
      remaining = width - size;

      return {
        features: features,
        smallers: smallers,
        remaining: remaining,
        y: y,
      };
    },
    addPhasingStart(exon, feature) {
      if (["coding_end", "coding"].includes(exon.type)) {
        if ([1, 2].includes(exon.phase_start)) {
          if (exon.phase_start == 1) {
            feature["phase_start"] = 2;
          } else if (exon.phase_start == 2) {
            feature["phase_start"] = 1;
          }
        }
      }
    },
    addPhasingEnd(exon, feature) {
      if (["coding_start", "coding"].includes(exon.type)) {
        if ([1, 2].includes(exon.phase_end)) {
          feature["phase_end"] = exon.phase_end;
        }
      }
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

#exontip {
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
#exontip.hidden {
  display: none;
}
#exontip p {
  margin: 0;
  font-family: sans-serif;
  font-size: 16px;
  line-height: 20px;
}
#phasetip {
  position: absolute;
  width: auto;
  height: auto;
  padding: 10px;
  background-color: #ffcc80;
  -webkit-border-radius: 5px;
  -moz-border-radius: 5px;
  border-radius: 5px;
  -webkit-box-shadow: 4px 4px 10px rgba(0, 0, 0, 0.4);
  -moz-box-shadow: 4px 4px 10px rgba(0, 0, 0, 0.4);
  box-shadow: 4px 4px 10px rgba(0, 0, 0, 0.4);
  pointer-events: none;
}
#phasetip.hidden {
  display: none;
}
#phasetip p {
  margin: 0;
  font-family: sans-serif;
  font-size: 16px;
  line-height: 20px;
}
</style>
