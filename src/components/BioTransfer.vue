<template>
  <div class="transfer">
    <!-- DNA + RNA + Side Panel Container -->
    <div
      v-if="hasDnaContent || hasRnaContent"
      class="main"
      :class="{ 'has-side-panel': showStructure && hasStructureData }"
    >
      <div class="content">
        <!-- DNA Section -->
        <div
          v-if="hasDnaContent"
          class="section"
          :class="{ 'with-arrow': hasRnaContent || hasProteinDescription }"
        >
          <div class="bar">
            <img src="@/assets/dna.svg" width="28" height="28" class="icon" />
          </div>
          <div class="body">
            <!-- Genomic Description -->
            <div v-if="hasGenomicDescription" class="item">
              <div class="overline">Genomic Description</div>
              <Description
                :description="response.equivalent_descriptions.g[0].description"
                css_class="ok-description-link"
                to_name="Normalizer"
                :to_params="{
                  descriptionRouter:
                    response.equivalent_descriptions.g[0].description,
                }"
              />
            </div>

            <!-- Coding Transcript Description -->
            <div v-if="shouldShowCodingDescription" class="item">
              <v-row align="center" no-gutters>
                <v-col>
                  <div class="overline mb-0">
                    {{ transcriptDescriptionTitle }}
                  </div>
                  <div
                    v-if="geneInfo"
                    class="text-caption grey--text text--darken-1 mt-1"
                  >
                    {{ geneInfo }}
                  </div>
                </v-col>
                <v-col v-if="hasStructureData" cols="auto">
                  <v-btn
                    text
                    x-small
                    color="blue darken-1"
                    @click="showStructure = !showStructure"
                  >
                    Transcript Details
                    <v-icon x-small right>
                      {{
                        showStructure ? "mdi-chevron-up" : "mdi-chevron-down"
                      }}
                    </v-icon>
                  </v-btn>
                </v-col>
              </v-row>

              <div
                :class="{
                  'description-panel': showStructure && hasStructureData,
                }"
              >
                <Description
                  :description="codingDescription"
                  css_class="ok-description-link"
                  to_name="Normalizer"
                  :to_params="{ descriptionRouter: codingDescription }"
                />
              </div>

              <!-- Transcript Details - Mobile -->
              <v-expand-transition>
                <div
                  v-if="showStructure && hasStructureData"
                  class="mt-3 hidden-md-and-up"
                >
                  <v-card color="grey lighten-5" flat>
                    <v-card-text class="pa-3">
                      <TranscriptDetails
                        :selector-short="response.selector_short"
                        :normalized-model="response.normalized_model"
                      />
                    </v-card-text>
                  </v-card>
                </div>
              </v-expand-transition>
            </div>
          </div>
        </div>

        <!-- RNA Section -->
        <div
          v-if="hasRnaContent"
          class="section"
          :class="{ 'with-arrow': hasProteinDescription }"
        >
          <div class="bar">
            <img src="@/assets/rna.svg" width="28" height="28" class="icon" />
          </div>
          <div class="body">
            <div v-if="rnaDescription" class="item">
              <div class="overline">{{ rnaDescriptionTitle }}</div>
              <Description
                :description="rnaDescription"
                css_class="ok-description-link"
                to_name="Normalizer"
                :to_params="{ descriptionRouter: rnaDescription }"
              />
            </div>

            <div v-if="response.rna && response.rna.errors" class="item">
              <div class="overline">Predictions</div>
              <v-alert
                v-for="(error, index) in response.rna.errors"
                :key="index"
                color="red lighten-1"
                tile
                border="left"
                dark
                class="mb-2"
              >
                {{ getMessage(error) }}
              </v-alert>
            </div>
          </div>
        </div>
      </div>

      <!-- Transcript Details - Desktop (Right Panel) -->
      <div
        v-if="hasStructureData && showStructure"
        class="side-panel hidden-sm-and-down"
      >
        <v-card color="grey lighten-5" flat tile>
          <v-card-text class="pa-3">
            <TranscriptDetails
              :selector-short="response.selector_short"
              :normalized-model="response.normalized_model"
            />
          </v-card-text>
        </v-card>
      </div>
    </div>

    <!-- Protein Section - Outside main to avoid shrinking -->
    <div v-if="hasProteinDescription" class="section">
      <div class="bar">
        <img src="@/assets/protein.svg" width="28" height="28" class="icon" />
      </div>
      <div class="body">
        <div class="item">
          <v-row align="center" no-gutters>
            <v-col>
              <div class="overline">Predicted Protein Description</div>
            </v-col>
            <v-col v-if="hasProteinSequences" cols="auto">
              <v-btn
                text
                x-small
                color="blue darken-1"
                @click="showProteinSequences = !showProteinSequences"
              >
                Protein Sequences
                <v-icon x-small right>
                  {{
                    showProteinSequences ? "mdi-chevron-up" : "mdi-chevron-down"
                  }}
                </v-icon>
              </v-btn>
            </v-col>
          </v-row>

          <Description
            :description="response.protein.description"
            css_class="ok-description-link"
            to_name="Normalizer"
            :to_params="{ descriptionRouter: response.protein.description }"
          />
        </div>

        <v-expand-transition>
          <div v-if="showProteinSequences && hasProteinSequences" class="item">
            <AffectedProtein :protein="response.protein" />
          </div>
        </v-expand-transition>
      </div>
    </div>
  </div>
</template>

<script>
import Description from "../components/Description.vue";
import AffectedProtein from "../components/AffectedProtein.vue";
import TranscriptDetails from "../components/TranscriptDetails.vue";

export default {
  name: "BioTransfer",
  components: {
    Description,
    AffectedProtein,
    TranscriptDetails,
  },
  props: {
    response: {
      type: Object,
      required: true,
    },
  },
  data: function () {
    return {
      showStructure: false,
      showProteinSequences: false,
    };
  },
  computed: {
    hasGenomicDescription: function () {
      if (
        this.response &&
        this.response.equivalent_descriptions &&
        this.response.equivalent_descriptions.g &&
        this.response.equivalent_descriptions.g.length > 0
      ) {
        return true;
      }
      return false;
    },

    shouldShowCodingDescription: function () {
      if (
        this.response &&
        this.response.normalized_description &&
        this.response.normalized_model
      ) {
        var cs = this.response.normalized_model.coordinate_system;
        return cs === "c" || cs === "n";
      }
      return false;
    },

    codingDescription: function () {
      if (this.response && this.response.normalized_description) {
        return this.response.normalized_description;
      }
      return null;
    },

    geneInfo: function () {
      if (this.response && this.response.gene_id) {
        return "Gene: " + this.response.gene_id;
      }
      return null;
    },

    transcriptDescriptionTitle: function () {
      if (this.response && this.response.normalized_model) {
        var cs = this.response.normalized_model.coordinate_system;
        if (cs === "c") {
          return "Coding Transcript Description";
        }
        if (cs === "n") {
          return "Non-Coding Transcript Description";
        }
      }
      return "Transcript Description";
    },

    hasStructureData: function () {
      if (this.response && this.response.selector_short) {
        var s = this.response.selector_short;
        var hasExon =
          s.exon && s.exon.g && s.exon.g.length > 0 && (s.exon.c || s.exon.n);
        var hasCds = s.cds && s.cds.g && s.cds.g.length > 0 && s.cds.c;
        return hasExon || hasCds;
      }
      return false;
    },

    hasDnaContent: function () {
      return this.hasGenomicDescription || this.shouldShowCodingDescription;
    },

    isRnaInput: function () {
      if (this.response && this.response.normalized_model) {
        return this.response.normalized_model.coordinate_system === "r";
      }
      return false;
    },

    hasRnaContent: function () {
      if (this.response && this.response.rna) {
        var rna = this.response.rna;
        if (rna.description || rna.errors) {
          return true;
        }
      }
      return this.isRnaInput;
    },

    rnaDescription: function () {
      if (this.response && this.response.rna && this.response.rna.description) {
        return this.response.rna.description;
      }
      if (
        this.isRnaInput &&
        this.response &&
        this.response.normalized_description
      ) {
        return this.response.normalized_description;
      }
      return null;
    },

    rnaDescriptionTitle: function () {
      if (this.response && this.response.rna && this.response.rna.description) {
        return "Predicted RNA Description";
      }
      if (this.isRnaInput) {
        return "RNA Description";
      }
      return "Predicted RNA Description";
    },

    hasProteinDescription: function () {
      if (
        this.response &&
        this.response.protein &&
        this.response.protein.description
      ) {
        return true;
      }
      return false;
    },

    hasProteinSequences: function () {
      if (this.response && this.response.protein) {
        var p = this.response.protein;
        return p.reference || p.predicted;
      }
      return false;
    },
  },
  methods: {
    getMessage: function (message) {
      if (message.details) {
        if (message.options) {
          return (
            message.details +
            " Choose from: " +
            message.options.join(", ") +
            "."
          );
        }
        return message.details;
      }
      return message;
    },
  },
};
</script>

<style scoped>
.transfer {
  display: flex;
  flex-direction: column;
}

.main {
  display: flex;
  overflow: visible;
  margin-bottom: 24px;
}

.main.has-side-panel {
  gap: 16px;
}

.content {
  flex: 1;
  min-width: 0;
  overflow: visible;
}

.side-panel {
  flex: 0 0 400px;
  align-self: flex-start;
}

.section {
  display: flex;
  margin-bottom: 24px;
  position: relative;
}

.content > .section:last-child,
.transfer > .section:last-child {
  margin-bottom: 0;
}

.section.with-arrow::after {
  content: "";
  position: absolute;
  bottom: -18px;
  left: 0;
  width: 24px;
  height: 12px;
  background-color: #e4e4e4;
  clip-path: polygon(0 0, 100% 0, 50% 100%);
}

.bar {
  width: 24px;
  flex-shrink: 0;
  background-color: #e4e4e4;
  display: flex;
  justify-content: center;
  padding-top: 8px;
}

.icon {
  flex-shrink: 0;
}

.body {
  flex: 1;
  padding: 8px 0 8px 16px;
}

.item {
  margin-bottom: 16px;
}

.item:last-child {
  margin-bottom: 0;
}

.description-panel {
  background-color: #fafafa;
  padding: 12px;
  margin-top: 8px;
  margin-right: -16px;
}

@media (max-width: 960px) {
  .main.has-side-panel {
    flex-direction: column;
    gap: 0;
  }

  .side-panel {
    flex: 1;
    max-width: 100%;
    margin-top: 16px;
  }

  .description-panel {
    margin-right: 0;
  }
}
</style>
