<template>
  <v-container>
    <v-layout>
      <v-flex xs12>
        <h1 class="display-1 mt-10">Position Converter</h1>
        <p>
          Converts reference positions to selector orientated positions and vice
          versa.
        </p>
        <v-sheet elevation="2" class="mt-10 pa-10">
          <v-form ref="form" v-model="valid" :lazy-validation="lazy">
            <v-row>
              <v-col cols="12" sm="6" lg="3">
                <v-text-field
                  :rules="rules"
                  ref="referenceId"
                  v-model="referenceId"
                  :label="'Reference ID'"
                  :hint="'E.g. NC_000001.11'"
                  :clearable="true"
                  :error-messages="errorReferenceIdMessage"
                  autofocus
                ></v-text-field>
              </v-col>

              <v-col cols="12" sm="6" lg="3">
                <v-text-field
                  :rules="rules"
                  ref="selectorId"
                  v-model="selectorId"
                  :label="'Selector ID'"
                  :hint="'E.g. NM_001232.3'"
                  :error-messages="errorSelectorIdMessage"
                  :clearable="true"
                ></v-text-field>
              </v-col>

              <v-col cols="12" sm="6" lg="3">
                <v-text-field
                  :rules="rules"
                  ref="position"
                  v-model="position"
                  :label="'Position'"
                  :hint="'E.g. 100'"
                  :error-messages="errorPositionMessage"
                  :clearable="true"
                ></v-text-field>
              </v-col>

              <v-col cols="12" sm="6" lg="3">
                <v-select
                  :items="['Reference', 'Selector']"
                  v-model="relativeTo"
                  label="Relative to"
                ></v-select>
              </v-col>
            </v-row>
            <v-row class="mt--10">
              <v-col>
                <v-switch
                  v-model="includeOverlapping"
                  label="Include overlapping"
                  color="primary"
                ></v-switch>
              </v-col>
            </v-row>
          </v-form>
          <v-row>
            <v-btn
              ref="convert"
              class="mt-5"
              color="primary"
              :disabled="!valid"
              :to="{
                name: 'PositionConverter',
                query: {
                  referenceId: referenceId,
                  selectorId: selectorId,
                  position: position,
                  relativeTo: relativeTo,
                  includeOverlapping: includeOverlapping
                }
              }"
            >
              Convert
            </v-btn>
            <v-spacer></v-spacer>
            <v-menu transition="slide-x-transition">
              <template v-slot:activator="{ on, attrs }">
                <v-btn color="success" class="mt-5" v-bind="attrs" v-on="on">
                  Examples
                </v-btn>
              </template>
              <v-list>
                <v-list-item v-for="(example, i) in examples" :key="i" link>
                  <v-list-item-title
                    color="success"
                    v-text="example.item"
                    @click.prevent="setExample(example.fields)"
                  ></v-list-item-title>
                </v-list-item>
              </v-list>
            </v-menu>
          </v-row>
        </v-sheet>
        <v-alert
          border="right"
          color="red lighten-2"
          dark
          colored-border
          type="error"
          elevation="2"
          tile
          class="mt-10"
          v-if="errorMessages"
        >
          {{ errorMessages }}
        </v-alert>
        <v-sheet elevation="2" class="pa-10 mt-10" v-if="summary">
          {{ summary }}
        </v-sheet>
        <v-sheet elevation="2" class="pa-10 mt-10" v-if="summary">
          <v-row>
            <v-col>
              <div class="overline mb-4">Reference Position</div>
              <div class="">
                <span class="description">
                  {{ summary.reference.id }}:{{
                    summary.reference.coordinate_system
                  }}.{{ summary.reference.position }}
                </span>
              </div>
            </v-col>
            <v-col>
              <div class="overline mb-4">Selector Position</div>
              <div>
                <span class="description">
                  {{ summary.reference.id }}({{ summary.selector.id }}):{{
                    summary.selector.coordinate_system
                  }}.{{ summary.selector.position }}
                </span>
              </div>
            </v-col>
          </v-row>
          <v-row v-if="otherSelectors">
            <v-col>
              <div class="overline mb-4">Other Selectors</div>
              <div v-if="!otherSelectors || !otherSelectors.length">
                No other selectors overlap with the provided position.
              </div>
              <div v-for="(selector, i) in otherSelectors" :key="i">
                <span class="description">
                  {{ summary.reference.id }}({{ selector.id }}):{{
                    selector.coordinate_system
                  }}.{{ selector.position }}
                </span>
              </div>
            </v-col>
          </v-row>
        </v-sheet>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
import axios from "axios";

export default {
  data: () => ({
    valid: true,
    lazy: false,
    referenceId: "",
    selectorId: "",
    position: "",
    relativeTo: "",
    includeOverlapping: false,
    rules: [value => !!value || "Required."],
    summary: null,
    responseApi: null,
    errorMessages: null,
    errorReferenceId: null,
    errorReferenceIdMessage: null,
    errorSelectorId: null,
    errorSelectorIdMessage: null,
    errorPosition: null,
    errorPositionMessage: null,
    referenceErrors: null,
    otherSelectors: null,
    examples: [
      {
        item: "LRG_24:g.100 -> t1",
        fields: {
          referenceId: "LRG_1",
          selectorId: "t1",
          position: "100",
          relativeTo: "Reference"
        }
      },
      {
        item: "NG_007485.1(NR_047542.1):n.274 -> NR_047542.1",
        fields: {
          referenceId: "NG_007485.1",
          selectorId: "NR_047542.1",
          position: "274",
          relativeTo: "Selector"
        }
      },

      {
        item: "NG_017013.2(NM_000546.5):c.274 -> NM_000546.5",
        fields: {
          referenceId: "NG_017013.2",
          selectorId: "NM_000546.5",
          position: "274",
          relativeTo: "Selector"
        }
      },

      {
        item: "NG_012337.1(NM_003002.2):c.274 -> NG_012337.1",
        fields: {
          referenceId: "NG_012337.1",
          selectorId: "NM_003002.2",
          position: "274",
          relativeTo: "Selector"
        }
      },
      {
        item: "NC_000001.11(NM_001232.3):c.274 -> NC_000001.11",
        fields: {
          referenceId: "NC_000001.11",
          selectorId: "NM_001232.3",
          position: "274",
          relativeTo: "Selector"
        }
      }
    ]
  }),
  created: function() {
    // console.log("Created");
    // console.log(this.$route);
    this.run();
  },
  watch: {
    $route() {
      // console.log("Watch");
      // console.log(this.$route.params);
      this.run();
    },
    referenceId() {
      this.handleEretr();
      this.handleEnoselector();
    },
    selectorId() {
      this.handleEnoselector();
    },
    position() {
      this.updatePositionErrorMessage();
    }
  },
  methods: {
    run: function() {
      if (
        this.$route.query.referenceId &&
        0 !== this.$route.query.referenceId.length
      ) {
        this.referenceId = this.$route.query.referenceId;
      }
      if (
        this.$route.query.selectorId &&
        0 !== this.$route.query.selectorId.length
      ) {
        this.selectorId = this.$route.query.selectorId;
      }
      if (
        this.$route.query.position &&
        0 !== this.$route.query.position.length
      ) {
        this.position = this.$route.query.position;
      }
      if (
        this.$route.query.relativeTo &&
        0 !== this.$route.query.relativeTo.length
      ) {
        this.relativeTo = this.$route.query.relativeTo;
      }
      if (this.$route.query.includeOverlapping) {
        this.includeOverlapping = this.$route.query.includeOverlapping;
      }
      if (
        this.$route.query.referenceId &&
        0 !== this.$route.query.referenceId.length &&
        this.$route.query.selectorId &&
        0 !== this.$route.query.selectorId.length &&
        this.$route.query.position &&
        0 !== this.$route.query.position.length &&
        this.$route.query.relativeTo &&
        0 !== this.$route.query.relativeTo.length
      ) {
        this.positionConvert();
      }
    },
    setExample: function(fields) {
      this.referenceId = fields.referenceId;
      this.selectorId = fields.selectorId;
      this.position = fields.position;
      this.relativeTo = fields.relativeTo;
    },
    positionConvert: function() {
      this.errorMessages = null;
      if (
        this.referenceId !== null &&
        this.selectorId !== null &&
        this.position !== null
      ) {
        this.summary = null;
        this.otherSelectors = null;
        this.responseApi = null;
        const params = {
          reference_id: this.referenceId,
          selector_id: this.selectorId,
          position: this.position,
          relative_to: this.relativeTo,
          include_overlapping: this.includeOverlapping
        };
        axios
          // .get('http://145.88.35.44/api/name_check/' + this.description, {
          .get("http://127.0.0.1:5000/api/position_convert/", { params }, {})
          .then(response => {
            if (response.data) {
              this.responseApi = response.data;
              this.responseHandler(response.data);
              this.loadingOverlay = false;
            }
          })
          .catch(error => {
            if (error.response) {
              // The request was made and the server responded with a status code
              // that falls out of the range of 2xx
              this.errorMessages = "Some response error.";
              // console.log(error.response.data);
              // console.log(error.response.status);
              // console.log(error.response.headers);
            } else if (error.request) {
              this.errorMessages = "Some request error.";
              // The request was made but no response was received
              // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
              // http.ClientRequest in node.js
              // console.log(error.request);
            } else {
              this.errorMessages = "Some error.";
              // console.log(error);
              // Something happened in setting up the request that triggered an Error
              // console.log("Error", error.message);
            }
            // console.log(error.config);
          });
      }
    },
    responseHandler: function(response) {
      if ("errors" in response) {
        this.errorsHandler(response.errors);
      } else {
        this.summary = response;
        if (this.summary.other_selectors) {
          this.otherSelectors = this.summary.other_selectors;
        }
      }
    },
    errorsHandler: function(errors) {
      for (const entry of errors) {
        if (entry.code === "ERETR") {
          this.errorMessages =
            "Unable to retrieve reference " + this.referenceId;
          this.referenceErrors = [
            "Unable to retrieve reference " + this.referenceId
          ];
          this.errorReferenceId = this.referenceId;
          this.handleEretr();
        } else if (entry.code === "ENOSELECTOR") {
          this.errorMessages =
            "Selector " +
            this.selectorId +
            " not found in reference " +
            this.referenceId;
          this.errorSelectorId = this.selectorId;
          this.errorReferenceId = this.referenceId;
          this.handleEnoselector();
        } else if (entry.code === "ESYNTAX") {
          this.errorMessages = "Position syntax error.";
        } else if (entry.code === "ERANGELOCATION") {
          this.errorMessages = "";
          this.errorPosition = this.position;
          this.updatePositionErrorMessage("Range locations not supported.");
        } else if (entry.code === "EOUTOFBOUNDARY") {
          this.errorPosition = this.position;
          this.updatePositionErrorMessage(
            "Position out of sequence boundaries."
          );
        } else {
          if (entry.code) {
            this.errorMessages = entry.code + " occurred.";
          }
        }
      }
    },
    handleEretr() {
      if (this.errorReferenceId && this.errorReferenceId === this.referenceId) {
        this.errorReferenceIdMessage = this.referenceId + " not retrieved";
      } else {
        this.errorReferenceIdMessage = null;
      }
    },
    handleEnoselector() {
      if (this.errorReferenceId && this.errorReferenceId === this.referenceId) {
        this.errorReferenceIdMessage =
          this.referenceId + " does not contain " + this.selectorId;
      } else {
        this.errorSelectorIdMessage = null;
        this.errorReferenceIdMessage = null;
        return;
      }
      if (this.errorSelectorId && this.errorSelectorId === this.selectorId) {
        this.errorSelectorIdMessage =
          this.selectorId + " not found in " + this.referenceId;
      } else {
        this.errorReferenceIdMessage = null;
        this.errorSelectorIdMessage = null;
      }
    },
    updatePositionErrorMessage(message) {
      if (this.errorPosition && this.errorPosition === this.position) {
        this.errorPositionMessage = message;
      } else {
        this.errorPositionMessage = null;
      }
    }
  }
};
</script>

<style scoped>
.description {
  display: inline-block;
  /* white-space: nowrap; */
  color: #1565c0;
  font-family: monospace;
}

.description:hover {
  color: #0d47a1;
}

.v-text-field {
  font-family: monospace;
}
</style>
