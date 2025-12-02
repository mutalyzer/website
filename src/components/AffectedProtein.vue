<template>
  <div class="affected-protein">
    <div v-if="hasSequences" class="sequences-wrapper">
      <!-- Reference Sequence -->
      <div v-if="protein.reference" class="sequence-section">
        <div class="sequence-header">
          <span class="overline">AFFECTED PROTEIN REFERENCE SEQUENCE</span>
          <v-tooltip bottom>
            <template #activator="{ on, attrs }">
              <v-btn
                v-clipboard="protein.reference"
                v-bind="attrs"
                icon
                small
                class="copy-btn"
                v-on="on"
              >
                <v-icon small>mdi-content-copy</v-icon>
              </v-btn>
            </template>
            <span>Copy the reference protein sequence</span>
          </v-tooltip>
        </div>
        <div class="protein-seq">
          <div
            v-for="(line, lineIndex) in referenceLines"
            :key="`ref-${lineIndex}`"
            class="sequence-line"
          >
            <span class="position-number">{{ line.position }}</span>
            <span>&nbsp;</span>
            <span
              v-for="(aminoAcid, aaIndex) in line.aminoAcids"
              :key="`ref-${lineIndex}-${aaIndex}`"
            >
              <span v-if="aminoAcid.isSpace">&nbsp;</span>
              <span
                v-else
                :ref="'ref-' + aminoAcid.position"
                :class="aminoAcidClasses(aminoAcid, 'reference')"
                @mouseenter="handleHover(aminoAcid.position, 'reference')"
                @mouseleave="handleHoverEnd"
                >{{ aminoAcid.char }}</span
              >
            </span>
          </div>
        </div>
      </div>

      <!-- Predicted Sequence -->
      <div v-if="protein.predicted" class="sequence-section">
        <div class="sequence-header">
          <span class="overline">AFFECTED PROTEIN PREDICTED SEQUENCE</span>
          <v-tooltip bottom>
            <template #activator="{ on, attrs }">
              <v-btn
                v-clipboard="protein.predicted"
                v-bind="attrs"
                icon
                small
                class="copy-btn"
                v-on="on"
              >
                <v-icon small>mdi-content-copy</v-icon>
              </v-btn>
            </template>
            <span>Copy the predicted protein sequence</span>
          </v-tooltip>
        </div>
        <div class="protein-seq">
          <div
            v-for="(line, lineIndex) in predictedLines"
            :key="`pred-${lineIndex}`"
            class="sequence-line"
          >
            <span class="position-number">{{ line.position }}</span>
            <span>&nbsp;</span>
            <span
              v-for="(aminoAcid, aaIndex) in line.aminoAcids"
              :key="`pred-${lineIndex}-${aaIndex}`"
            >
              <span v-if="aminoAcid.isSpace">&nbsp;</span>
              <span
                v-else
                :ref="'pred-' + aminoAcid.position"
                :class="aminoAcidClasses(aminoAcid, 'predicted')"
                @mouseenter="handleHover(aminoAcid.position, 'predicted')"
                @mouseleave="handleHoverEnd"
                >{{ aminoAcid.char }}</span
              >
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Tooltip for Reference -->
    <div
      v-if="tooltip.visible && tooltip.referencePos && tooltip.referenceAA"
      class="amino-acid-tooltip"
      :style="tooltip.referencePos"
    >
      <div class="tooltip-aa">{{ tooltip.referenceAA }}</div>
      <div class="tooltip-info">
        <div>p.{{ tooltip.refPosition + 1 }}</div>
        <div>
          r.{{ tooltip.refPosition * 3 + 1 }}_{{
            (tooltip.refPosition + 1) * 3
          }}
        </div>
      </div>
    </div>

    <!-- Tooltip for Predicted -->
    <div
      v-if="tooltip.visible && tooltip.predictedPos && tooltip.predictedAA"
      class="amino-acid-tooltip"
      :style="tooltip.predictedPos"
    >
      <div class="tooltip-aa">{{ tooltip.predictedAA }}</div>
      <div class="tooltip-info">
        <div>{{ tooltip.predPosition + 1 }}</div>
      </div>
    </div>
  </div>
</template>

<script>
var SEQUENCE_CONFIG = {
  BLOCK_LENGTH: 10,
  COLUMNS: 6,
};

export default {
  name: "AffectedProtein",

  props: {
    protein: {
      type: Object,
      required: true,
      validator: function (value) {
        return (
          value &&
          (typeof value.reference === "string" ||
            typeof value.predicted === "string")
        );
      },
    },
  },

  data: function () {
    return {
      hoveredRefPosition: null,
      hoveredPredPosition: null,
      tooltip: {
        visible: false,
        refPosition: null,
        predPosition: null,
        referenceAA: null,
        predictedAA: null,
        referencePos: null,
        predictedPos: null,
      },
    };
  },

  computed: {
    hasSequences: function () {
      if (this.protein && (this.protein.reference || this.protein.predicted)) {
        return true;
      }
      return false;
    },

    charsPerLine: function () {
      return SEQUENCE_CONFIG.BLOCK_LENGTH * SEQUENCE_CONFIG.COLUMNS;
    },

    referenceLines: function () {
      return this.formatSequenceLines(
        this.protein.reference,
        this.protein.position_first,
        this.protein.position_last_original,
      );
    },

    predictedLines: function () {
      return this.formatSequenceLines(
        this.protein.predicted,
        this.protein.position_first,
        this.protein.position_last_predicted,
      );
    },

    mutationOffset: function () {
      var posFirst = this.protein.position_first;
      var posLastOrig = this.protein.position_last_original;
      var posLastPred = this.protein.position_last_predicted;

      if (posFirst == null || posLastOrig == null || posLastPred == null) {
        return 0;
      }

      return posLastPred - posFirst - (posLastOrig - posFirst);
    },
  },

  methods: {
    aminoAcidClasses: function (aminoAcid, source) {
      var isHovered =
        source === "reference"
          ? this.hoveredRefPosition === aminoAcid.position
          : this.hoveredPredPosition === aminoAcid.position;

      return {
        "amino-acid": true,
        "is-changed": aminoAcid.isChanged,
        "is-hovered": isHovered,
      };
    },

    mapRefToPredict: function (refPos) {
      var posFirst = this.protein.position_first;
      var posLastOrig = this.protein.position_last_original;
      var posLastPred = this.protein.position_last_predicted;

      if (posFirst == null || posLastOrig == null || posLastPred == null) {
        return refPos;
      }

      if (refPos < posFirst) {
        return refPos;
      }

      if (refPos >= posFirst && refPos < posLastOrig) {
        var predPos = posFirst + (refPos - posFirst);
        return predPos < posLastPred ? predPos : null;
      }

      return refPos + this.mutationOffset;
    },

    mapPredictToRef: function (predPos) {
      var posFirst = this.protein.position_first;
      var posLastOrig = this.protein.position_last_original;
      var posLastPred = this.protein.position_last_predicted;

      if (posFirst == null || posLastOrig == null || posLastPred == null) {
        return predPos;
      }

      if (predPos < posFirst) {
        return predPos;
      }

      if (predPos >= posFirst && predPos < posLastPred) {
        var refPos = posFirst + (predPos - posFirst);
        return refPos < posLastOrig ? refPos : null;
      }

      return predPos - this.mutationOffset;
    },

    getElementPosition: function (ref) {
      var elements = this.$refs[ref];
      if (!elements) {
        return null;
      }

      var el = Array.isArray(elements) ? elements[0] : elements;
      if (!el) {
        return null;
      }

      var rect = el.getBoundingClientRect();
      return {
        left: rect.left + rect.width / 2 + "px",
        top: rect.top - 8 + "px",
      };
    },

    handleHover: function (position, source) {
      var refPos = null;
      var predPos = null;

      if (source === "reference") {
        refPos = position;
        predPos = this.mapRefToPredict(position);
      } else {
        predPos = position;
        refPos = this.mapPredictToRef(position);
      }

      this.hoveredRefPosition = refPos;
      this.hoveredPredPosition = predPos;

      var referenceAA = null;
      var predictedAA = null;

      if (refPos != null && this.protein && this.protein.reference) {
        referenceAA = this.protein.reference[refPos];
      }
      if (predPos != null && this.protein && this.protein.predicted) {
        predictedAA = this.protein.predicted[predPos];
      }

      this.tooltip = {
        visible: true,
        refPosition: refPos,
        predPosition: predPos,
        referenceAA: referenceAA,
        predictedAA: predictedAA,
        referencePos:
          refPos != null ? this.getElementPosition("ref-" + refPos) : null,
        predictedPos:
          predPos != null ? this.getElementPosition("pred-" + predPos) : null,
      };
    },

    handleHoverEnd: function () {
      this.hoveredRefPosition = null;
      this.hoveredPredPosition = null;
      this.tooltip.visible = false;
    },

    formatSequenceLines: function (sequence, positionFirst, positionLast) {
      if (!sequence) {
        return [];
      }

      var lines = [];
      var charsPerLine = this.charsPerLine;

      for (var i = 0; i < sequence.length; i += charsPerLine) {
        var lineChars = sequence.substring(i, i + charsPerLine);
        var aminoAcids = [];

        for (var j = 0; j < lineChars.length; j++) {
          var globalPosition = i + j;
          var isChanged =
            positionFirst != null &&
            positionLast != null &&
            globalPosition >= positionFirst &&
            globalPosition < positionLast;

          if (j > 0 && j % SEQUENCE_CONFIG.BLOCK_LENGTH === 0) {
            aminoAcids.push({
              char: " ",
              position: null,
              isChanged: false,
              isSpace: true,
            });
          }

          aminoAcids.push({
            char: lineChars[j],
            position: globalPosition,
            isChanged: isChanged,
            isSpace: false,
          });
        }

        lines.push({
          position: (i + 1).toString().padStart(4, " "),
          aminoAcids: aminoAcids,
        });
      }

      return lines;
    },
  },
};
</script>

<style scoped src="../assets/main.css"></style>
<style scoped>
.affected-protein {
  position: relative;
}

.sequences-wrapper {
  display: flex;
  flex-wrap: wrap;
  margin: -12px;
}

.sequence-section {
  flex-grow: 1;
  flex-shrink: 0;
  flex-basis: 500px;
  max-width: 100%;
  padding: 12px;
}

.sequence-header {
  display: inline-flex;
  align-items: center;
  margin-bottom: 4px;
}

.copy-btn {
  margin-left: 4px;
}

.protein-seq {
  padding: 8px 0;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

.sequence-line {
  font-family: Menlo, Monaco, Consolas, "Courier New", monospace;
  font-size: 0.8125rem;
  line-height: 1.5;
  letter-spacing: 0.5px;
  white-space: pre;
  color: #004d40;
}

.position-number {
  display: inline-block;
  min-width: 4ch;
  text-align: right;
  color: #757575;
  user-select: none;
}

.amino-acid {
  cursor: pointer;
  padding: 2px 1px;
  border-radius: 2px;
  transition: background-color 0.1s ease;
}

.amino-acid.is-changed {
  color: #b71c1c;
  font-weight: bold;
  background-color: #fff5f5;
}

.amino-acid:hover,
.amino-acid.is-hovered {
  background-color: #b8b8b8;
}

.amino-acid-tooltip {
  position: fixed;
  z-index: 1000;
  background-color: rgba(97, 97, 97, 0.9);
  color: #ffffff;
  padding: 5px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 400;
  font-family: Roboto, sans-serif;
  line-height: 1.4;
  pointer-events: none;
  white-space: nowrap;
  text-align: center;
  transform: translate(-50%, -100%);
}

.amino-acid-tooltip::after {
  content: "";
  position: absolute;
  top: 100%;
  left: 50%;
  margin-left: -5px;
  border-width: 5px;
  border-style: solid;
  border-color: rgba(97, 97, 97, 0.9) transparent transparent transparent;
}

.tooltip-aa {
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 2px;
}

.tooltip-info {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.7);
  line-height: 1.3;
}
</style>
