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
              <v-subheader>From</v-subheader>
            </v-row>
            <v-divider></v-divider>
            <v-row class="pl-2 pr-2">
              <v-col cols="12" sm="6" lg="3">
                <v-text-field
                  :rules="rules"
                  ref="referenceId"
                  v-model="referenceId"
                  :label="'Reference ID'"
                  :hint="'E.g. NC_000001.11'"
                  :clearable="true"
                  :error-messages="errorReferenceIdMessage"
                ></v-text-field>
              </v-col>

              <v-col cols="12" sm="6" lg="3">
                <v-combobox
                  ref="fromSelectorId"
                  v-model="fromSelectorId"
                  :label="'Selector ID'"
                  :hint="'E.g. NM_001232.3'"
                  :items="availableSelectors.selectors"
                  :error-messages="errorSelectorIdMessage"
                  :clearable="true"
                  v-on:click="getAvailableSelectors()"
                ></v-combobox>
              </v-col>

              <v-col cols="12" sm="6" lg="3">
                <v-select
                  :items="['Reference', 'Selector', 'g', 'c', 'n']"
                  v-model="fromCoordinateSystem"
                  label="Coordinate system"
                  :clearable="true"
                ></v-select>
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
            </v-row>
            <v-row>
              <v-subheader>To</v-subheader>
            </v-row>
            <v-divider></v-divider>
            <v-row class="pl-2 pr-2">
              <v-col cols="12" sm="6" lg="3">
                <v-combobox
                  v-model="toSelectorId"
                  :label="'Selector ID'"
                  :hint="'E.g. NM_001232.3'"
                  :items="availableSelectors.selectors"
                  :clearable="true"
                  v-on:click="getAvailableSelectors()"
                ></v-combobox>
              </v-col>

              <v-col cols="12" sm="6" lg="3">
                <v-select
                  v-model="toCoordinateSystem"
                  :items="['Reference', 'Selector', 'g', 'c', 'n']"
                  :clearable="true"
                  label="Coordinate system"
                ></v-select>
              </v-col>
            </v-row>
            <v-row class="mt--10">
              <v-col>
                <v-switch
                  v-model="includeOverlapping"
                  label="Include overlapping selectors"
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
                  fromSelectorId: fromSelectorId,
                  fromCoordinateSystem: fromCoordinateSystem,
                  position: position,
                  toSelectorId: toSelectorId,
                  toCoordinateSystem: toCoordinateSystem,
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

        <v-overlay :absolute="true" :value="loadingOverlay">
          <div class="text-center">
            <v-progress-circular :size="50" indeterminate></v-progress-circular>
          </div>
          <div class="text-center">
            <v-btn @click="loadingOverlay = false" class="mt-5">
              Cancel
            </v-btn>
          </div>
        </v-overlay>

        <div v-if="errorMessages">
          <v-alert
            border="right"
            dark
            colored-border
            type="error"
            elevation="2"
            tile
            class="mt-5"
            v-for="(error, i) in errorMessages"
            :key="i"
          >
            {{ getError(error) }}
          </v-alert>
        </div>

        <v-sheet elevation="2" class="pa-10 mt-10" v-if="conversion">
          <v-row>
            <v-col>
              <div class="overline mb-4">Input Position</div>
              <div class="">
                <span class="description">
                  {{
                    getDescription(
                      conversion.reference_id,
                      conversion.input_position
                    )
                  }}
                </span>
              </div>
            </v-col>
          </v-row>
          <v-row>
            <v-col>
              <div class="overline mb-4">Converted Position</div>
              <div>
                <span class="description">
                  {{
                    getDescription(
                      conversion.reference_id,
                      conversion.converted_position
                    )
                  }}
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
                  {{ getDescription(conversion.reference_id, selector) }}
                </span>
              </div>
            </v-col>
          </v-row>
        </v-sheet>

        <div v-if="infos">
          <v-alert
            border="right"
            colored-border
            type="info"
            elevation="2"
            tile
            class="mt-5"
            v-for="(info, i) in infos"
            :key="i"
          >
            {{ getInfo(info) }}
          </v-alert>
        </div>

        <v-alert
          ref="errorAlert"
          class="mt-10  pt-6"
          border="top"
          color="red lighten-2"
          elevation="2"
          tile
          dark
          v-if="summary && !convertedModel"
          type="error"
        >
          Conversion not performed. Please check the errors below.
        </v-alert>

        <v-alert
          ref="successAlert"
          class="mt-10 pt-6"
          border="top"
          color="green lighten-2"
          elevation="2"
          tile
          dark
          v-if="summary && convertedModel"
          type="success"
        >
          Conversion performed.
        </v-alert>

        <v-sheet elevation="2" class="pa-10 mt-10" v-if="inputModel">
          <div class="overline mb-4">Input</div>
          <ModelView :model="inputModel" />
        </v-sheet>

        <v-sheet elevation="2" class="pa-10 mt-10" v-if="convertedModel">
          <div class="overline mb-4">Converted To</div>
          <ModelView :model="convertedModel" />
        </v-sheet>

        <v-expansion-panels focusable hover class="mt-10 mb-10" v-if="summary">
          <v-expansion-panel>
            <v-expansion-panel-header>Raw Response</v-expansion-panel-header>
            <v-expansion-panel-content>
              <JsonPretty :summary="summary" />
            </v-expansion-panel-content>
          </v-expansion-panel>
        </v-expansion-panels>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
import JsonPretty from "../components/JsonPretty.vue";
import ModelView from "../components/ModelView.vue";
import MutalyzerService from "../services/MutalyzerService.js";

export default {
  components: {
    JsonPretty,
    ModelView
  },
  data: () => ({
    valid: true,
    lazy: false,

    referenceId: "",
    fromSelectorId: "",
    fromCoordinateSystem: "",
    position: "",
    toSelectorId: "",
    toCoordinateSystem: "",
    includeOverlapping: false,

    rules: [value => !!value || "Required."],
    loadingOverlay: false,

    summary: null,
    showSummary: false,
    inputModel: null,
    convertedModel: null,
    conversion: null,
    infos: null,
    responseApi: null,
    errorMessages: [],
    errorReferenceId: null,
    errorReferenceIdMessage: null,
    errorSelectorId: null,
    errorSelectorIdMessage: null,
    errorPosition: null,
    errorPositionMessage: null,
    referenceErrors: null,
    otherSelectors: null,
    availableSelectors: {},
    examples: [
      {
        item: "LRG_24:g.100 -> t1",
        fields: {
          referenceId: "LRG_24",
          position: "100",
          toSelectorId: "t1"
        }
      },
      {
        item: "NG_007485.1(NR_047542.1):n.274 -> g.",
        fields: {
          referenceId: "NG_007485.1",
          fromSelectorId: "NR_047542.1",
          position: "274"
        }
      },
      {
        item: "NG_017013.2(NM_000546.5):c.274 -> NM_000546.5",
        fields: {
          referenceId: "NG_017013.2",
          fromSelectorId: "NM_000546.5",
          fromCoordinateSystem: "Selector",
          position: "274"
        }
      },
      {
        item: "NG_012337.1:g.274 -> NG_012337.1(NM_003002.2)",
        fields: {
          referenceId: "NG_012337.1",
          position: "274",
          toSelectorId: "NM_003002.2"
        }
      },
      {
        item: "NC_000001.11(NM_001232.4):c.274 -> NC_000001.11",
        fields: {
          referenceId: "NC_000001.11",
          fromSelectorId: "NM_001232.4",
          fromCoordinateSystem: "Selector",
          position: "274"
        }
      }
    ]
  }),
  created: function() {
    this.run();
  },
  watch: {
    $route() {
      this.run();
    },
    referenceId() {
      if (this.availableSelectors.reference !== this.referenceId) {
        this.availableSelectors = {};
      }
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
        this.$route.query.fromSelectorId &&
        0 !== this.$route.query.fromSelectorId.length
      ) {
        this.fromSelectorId = this.$route.query.fromSelectorId;
      }
      if (
        this.$route.query.fromCoordinateSystem &&
        0 !== this.$route.query.fromCoordinateSystem.length
      ) {
        this.fromCoordinateSystem = this.$route.query.fromCoordinateSystem;
      }
      if (
        this.$route.query.position &&
        0 !== this.$route.query.position.length
      ) {
        this.position = this.$route.query.position;
      }
      if (
        this.$route.query.toSelectorId &&
        0 !== this.$route.query.toSelectorId.length
      ) {
        this.toSelectorId = this.$route.query.toSelectorId;
      }
      if (
        this.$route.query.toCoordinateSystem &&
        0 !== this.$route.query.toCoordinateSystem.length
      ) {
        this.toCoordinateSystem = this.$route.query.toCoordinateSystem;
      }
      if (this.$route.query.includeOverlapping) {
        if (this.$route.query.includeOverlapping === "true") {
          this.includeOverlapping = true;
        } else if (this.$route.query.includeOverlapping === "false") {
          this.includeOverlapping = false;
        }
      }
      if (
        this.$route.query.referenceId &&
        0 !== this.$route.query.referenceId.length &&
        this.$route.query.position &&
        0 !== this.$route.query.position.length
      ) {
        this.positionConvert();
      }
    },
    setExample: function(fields) {
      if (fields.referenceId) {
        this.referenceId = fields.referenceId;
      } else {
        this.referenceId = "";
      }
      if (fields.fromSelectorId) {
        this.fromSelectorId = fields.fromSelectorId;
      } else {
        this.fromSelectorId = "";
      }
      if (fields.fromCoordinateSystem) {
        this.fromCoordinateSystem = fields.fromCoordinateSystem;
      } else {
        this.fromCoordinateSystem = "";
      }
      if (fields.position) {
        this.position = fields.position;
      } else {
        this.position = "";
      }
      if (fields.toSelectorId) {
        this.toSelectorId = fields.toSelectorId;
      } else {
        this.toSelectorId = "";
      }
      if (fields.toCoordinateSystem) {
        this.toCoordinateSystem = fields.toCoordinateSystem;
      } else {
        this.toCoordinateSystem = "";
      }
    },
    positionConvert: function() {
      this.errorMessages = [];
      if (this.referenceId !== null && this.position !== null) {
        this.loadingOverlay = true;
        this.summary = null;
        this.inputModel = null;
        this.convertedModel = null;
        this.conversion = null;
        this.infos = null;
        this.otherSelectors = null;
        this.responseApi = null;
        const params = {
          reference_id: this.referenceId,
          from_selector_id: this.fromSelectorId,
          from_coordinate_system: this.fromCoordinateSystem,
          position: this.position,
          to_selector_id: this.toSelectorId,
          to_coordinate_system: this.toCoordinateSystem,
          include_overlapping: this.includeOverlapping
        };
        MutalyzerService.positionConvert(params)
          .then(response => {
            if (response.data) {
              this.loadingOverlay = false;
              this.responseApi = response.data;
              this.responseHandler(response.data);
              this.loadingOverlay = false;
            }
          })
          .catch(error => {
            this.loadingOverlay = false;
            if (error.response) {
              // The request was made and the server responded with a status code
              // that falls out of the range of 2xx
              this.errorMessages = [
                { details: "Some response error occured." }
              ];
              // console.log(error.response.data);
              // console.log(error.response.status);
              // console.log(error.response.headers);
            } else if (error.request) {
              this.errorMessages = [
                { details: "Some error occured on the server side." }
              ];
              // The request was made but no response was received
              // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
              // http.ClientRequest in node.js
              // console.log(error.request);
            } else {
              this.errorMessages = [{ details: "Some error occured." }];
              // console.log(error);
              // Something happened in setting up the request that triggered an Error
              // console.log("Error", error.message);
            }
            // console.log(error.config);
          });
      }
    },
    responseHandler: function(response) {
      this.summary = response;
      if ("errors" in response) {
        this.errorsHandler(response.errors);
      }
      if (this.summary.conversion) {
        this.conversion = this.summary.conversion;
        if (this.conversion.overlapping) {
          this.otherSelectors = this.conversion.overlapping;
        }
      }
      if (this.summary.infos) {
        this.infos = this.summary.infos;
      }
      if (this.summary.input_model) {
        this.inputModel = this.summary.input_model;
      }
      if (this.summary.converted_model) {
        this.convertedModel = this.summary.converted_model;
        this.$nextTick(() => {
          console.log(this.$refs.successAlert);
          this.$vuetify.goTo(this.$refs.successAlert, this.options);
        });
      }
    },
    errorsHandler: function(errors) {
      for (const entry of errors) {
        this.errorMessages.push(entry);
        if (entry.code === "ERETR") {
          // this.errorMessages =
          //   "Unable to retrieve reference " + this.referenceId;
          // this.referenceErrors = [
          //   "Unable to retrieve reference " + this.referenceId
          // ];
          this.errorReferenceId = this.referenceId;
          this.handleEretr();
        } else if (entry.code === "ENOSELECTOR") {
          // this.errorMessages =
          //   "Selector " +
          //   this.selectorId +
          //   " not found in reference " +
          //   this.referenceId;
          this.errorSelectorId = this.selectorId;
          this.errorReferenceId = this.referenceId;
          this.handleEnoselector();
        } else if (entry.code === "ESYNTAX") {
          this.errorMessages = "Position syntax error.";
        } else if (entry.code === "ERANGELOCATION") {
          // this.errorMessages = "";
          this.errorPosition = this.position;
          this.updatePositionErrorMessage("Range locations not supported.");
        } else if (entry.code === "EOUTOFBOUNDARY") {
          this.errorPosition = this.position;
          this.updatePositionErrorMessage(
            "Position out of sequence boundaries."
          );
        }
        // else {
        //   if (entry.code) {
        //     this.errorMessages = entry.code + " occurred.";
        //   }
        // }
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
    },
    getAvailableSelectors: function() {
      if (this.referenceId !== null && 0 !== this.referenceId.length) {
        if (
          this.availableSelectors &&
          this.availableSelectors.reference !== this.referenceId
        ) {
          MutalyzerService.positionConvert(this.referenceId).then(response => {
            if (response.data) {
              this.availableSelectors = response.data;
            }
          });
        }
      }
    },
    getDescription: function(reference_id, position) {
      let output = reference_id;
      if (position.selector_id) {
        output += "(" + position.selector_id + ")";
      }
      output += ":" + position.coordinate_system + ".";
      output += position.position;
      return output;
    },
    getInfo: function(info) {
      let output = info.code;
      if (info.details) {
        output += ": " + info.details;
      }
      return output;
    },
    getInfos: function() {
      console.log("to be implemented");
    },
    getError: function(error) {
      let output = "";
      if (error.code) {
        output += error.code;
        if (error.details) {
          output += ": " + error.details;
        }
      } else {
        if (error.details) {
          output += error.details;
        }
      }

      return output;
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
