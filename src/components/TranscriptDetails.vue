<template>
  <div class="transcript-details">
    <!-- Strand info -->
    <div v-if="strand !== null" class="strand-section">
      <div class="strand-container">
        <div class="strand-content">
          <v-icon color="black" small>
            {{
              strand === "+" ? "mdi-arrow-right-thick" : "mdi-arrow-left-thick"
            }}
          </v-icon>
          <span class="strand-label">
            {{ strand === "+" ? "Forward strand (+)" : "Reverse strand (-)" }}
          </span>
        </div>
      </div>
    </div>

    <!-- Exons Section -->
    <div v-if="hasExonData" class="exons-section">
      <div class="section-header">
        <div class="section-header-title">Exon Positions</div>
        <div class="section-actions">
          <v-chip x-small outlined color="grey darken-1">
            {{ exonData.length }} exons
          </v-chip>
          <v-btn
            v-if="scrollTargetExon"
            x-small
            icon
            color="#b71c1c"
            title="Scroll to variant"
            class="target-btn"
            @click="scrollToExon(scrollTargetExon)"
          >
            <v-icon x-small>mdi-target</v-icon>
          </v-btn>
        </div>
      </div>
      <div ref="exonScrollContainer" class="exon-scroll-container">
        <div
          v-for="exon in exonData"
          :key="exon.number"
          :ref="'exon-' + exon.number"
          class="structure-item"
          :class="{ 'variant-affected': isExonAffected(exon.number) }"
        >
          <div class="structure-content">
            <div class="exon-number">
              <span class="exon-label">Exon</span>
              <span class="exon-value">{{ exon.number }}</span>
            </div>
            <div class="coordinates">
              <div class="coordinate-row">
                <span class="coordinate-type">Start</span>
                <span class="coordinate-label">g.</span>
                <span class="coordinate-value">{{ exon.start_g }}</span>
                <span class="coordinate-label"
                  >{{ exonCoordinateSystem }}.</span
                >
                <span class="coordinate-value">{{ exon.start_cn }}</span>
              </div>
              <div class="coordinate-row">
                <span class="coordinate-type">End</span>
                <span class="coordinate-label">g.</span>
                <span class="coordinate-value">{{ exon.end_g }}</span>
                <span class="coordinate-label"
                  >{{ exonCoordinateSystem }}.</span
                >
                <span class="coordinate-value">{{ exon.end_cn }}</span>
              </div>
            </div>
            <v-chip
              v-if="isExonAffected(exon.number)"
              x-small
              color="#b71c1c"
              text-color="white"
              class="variant-chip"
            >
              Variant
            </v-chip>
          </div>
        </div>
      </div>
    </div>

    <!-- CDS Section -->
    <div v-if="hasCdsData" class="cds-section">
      <div class="section-title">CDS (Coding Sequence)</div>
      <div
        v-for="(cds, index) in cdsData"
        :key="'cds-' + index"
        class="structure-item"
        :class="{ 'variant-affected': isCdsAffected(index) }"
      >
        <div class="structure-content">
          <div class="coordinates">
            <div class="coordinate-row">
              <span class="coordinate-type">Start</span>
              <span class="coordinate-label">g.</span>
              <span class="coordinate-value">{{ cds.start_g }}</span>
              <span class="coordinate-label">c.</span>
              <span class="coordinate-value">{{ cds.start_c }}</span>
            </div>
            <div class="coordinate-row">
              <span class="coordinate-type">End</span>
              <span class="coordinate-label">g.</span>
              <span class="coordinate-value">{{ cds.end_g }}</span>
              <span class="coordinate-label">c.</span>
              <span class="coordinate-value">{{ cds.end_c }}</span>
            </div>
          </div>
          <v-chip
            v-if="isCdsAffected(index)"
            x-small
            color="#b71c1c"
            text-color="white"
            class="variant-chip"
          >
            Variant
          </v-chip>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import converter from "../mixins/converter.js";

export default {
  name: "TranscriptDetails",
  mixins: [converter],
  props: {
    selectorShort: {
      type: Object,
      default: null,
    },
    normalizedModel: {
      type: Object,
      default: null,
    },
  },
  computed: {
    hasExonData: function () {
      if (
        this.selectorShort &&
        this.selectorShort.exon &&
        this.selectorShort.exon.g &&
        this.selectorShort.exon.g.length > 0
      ) {
        return this.selectorShort.exon.c || this.selectorShort.exon.n;
      }
      return false;
    },

    hasCdsData: function () {
      if (
        this.selectorShort &&
        this.selectorShort.cds &&
        this.selectorShort.cds.g &&
        this.selectorShort.cds.g.length > 0 &&
        this.selectorShort.cds.c
      ) {
        return true;
      }
      return false;
    },

    inverted: function () {
      if (!this.hasExonData) {
        return false;
      }
      var first = this.selectorShort.exon.g[0];
      return parseInt(first[0]) > parseInt(first[1]);
    },

    strand: function () {
      if (!this.hasExonData) {
        return null;
      }
      return this.inverted ? "-" : "+";
    },

    coordinateSystem: function () {
      if (this.normalizedModel && this.normalizedModel.coordinate_system) {
        return this.normalizedModel.coordinate_system;
      }
      return null;
    },

    exonCoordinateSystem: function () {
      if (!this.hasExonData) {
        return null;
      }
      return this.selectorShort.exon.c ? "c" : "n";
    },

    exons: function () {
      if (!this.hasExonData) {
        return null;
      }
      var exonG = this.selectorShort.exon.g;
      var inv = this.inverted;

      if (inv) {
        return exonG
          .map(function (x) {
            return [parseInt(x[1]) - 1, parseInt(x[0])];
          })
          .reverse();
      }
      return exonG.map(function (x) {
        return [parseInt(x[0]) - 1, parseInt(x[1])];
      });
    },

    cds: function () {
      if (!this.hasCdsData) {
        return null;
      }
      var cdsG = this.selectorShort.cds.g[0];

      if (this.inverted) {
        return [parseInt(cdsG[1]) - 1, parseInt(cdsG[0])];
      }
      return [parseInt(cdsG[0]) - 1, parseInt(cdsG[1])];
    },

    exonData: function () {
      if (!this.hasExonData) {
        return [];
      }
      var exonG = this.selectorShort.exon.g;
      var exonCN = this.selectorShort.exon.c || this.selectorShort.exon.n;

      return exonG.map(function (gPos, i) {
        return {
          number: i + 1,
          start_g: gPos[0],
          end_g: gPos[1],
          start_cn: exonCN && exonCN[i] ? exonCN[i][0] : "N/A",
          end_cn: exonCN && exonCN[i] ? exonCN[i][1] : "N/A",
        };
      });
    },

    cdsData: function () {
      if (!this.hasCdsData) {
        return [];
      }
      var cdsG = this.selectorShort.cds.g;
      var cdsC = this.selectorShort.cds.c;

      return cdsG.map(function (gPos, i) {
        return {
          start_g: gPos[0],
          end_g: gPos[1],
          start_c: cdsC && cdsC[i] ? cdsC[i][0] : "N/A",
          end_c: cdsC && cdsC[i] ? cdsC[i][1] : "N/A",
        };
      });
    },

    hasVariants: function () {
      if (
        this.normalizedModel &&
        this.normalizedModel.variants &&
        this.normalizedModel.variants.length > 0
      ) {
        return true;
      }
      return false;
    },

    variantCoordinates: function () {
      if (!this.hasVariants) {
        return [];
      }

      var self = this;
      var results = [];

      this.normalizedModel.variants.forEach(function (variant, i) {
        var coords = self.getVariantCoordinates(variant);
        if (coords) {
          coords.index = i;
          results.push(coords);
        }
      });

      return results;
    },

    affectedExons: function () {
      if (!this.variantCoordinates.length || !this.hasExonData) {
        return new Set();
      }

      var self = this;
      var affected = new Set();

      this.variantCoordinates.forEach(function (coords) {
        var index = self.findAffectedExonIndex(coords);
        if (index !== null) {
          affected.add(index);
        }
      });

      return affected;
    },

    affectedCds: function () {
      if (!this.variantCoordinates.length || !this.hasCdsData) {
        return new Set();
      }

      var self = this;
      var affected = new Set();

      this.variantCoordinates.forEach(function (coords) {
        var index = self.findAffectedCdsIndex(coords);
        if (index !== null) {
          affected.add(index);
        }
      });

      return affected;
    },

    scrollTargetExon: function () {
      if (!this.variantCoordinates.length || !this.hasExonData) {
        return null;
      }

      var coords = this.variantCoordinates[0];
      return (
        this.findAffectedExonIndex(coords) || this.findNearestExonIndex(coords)
      );
    },
  },

  mounted: function () {
    if (this.scrollTargetExon) {
      this.scrollToExon(this.scrollTargetExon);
    }
  },

  methods: {
    getVariantCoordinates: function (variant) {
      var loc = variant.location;
      if (!loc) {
        return null;
      }

      try {
        if (loc.type === "point") {
          var c = this.pointToGenomic(loc);
          return { start: c, end: c, type: "point" };
        }
        if (loc.type === "range") {
          return {
            start: this.pointToGenomic(loc.start),
            end: this.pointToGenomic(loc.end),
            type: "range",
          };
        }
        return null;
      } catch (e) {
        return null;
      }
    },

    pointToGenomic: function (point) {
      if (this.coordinateSystem === "c" && this.exons && this.cds) {
        return this.codingToCoordinate(
          this.pointToCoding(point),
          this.exons,
          this.cds,
          this.inverted,
        );
      }

      if (this.coordinateSystem === "n" && this.exons) {
        var offset = point.offset ? point.offset.value : 0;
        return this.noncodingToCoordinate(
          [point.position, offset],
          this.exons,
          this.inverted,
        );
      }

      return parseInt(point.position);
    },

    findAffectedExonIndex: function (coords) {
      var exonG = this.selectorShort.exon.g;
      var varStart = Math.min(coords.start, coords.end);
      var varEnd = Math.max(coords.start, coords.end);

      for (var i = 0; i < exonG.length; i++) {
        var start = Math.min(parseInt(exonG[i][0]), parseInt(exonG[i][1]));
        var end = Math.max(parseInt(exonG[i][0]), parseInt(exonG[i][1]));

        if (varStart <= end && varEnd >= start) {
          return i + 1;
        }
      }
      return null;
    },

    findAffectedCdsIndex: function (coords) {
      var cdsG = this.selectorShort.cds.g;
      var varStart = Math.min(coords.start, coords.end);
      var varEnd = Math.max(coords.start, coords.end);

      for (var i = 0; i < cdsG.length; i++) {
        var start = Math.min(parseInt(cdsG[i][0]), parseInt(cdsG[i][1]));
        var end = Math.max(parseInt(cdsG[i][0]), parseInt(cdsG[i][1]));

        if (varStart <= end && varEnd >= start) {
          return i;
        }
      }
      return null;
    },

    findNearestExonIndex: function (coords) {
      var exonG = this.selectorShort.exon.g;
      var varPos = Math.min(coords.start, coords.end);
      var nearest = null;
      var minDist = Infinity;

      for (var i = 0; i < exonG.length; i++) {
        var start = Math.min(parseInt(exonG[i][0]), parseInt(exonG[i][1]));
        var end = Math.max(parseInt(exonG[i][0]), parseInt(exonG[i][1]));

        var dist =
          varPos < start ? start - varPos : varPos > end ? varPos - end : 0;

        if (dist < minDist) {
          minDist = dist;
          nearest = i + 1;
        }
      }
      return nearest;
    },

    isExonAffected: function (exonNumber) {
      return this.affectedExons.has(exonNumber);
    },

    isCdsAffected: function (cdsIndex) {
      return this.affectedCds.has(cdsIndex);
    },

    scrollToExon: function (exonNumber) {
      var self = this;

      this.$nextTick(function () {
        var container = self.$refs.exonScrollContainer;
        var ref = self.$refs["exon-" + exonNumber];

        if (!container || !ref) {
          return;
        }

        var el = Array.isArray(ref) ? ref[0] : ref;
        if (!el) {
          return;
        }

        var containerRect = container.getBoundingClientRect();
        var elRect = el.getBoundingClientRect();

        var targetScroll =
          elRect.top -
          containerRect.top +
          container.scrollTop -
          container.clientHeight / 2 +
          el.clientHeight / 2;

        container.scrollTo({
          top: Math.max(0, targetScroll),
          behavior: "smooth",
        });
      });
    },
  },
};
</script>

<style scoped>
.transcript-details {
  font-size: 0.75rem;
}

.strand-section {
  margin-bottom: 12px;
}

.strand-container {
  background-color: #ffffff;
  border-left: 2px solid #e0e0e0;
  padding: 4px;
  border-radius: 4px;
}

.strand-content {
  display: flex;
  align-items: center;
}

.strand-label {
  font-size: 0.65rem;
  font-weight: 500;
  color: #616161;
  margin-left: 8px;
}

.exons-section {
  margin-bottom: 6px;
}

.cds-section {
  margin-bottom: 6px;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 6px;
}

.section-header-title {
  font-size: 0.75rem;
  font-weight: 700;
}

.section-title {
  font-size: 0.75rem;
  font-weight: 700;
  margin-bottom: 4px;
}

.section-actions {
  display: flex;
  align-items: center;
}

.target-btn {
  margin-left: 8px;
}

.exon-scroll-container {
  max-height: 160px;
  overflow-y: auto;
  overflow-x: hidden;
  padding-right: 4px;
}

.exon-scroll-container::-webkit-scrollbar {
  width: 6px;
}

.exon-scroll-container::-webkit-scrollbar-track {
  background: transparent;
}

.exon-scroll-container::-webkit-scrollbar-thumb {
  background: #9e9e9e;
  border-radius: 3px;
}

.exon-scroll-container::-webkit-scrollbar-thumb:hover {
  background: #757575;
}

.structure-item {
  background-color: #ffffff;
  border-left: 2px solid #e0e0e0;
  padding: 2px;
  margin-bottom: 6px;
  border-radius: 4px;
}

.structure-item.variant-affected {
  background-color: #fff5f5;
  border-left: 3px solid #b71c1c;
  box-shadow: 0 1px 3px rgba(183, 28, 28, 0.12);
}

.structure-content {
  display: flex;
  align-items: center;
}

.exon-number {
  min-width: 60px;
  margin-right: 8px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: monospace;
}

.exon-label {
  font-weight: 400;
  color: #9e9e9e;
  margin-right: 4px;
}

.exon-value {
  font-weight: 700;
  color: #616161;
}

.coordinates {
  flex-grow: 1;
}

.coordinate-row {
  display: flex;
  align-items: center;
  font-size: 0.65rem;
}

.coordinate-type {
  min-width: 36px;
  font-family: monospace;
  font-weight: 500;
  color: #9e9e9e;
  margin-right: 8px;
}

.coordinate-label {
  min-width: 16px;
  font-family: monospace;
  font-weight: 500;
  color: #757575;
}

.coordinate-value {
  font-family: monospace;
  color: #616161;
  margin-right: 12px;
}

.variant-chip {
  margin-left: 8px;
}
</style>
