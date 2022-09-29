<template>
  <v-container>
    <v-layout>
      <v-flex xs12>
        <h1 class="display-1 mt-10">Experimental Name Checker</h1>
        <p>Using the algebra based extractor.</p>
        <v-sheet elevation="2" class="pa-5 mt-10">
          <v-row class="pt-1 pr-0">
            <v-spacer></v-spacer>
            <v-menu open-on-hover bottom left content-class="elevation-2">
              <template v-slot:activator="{ on, attrs }">
                <v-btn color="blue" icon v-bind="attrs" v-on="on">
                  <v-icon>mdi-dots-vertical</v-icon>
                </v-btn>
              </template>

              <v-list>
                <v-list-item class="text-right">
                  <v-btn small text color="primary" @click="switchMode()">{{
                    getSwitchText()
                  }}</v-btn>
                </v-list-item>
              </v-list>
            </v-menu>
          </v-row>
          <v-row class="pt-5 pr-5 pl-5" v-if="mode == 'hgvs'">
            <v-text-field
              class="pa-0 ma-0"
              :rules="rules"
              ref="refInputDescriptionTextBox"
              v-model="inputDescriptionTextBox"
              :label="inputDescriptionTextBoxLabel"
              v-on:keydown.enter="
                $router.push({
                  name: 'NameCheckerAlt',
                  params: { descriptionRouter: inputDescriptionTextBox },
                })
              "
              :clearable="true"
              autofocus
            ></v-text-field>
          </v-row>

          <v-row class="pl-5 pr-5 mt-2" v-if="mode == 'hgvs'">
            <div class="examples-list">
              <span class="example-text">Examples:</span>
              <span
                class="example-item"
                v-for="(example, index) in descriptionExamples"
                :key="index"
                @click.prevent="selectDescriptionExample(index)"
                >{{ example }}</span
              >
            </div>
          </v-row>

          <v-row class="pt-5 pr-5 pl-5" v-if="mode == 'sequence'">
            <v-text-field
              class="pa-0 ma-0"
              :rules="rules"
              v-model="sequence"
              label="Reference Sequence"
              :clearable="true"
            ></v-text-field>
          </v-row>

          <v-row class="pl-5 pr-5" v-if="mode == 'sequence'">
            <v-text-field
              class="pa-0 ma-0"
              :rules="rules"
              ref="refInputDescriptionTextBox"
              v-model="inputDescriptionTextBox"
              label="Variants"
              :clearable="true"
            ></v-text-field>
          </v-row>

          <v-row class="pl-5" v-if="mode == 'sequence'">
            <div class="examples-list">
              <span class="example-link" @click="setSequenceExample()"
                >Example</span
              >
            </div>
          </v-row>

          <v-row class="pl-5 pb-5">
            <v-btn
              ref="nameCheck"
              class="mt-5"
              color="primary"
              :disabled="!valid"
              :to="{
                name: 'NameCheckerAlt',
                params: { descriptionRouter: inputDescriptionTextBox },
                query: getParams(),
              }"
            >
              Normalize
            </v-btn>
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
          v-if="isNormalized()"
          :color="getNormalizedColor()"
          type="success"
        >
          <v-row align="center">
            <v-col class="grow">
              <Description
                :description="response.normalized_description"
                :tooltip="
                  response.normalized_description != inputDescription
                    ? 'Different than the input description'
                    : 'Same as the input description'
                "
                :css_class="
                  response.normalized_description != inputDescription
                    ? 'corrected-description-link-reverse'
                    : 'ok-description-link-reverse'
                "
                :to_name="'NameCheckerAlt'"
                :to_params="{
                  descriptionRouter: response.normalized_description,
                }"
                :to_query="getParams()"
              />
            </v-col>
            <v-col class="shrink" v-if="infoMessages()">
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
            <v-col class="grow overline"
              >Description could not be interpreted</v-col
            >
            <v-col class="shrink" v-if="infoMessages()">
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
            v-if="(infoMessages() && showCorrections) || errorsEncountered()"
          >
            <v-expand-transition>
              <v-sheet
                ref="refCorrections"
                class="pt-5 pr-10 pb-5 pl-10"
                color="grey lighten-5"
                v-if="infoMessages() && showCorrections"
              >
                <div v-if="correctionsPerformed()" class="overline">
                  Input Description
                </div>
                <div
                  v-if="correctionsPerformed()"
                  :class="getInputDescriptionClass()"
                >
                  {{ inputDescription }}
                </div>
                <div v-if="response.infos">
                  <div class="overline">Corrections / Info Messages</div>
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
                </div>
                <div v-if="correctionsPerformed() && showCorrections">
                  <div class="overline">Corrected Description</div>
                  <div :class="getCorrectedDescriptionClass()">
                    {{ response.corrected_description }}
                  </div>
                </div>
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
                <div v-if="syntaxError()">
                  <SyntaxError :errorModel="getSyntaxError()" />
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
          v-if="response && response.supremal"
        >
          <v-expansion-panel>
            <v-expansion-panel-header class="overline"
              >Supremal Representation
            </v-expansion-panel-header>
            <v-expansion-panel-content class="pt-5">
              <div class="overline">HGVS</div>
              <Description
                :description="response.supremal.hgvs"
                :css_class="'ok-description-link'"
                :to_name="'NameCheckerAlt'"
                :to_params="{ descriptionRouter: response.supremal.hgvs }"
                :to_query="getParams()"
              />
              <div class="overline">SPDI</div>
              <Description
                :description="response.supremal.spdi"
                :css_class="'ok-description'"
              />
            </v-expansion-panel-content>
          </v-expansion-panel>
        </v-expansion-panels>

        <v-expansion-panels
          focusable
          hover
          class="mt-5 mb-5"
          tile
          v-if="
            response &&
            response.normalized_description &&
            response.normalized_model
          "
        >
          <v-expansion-panel
            v-if="this.response.view_corrected || this.response.view_normalized"
          >
            <v-expansion-panel-header class="overline"
              >View Variants Sequence Overview</v-expansion-panel-header
            >
            <v-expansion-panel-content class="pt-2 pb-2">
              <div
                v-if="
                  this.response.corrected_description !=
                  this.response.normalized_description
                "
              >
                <div class="overline">Input</div>
                <ViewVariantsCore
                  :view="this.response.view_corrected"
                  :influence="this.response.influence"
                  :d_id="'name_check_corrected'"
                  class="mt-5 mb-5"
                />
              </div>
              <div
                v-if="
                  this.response.corrected_description !=
                  this.response.normalized_description
                "
                class="overline"
              >
                Output
              </div>
              <ViewVariantsCore
                v-if="this.response.normalized_description"
                :view="this.response.view_normalized"
                :influence="this.response.influence"
                :d_id="'name_check_normalized'"
              />
            </v-expansion-panel-content>
          </v-expansion-panel>
        </v-expansion-panels>

        <v-expansion-panels
          focusable
          hover
          class="mt-5 mb-5"
          tile
          v-if="response && response.dot"
        >
          <v-expansion-panel id="dot-graph-container">
            <v-expansion-panel-header class="overline"
              >Minimal Representations Graph</v-expansion-panel-header
            >

            <v-expansion-panel-content class="mt-5">
              <DotGraph :dottext="response.dot" />
            </v-expansion-panel-content>
          </v-expansion-panel>
        </v-expansion-panels>

        <v-expansion-panels
          focusable
          hover
          class="mt-5 mb-5"
          tile
          v-if="response && response.minimal_descriptions"
        >
          <v-expansion-panel>
            <v-expansion-panel-header class="overline">{{
              minimalTitle()
            }}</v-expansion-panel-header>

            <v-expansion-panel-content class="pt-5">
              <div
                v-for="(
                  minimal_description, index
                ) in response.minimal_descriptions"
                :key="index"
              >
                <Description
                  :description="minimal_description"
                  :css_class="'ok-description-link'"
                  :to_name="'NameCheckerAlt'"
                  :to_params="{ descriptionRouter: minimal_description }"
                  :to_query="getParams()"
                />
              </div>
            </v-expansion-panel-content>
          </v-expansion-panel>
        </v-expansion-panels>

        <v-expansion-panels
          focusable
          hover
          class="mt-5 mb-5"
          tile
          v-if="response && response.equivalent_descriptions"
        >
          <v-expansion-panel>
            <v-expansion-panel-header class="overline"
              >Equivalent Descriptions</v-expansion-panel-header
            >
            <v-expansion-panel-content class="pt-5">
              <div
                class="ml-4"
                v-for="(values, c_s) in response.equivalent_descriptions"
                :key="c_s"
              >
                <span v-if="c_s == 'c'">Coding</span>
                <span v-else-if="c_s == 'n'">Noncoding</span>
                <span v-else-if="c_s == 'g'">Genomic</span>
                <span v-else-if="c_s == 'p'"></span>
                <span v-else> {{ c_s }} </span>
                <div
                  v-for="(equivalentDescription, index) in values"
                  :key="index"
                >
                  <template v-if="c_s === 'c'">
                    <Description
                      :description="equivalentDescription[0]"
                      :css_class="'ok-description-link'"
                      :to_name="'NameCheckerAlt'"
                      :to_params="{
                        descriptionRouter: equivalentDescription[0],
                      }"
                    />
                  </template>
                  <template v-else>
                    <Description
                      :description="equivalentDescription"
                      :css_class="'ok-description-link'"
                      :to_name="'NameCheckerAlt'"
                      :to_params="{ descriptionRouter: equivalentDescription }"
                    />
                  </template>
                </div>
              </div>
            </v-expansion-panel-content>
          </v-expansion-panel>
        </v-expansion-panels>

        <v-expansion-panels
          focusable
          hover
          class="mt-5 mb-5"
          tile
          v-if="response && response.back_translated_descriptions"
        >
          <v-expansion-panel>
            <v-expansion-panel-header class="overline"
              >Back Translated Descriptions</v-expansion-panel-header
            >
            <v-expansion-panel-content class="pt-5">
              <div
                v-for="(
                  equivalentDescription, index
                ) in response.back_translated_descriptions"
                :key="index"
              >
                <router-link
                  class="ok-description-link"
                  :to="{
                    name: 'NameCheckerAlt',
                    params: { descriptionRouter: equivalentDescription },
                  }"
                  >{{ equivalentDescription }}</router-link
                >
              </div>
            </v-expansion-panel-content>
          </v-expansion-panel>
        </v-expansion-panels>

        <v-expansion-panels
          focusable
          hover
          class="mt-5 mb-5"
          tile
          v-if="response && response.rna"
        >
          <v-expansion-panel>
            <v-expansion-panel-header class="overline"
              >RNA Prediction</v-expansion-panel-header
            >
            <v-expansion-panel-content class="pt-5">
              <v-sheet v-if="response.rna.errors">
                <v-alert
                  color="red lighten-1"
                  tile
                  border="left"
                  dark
                  v-for="(error, index) in response.rna.errors"
                  :key="index"
                >
                  <div>
                    {{ getMessage(error) }}
                  </div>
                </v-alert>
              </v-sheet>

              <div class="mt-4 mb-4" v-if="response.rna.description">
                <Description
                  :description="response.rna.description"
                  :css_class="'ok-description-link'"
                  :to_name="'NameCheckerAlt'"
                  :to_params="{ descriptionRouter: response.rna.description }"
                />
              </div>
            </v-expansion-panel-content>
          </v-expansion-panel>
        </v-expansion-panels>

        <v-expansion-panels
          focusable
          hover
          class="mt-5 mb-5"
          tile
          v-if="response && response.protein"
        >
          <v-expansion-panel>
            <v-expansion-panel-header class="overline"
              >Protein Prediction</v-expansion-panel-header
            >
            <v-expansion-panel-content class="pt-5">
              <v-sheet v-if="response.protein.errors">
                <v-alert
                  color="red lighten-1"
                  tile
                  border="left"
                  dark
                  v-for="(error, index) in response.rna.errors"
                  :key="index"
                >
                  <div>
                    {{ getMessage(error) }}
                  </div>
                </v-alert>
              </v-sheet>
              <AffectedProtein v-else :protein="this.response.protein" />
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
import MutalyzerService from "../services/MutalyzerService.js";
import JsonPretty from "../components/JsonPretty.vue";
import SyntaxError from "../components/SyntaxError.vue";
import ViewVariantsCore from "../components/ViewVariantsCore.vue";
import Description from "../components/Description.vue";
import DotGraph from "../components/DotGraph.vue";
import AffectedProtein from "../components/AffectedProtein.vue";

export default {
  components: {
    JsonPretty,
    SyntaxError,
    ViewVariantsCore,
    Description,
    DotGraph,
    AffectedProtein,
  },
  props: ["descriptionRouter"],
  data: () => ({
    valid: true,
    inputDescriptionTextBox: null,
    rules: [(value) => !!value || "Required."],
    inputDescriptionTextBoxLabel: "HGVS Description",
    descriptionExamples: [
      "NC_000007.14:g.117530938del",
      "NC_000007.14:g.117548635dup",
      "NC_000007.14:g.117518409_117518410insTA",
    ],
    loadingOverlay: false,
    inputDescription: null, // The description for which the most recent call was sent.
    response: null,
    connectionErrors: null,
    showCorrections: false,
    sequence: null,
    only_variants: false,
    mode: "hgvs",
  }),
  created: function () {
    this.run();
  },
  watch: {
    $route() {
      this.run();
    },
  },
  methods: {
    run: function () {
      this.setRouterParams();
      this.nameCheck();
    },
    setRouterParams: function () {
      if (
        this.descriptionRouter &&
        this.descriptionRouter.length !== 0 &&
        !this.$route.query.only_variants &&
        !this.$route.query.sequence
      ) {
        this.inputDescriptionTextBox = this.descriptionRouter;
        this.mode = "hgvs";
      } else if (
        this.descriptionRouter &&
        this.descriptionRouter.length !== 0 &&
        this.$route.query.only_variants &&
        this.$route.query.sequence &&
        this.$route.query.sequence.length !== 0
      ) {
        this.inputDescriptionTextBox = this.descriptionRouter;
        this.only_variants = this.$route.query.only_variants;
        this.sequence = this.$route.query.sequence;
        this.mode = "sequence";
      } else if (
        !this.descriptionRouter &&
        !this.$route.query.only_variants &&
        !this.$route.query.sequence
      ) {
        this.mode = "hgvs";
      } else {
        this.$router.push({
          name: "NameCheckerAlt",
        });
      }
    },
    nameCheck: function () {
      if (this.mode == "hgvs") {
        this.nameCheckHgvs();
      } else if (this.mode == "sequence") {
        this.nameCheckSequence();
      }
    },
    nameCheckHgvs: function () {
      if (this.inputDescriptionTextBox !== null) {
        this.loadingOverlay = true;
        this.inputDescription = null;
        this.response = null;
        this.connectionErrors = null;
        this.showCorrections = false;
        this.inputDescriptionTextBox = this.inputDescriptionTextBox.trim();

        MutalyzerService.nameCheckAltHgvs(this.inputDescriptionTextBox)
          .then((response) => {
            if (response.data) {
              this.loadingOverlay = false;
              this.response = response.data;
              this.inputDescription = this.inputDescriptionTextBox;
              if (this.isNormalized()) {
                this.$nextTick(() => {
                  this.$vuetify.goTo(this.$refs.successAlert, this.options);
                });
              }
            }
          })
          .catch((error) => {
            this.loadingOverlay = false;
            if (error.response) {
              if (
                error.response.status == 422 &&
                error.response.data &&
                error.response.data.custom
              ) {
                this.response = error.response.data.custom;
              } else {
                this.connectionErrors = {
                  details: "Some response error occured.",
                };
              }
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
    nameCheckSequence: function () {
      if (this.inputDescriptionTextBox !== null) {
        this.loadingOverlay = true;
        this.inputDescription = null;
        this.response = null;
        this.connectionErrors = null;
        this.showCorrections = false;
        this.inputDescriptionTextBox = this.inputDescriptionTextBox.trim();

        MutalyzerService.nameCheckAltSequence(
          this.inputDescriptionTextBox,
          this.getParams()
        )
          .then((response) => {
            if (response.data) {
              this.loadingOverlay = false;
              this.response = response.data;
              this.inputDescription = this.inputDescriptionTextBox;
              if (this.isNormalized()) {
                this.$nextTick(() => {
                  this.$vuetify.goTo(this.$refs.successAlert, this.options);
                });
              }
            }
          })
          .catch((error) => {
            this.loadingOverlay = false;
            if (error.response) {
              if (
                error.response.status == 422 &&
                error.response.data &&
                error.response.data.custom
              ) {
                this.response = error.response.data.custom;
              } else {
                this.connectionErrors = {
                  details: "Some response error occured.",
                };
              }
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
    isNormalized: function () {
      if (this.response && this.response.normalized_description) {
        return true;
      } else {
        return false;
      }
    },
    getNormalizedColor: function () {
      if (this.isNormalized()) {
        if (this.response.normalized_description == this.inputDescription) {
          return "green";
        } else {
          return "blue";
        }
      }
    },
    correctionsPerformed: function () {
      return (
        this.response &&
        this.response.corrected_description &&
        this.response.corrected_description != this.inputDescription
      );
    },
    infoMessages: function () {
      return this.response && this.response.infos;
    },
    syntaxError: function () {
      if (this.getSyntaxError()) {
        return true;
      } else {
        return false;
      }
    },
    getSyntaxError: function () {
      if (this.response && this.response.errors) {
        let errors = this.response.errors;
        if (
          (errors.length === 1 && errors[0].code === "ESYNTAXUEOF") ||
          errors[0].code === "ESYNTAXUC"
        ) {
          return errors[0];
        }
      }
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
    getInputDescriptionClass: function () {
      if (this.response) {
        if (
          this.response.normalized_description &&
          this.response.normalized_description == this.inputDescription
        ) {
          return "ok-description";
        } else if (
          this.response.corrected_description &&
          this.response.corrected_description == this.inputDescription
        ) {
          return "normalized-description";
        } else if (
          this.response.corrected_description &&
          !this.response.errors
        ) {
          return "corrected-description";
        } else {
          return "error-description";
        }
      }
    },
    getCorrectedDescriptionClass: function () {
      if (this.response) {
        if (
          this.response.normalized_description &&
          this.response.corrected_description &&
          this.response.normalized_description ==
            this.response.corrected_description
        ) {
          return "ok-description";
        } else if (
          this.response.normalized_description &&
          this.response.corrected_description &&
          this.response.normalized_description != this.inputDescription
        ) {
          return "corrected-description";
        } else if (
          this.response.corrected_description &&
          this.response.errors
        ) {
          return "error-description";
        } else {
          return "description";
        }
      }
    },
    showReferenceInformation() {
      if (
        this.response &&
        this.response.corrected_description &&
        !this.response.only_variants
      ) {
        if (this.response.errors) {
          for (let error of this.response.errors) {
            if (error.code && error.code == "ERETR") {
              return false;
            }
          }
        }
        return true;
      } else {
        return false;
      }
    },
    reset: function () {
      this.inputDescriptionTextBox = null;
      this.only_variants = false;
      this.sequence = null;
      this.response = null;
    },
    switchMode: function () {
      if (this.mode == "sequence") {
        this.mode = "hgvs";
        this.reset();
        if (this.$route.query.descriptionRouter) {
          this.$router.push({
            name: "NameCheckerAlt",
          });
        }
      } else if (this.mode == "hgvs") {
        this.mode = "sequence";
        this.reset();
      }
    },
    getSwitchText: function () {
      if (this.mode == "hgvs") {
        return "Switch to sequence mode";
      } else if (this.mode == "sequence") {
        return "Switch to HGVS mode";
      }
    },
    getParams: function () {
      if (this.mode == "hgvs") {
        return {};
      } else if (this.mode == "sequence") {
        return {
          only_variants: true,
          sequence: this.sequence,
        };
      }
    },
    setSequenceExample: function () {
      this.inputDescriptionTextBox = "2del";
      this.sequence = "ATTAAC";
    },
    selectDescriptionExample: function (i) {
      this.inputDescriptionTextBox = this.descriptionExamples[i];
      this.$refs.refInputDescriptionTextBox.focus();
    },
    minimalTitle: function () {
      if (this.response.first_minimal) {
        return "First " + this.response.first_minimal + " Minimal Descriptions";
      } else {
        return "Minimal Descriptions";
      }
    },
  },
};
</script>

<style scoped src="../assets/main.css"></style>
