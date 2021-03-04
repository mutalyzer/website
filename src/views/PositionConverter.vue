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
                  :click="getAvailableSelectors()"
                  :clearable="true"
                  :error-messages="errorFromSelectorIdMessage"
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
                  :click="getAvailableSelectors()"
                  :clearable="true"
                  :error-messages="errorToSelectorIdMessage"
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
                  includeOverlapping: includeOverlapping,
                },
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
            <v-btn @click="loadingOverlay = false" class="mt-5"> Cancel </v-btn>
          </div>
        </v-overlay>

        <v-alert
          ref="successAlert"
          class="mt-10 mb-0"
          elevation="2"
          prominent
          tile
          v-if="isConverted()"
          type="success"
        >
          <v-row align="center">
            <v-col class="grow">
              <span style="font-family: monospace">{{
                converted_description
              }}</span>
            </v-col>
            <v-col class="shrink">
              <v-tooltip bottom>
                <template v-slot:activator="{ on, attrs }">
                  <v-btn
                    v-bind="attrs"
                    v-on="on"
                    icon
                    v-clipboard="converted_description"
                  >
                    <v-icon>mdi-content-copy</v-icon>
                  </v-btn>
                </template>
                <span>Copy</span>
              </v-tooltip>
            </v-col>
            <v-col class="shrink" v-if="correctionsPerformed()">
              <v-tooltip bottom>
                <template v-slot:activator="{ on, attrs }">
                  <v-btn
                    v-bind="attrs"
                    v-on="on"
                    icon
                    @click="showCorrections = !showCorrections"
                  >
                    <v-icon>
                      mdi-details {{ showCorrections ? "mdi-rotate-180" : "" }}
                    </v-icon>
                  </v-btn>
                </template>
                <span>{{ showCorrections ? "Hide" : "See" }} Details</span>
              </v-tooltip>
            </v-col>
          </v-row>
        </v-alert>

        <v-alert
          prominent
          type="error"
          tile
          elevation="2"
          class="mt-10"
          icon="mdi-network-off-outline"
          color="grey darken-4"
          v-if="connectionErrors"
        >
          <v-row align="center">
            <v-col class="grow">
              {{ connectionErrors.details }}
            </v-col>
          </v-row>
        </v-alert>

        <v-alert
          prominent
          type="error"
          tile
          elevation="2"
          class="mt-10 mb-0"
          v-if="response && response.errors"
        >
          <v-row align="center">
            <v-col class="grow overline">Error</v-col>
            <v-col class="shrink" v-if="correctionsPerformed()">
              <v-tooltip bottom>
                <template v-slot:activator="{ on, attrs }">
                  <v-btn
                    v-bind="attrs"
                    v-on="on"
                    icon
                    @click="showCorrections = !showCorrections"
                  >
                    <v-icon>
                      mdi-details {{ showCorrections ? "mdi-rotate-180" : "" }}
                    </v-icon>
                  </v-btn>
                </template>
                <span>{{ showCorrections ? "Hide" : "See" }} Details</span>
              </v-tooltip>
            </v-col>
          </v-row>
        </v-alert>

        <v-expand-transition>
          <v-sheet
            elevation="2"
            v-if="
              (correctionsPerformed() && showCorrections) || errorsEncountered()
            "
          >
            <v-expand-transition>
              <v-sheet
                ref="refCorrections"
                class="pt-5 pr-10 pb-5 pl-10"
                color="grey lighten-5"
                v-if="correctionsPerformed() && showCorrections"
              >
                <div class="overline">Corrections</div>
                <v-alert
                  color="light-blue lighten-5"
                  tile
                  border="left"
                  class="ml-2"
                  v-for="(info, index) in response.infos"
                  :key="index"
                >
                  {{ getMessage(info) }}
                </v-alert>
              </v-sheet>
            </v-expand-transition>
            <v-sheet
              class="pt-10 pr-10 pb-8 pl-10"
              color="red lighten-5"
              v-if="errorsEncountered()"
            >
              <v-alert
                color="red lighten-1"
                tile
                border="left"
                dark
                v-for="(error, index) in response.errors"
                :key="index"
              >
                <div v-if="error.code == 'EPOSITIONSYNTAX'">
                  <SyntaxError :errorModel="error" />
                </div>
                <div v-else>
                  {{ getMessage(error) }}
                </div>
              </v-alert>
            </v-sheet>
          </v-sheet>
        </v-expand-transition>

        <v-expansion-panels
          focusable
          hover
          class="mt-5 mb-5"
          tile
          v-if="response && response.overlap"
        >
          <v-expansion-panel>
            <v-expansion-panel-header class="overline"
              >Overlapping selectors</v-expansion-panel-header
            >
            <v-expansion-panel-content class="pt-5">
              <div
                class="ml-4"
                v-for="(values, c_s) in response.overlap"
                :key="c_s"
              >
                <span v-if="c_s == 'c'">Coding</span>
                <span v-else-if="c_s == 'n'">Noncoding</span>
                <span v-else-if="c_s == 'g'">Genomic</span>
                <span v-else> {{ c_s }} </span>
                <div v-for="(overlap_model, index) in values" :key="index">
                  <template v-if="c_s === 'c'">
                    <span class="ok-description">
                      {{ modelToDescription(overlap_model) }}
                    </span>
                  </template>
                  <template v-else>
                    <span class="ok-description">
                      {{ modelToDescription(overlap_model) }}
                    </span>
                  </template>
                </div>
              </div>
            </v-expansion-panel-content>
          </v-expansion-panel>
        </v-expansion-panels>

        <v-expansion-panels focusable hover class="mt-10 mb-10" v-if="response">
          <v-expansion-panel>
            <v-expansion-panel-header>Raw Response</v-expansion-panel-header>
            <v-expansion-panel-content>
              <JsonPretty :summary="response" />
            </v-expansion-panel-content>
          </v-expansion-panel>
        </v-expansion-panels>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
import JsonPretty from "../components/JsonPretty.vue";
import MutalyzerService from "../services/MutalyzerService.js";
import DescriptionModel from "../mixins/DescriptionModel.js";
import SyntaxError from "../components/SyntaxError.vue";

export default {
  components: {
    JsonPretty,
    SyntaxError,
  },
  mixins: [DescriptionModel],
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

    rules: [(value) => !!value || "Required."],
    loadingOverlay: false,

    response: null,
    converted_description: null,
    errorMessages: [],
    errorReferenceId: null,
    errorReferenceIdMessage: null,
    errorFromSelectorId: null,
    errorFromSelectorIdMessage: null,
    errorToSelectorId: null,
    errorToSelectorIdMessage: null,
    errorPosition: null,
    errorPositionMessage: null,
    referenceErrors: null,
    otherSelectors: null,
    availableSelectors: {},

    showCorrections: false,
    connectionErrors: null,

    examples: [
      {
        item: "LRG_24:g.100 -> t1",
        fields: {
          referenceId: "LRG_24",
          position: "100",
          toSelectorId: "t1",
        },
      },
      {
        item: "NG_007485.1(NR_047542.1):n.274 -> g.",
        fields: {
          referenceId: "NG_007485.1",
          fromSelectorId: "NR_047542.1",
          position: "274",
        },
      },
      {
        item: "NG_017013.2(NM_000546.5):c.274 -> NM_000546.5",
        fields: {
          referenceId: "NG_017013.2",
          fromSelectorId: "NM_000546.5",
          fromCoordinateSystem: "Selector",
          position: "274",
        },
      },
      {
        item: "NG_012337.1:g.274 -> NG_012337.1(NM_003002.2)",
        fields: {
          referenceId: "NG_012337.1",
          position: "274",
          toSelectorId: "NM_003002.2",
        },
      },
      {
        item: "NC_000001.11(NM_001232.4):c.274 -> NC_000001.11",
        fields: {
          referenceId: "NC_000001.11",
          fromSelectorId: "NM_001232.4",
          fromCoordinateSystem: "Selector",
          position: "274",
        },
      },
    ],
  }),
  created: function () {
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
    },
    fromSelectorId() {
      this.handleENoFromSelector();
    },
    toSelectorId() {
      this.handleENoToSelector();
    },
    position() {
      this.updatePositionErrorMessage();
    },
  },
  methods: {
    run: function () {
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
    setExample: function (fields) {
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
    positionConvert: function () {
      this.errorMessages = [];
      if (this.referenceId !== null && this.position !== null) {
        this.loadingOverlay = true;
        this.response = null;
        this.converted_description = null;
        this.showCorrections = false;
        this.connectionErrors = null;

        const params = {
          reference_id: this.referenceId,
          from_selector_id: this.fromSelectorId,
          from_coordinate_system: this.fromCoordinateSystem,
          position: this.position,
          to_selector_id: this.toSelectorId,
          to_coordinate_system: this.toCoordinateSystem,
          include_overlapping: this.includeOverlapping,
        };
        MutalyzerService.positionConvert(params)
          .then((response) => {
            if (response.data) {
              this.loadingOverlay = false;
              this.response = response.data;
              if (response.data.errors) {
                this.errorsHandler(response.data.errors);
              }
              if (this.isConverted()) {
                this.converted_description = this.modelToDescription(
                  this.response.converted_model
                );
                this.$nextTick(() => {
                  this.$vuetify.goTo(this.$refs.successAlert, this.options);
                });
              }
            }
          })
          .catch((error) => {
            this.loadingOverlay = false;
            if (error.response) {
              this.connectionErrors = {
                details: "Some response error occured.",
              };
            } else if (error.request) {
              this.connectionErrors = {
                details: "Some connection or server error occured.",
              };
            } else {
              this.connectionErrors = { details: "Some error occured." };
            }
          });
      }
    },
    isConverted: function () {
      if (this.response && this.response.converted_model) {
        return true;
      } else {
        return false;
      }
    },
    correctionsPerformed: function () {
      return this.response && this.response.infos;
    },
    errorsEncountered: function () {
      if (this.response && this.response.errors) {
        return true;
      } else {
        return false;
      }
    },
    getMessage: function (message) {
      if (message.details) {
        return message.details + " (" + message.code + ")";
      }
      return message;
    },
    errorsHandler: function (errors) {
      for (const entry of errors) {
        this.errorMessages.push(entry);
        if (entry.code === "ERETR") {
          this.errorReferenceId = this.referenceId;
          this.handleEretr();
        } else if (entry.code === "ENOSELECTORFOUND") {
          this.errorFromSelectorId = this.fromSelectorId;
          this.handleENoFromSelector();
        } else if (entry.code === "ENOTOSELECTOR") {
          this.errorToSelectorId = this.toSelectorId;
          this.handleENoToSelector();
        } else if (entry.code === "EPOSITIONSYNTAX") {
          this.errorPosition = this.position;
          this.updatePositionErrorMessage("Syntax error.");
        } else if (entry.code === "ERANGELOCATION") {
          this.errorPosition = this.position;
          this.updatePositionErrorMessage("Range locations not supported.");
        } else if (entry.code === "EOUTOFBOUNDARY") {
          this.errorPosition = this.position;
          this.updatePositionErrorMessage(
            "Position out of sequence boundaries."
          );
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
    handleENoFromSelector() {
      if (
        this.errorFromSelectorId &&
        this.errorFromSelectorId === this.fromSelectorId
      ) {
        this.errorFromSelectorIdMessage =
          this.fromSelectorId + " not found in " + this.referenceId;
      } else {
        this.errorFromSelectorIdMessage = null;
      }
    },
    handleENoToSelector() {
      if (
        this.errorToSelectorId &&
        this.errorToSelectorId === this.toSelectorId
      ) {
        this.errorToSelectorIdMessage =
          this.toSelectorId + " not in reference " + this.referenceId;
      } else {
        this.errorToSelectorIdMessage = null;
      }
    },
    updatePositionErrorMessage(message) {
      if (this.errorPosition && this.errorPosition === this.position) {
        this.errorPositionMessage = message;
      } else {
        this.errorPositionMessage = null;
      }
    },
    getAvailableSelectors: function () {
      if (this.referenceId !== null && 0 !== this.referenceId.length) {
        if (
          this.availableSelectors &&
          this.availableSelectors.reference !== this.referenceId
        ) {
          MutalyzerService.getSelectors(this.referenceId).then((response) => {
            if (response.data) {
              this.availableSelectors = response.data;
            }
          });
        }
      }
    },
    getDescription: function (reference_id, position) {
      let output = reference_id;
      if (position.selector_id) {
        output += "(" + position.selector_id + ")";
      }
      output += ":" + position.coordinate_system + ".";
      output += position.position;
      return output;
    },
  },
};
</script>

<style scoped src="../assets/main.css"></style>
