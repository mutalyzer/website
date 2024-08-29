<template>
  <v-container>
    <v-layout>
      <v-flex xs12>
        <h1 class="display-1 mt-10">Experimental Normalizer</h1>
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
                  name: 'NormalizerAlt',
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
              ref="normalize"
              class="mt-5"
              color="primary"
              :disabled="!valid"
              :to="{
                name: 'NormalizerAlt',
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
                :to_name="'NormalizerAlt'"
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
          v-if="response && (response.dna || response.rna || response.protein)"
          :value="consequences_open"
        >
          <v-expansion-panel>
            <v-expansion-panel-header class="overline"
              >Biological Information Transfer</v-expansion-panel-header
            >
            <v-expansion-panel-content class="pt-5">
              <div
                v-if="
                  response &&
                  response.equivalent_descriptions &&
                  response.equivalent_descriptions.g
                "
              >
                <div class="overline">Genomic Description</div>
                <Description
                  :description="
                    response.equivalent_descriptions.g[0].description
                  "
                  :css_class="'ok-description-link'"
                  :to_name="'NormalizerAlt'"
                  :to_params="{
                    descriptionRouter:
                      response.equivalent_descriptions.g[0].description,
                  }"
                />
              </div>

              <div v-if="response.rna && response.rna.errors">
                <div class="overline">Predictions</div>
                <v-sheet>
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
              </div>

              <div v-if="response.rna && response.rna.description">
                <div class="overline">Predicted RNA Description</div>
                <Description
                  :description="response.rna.description"
                  :css_class="'ok-description-link'"
                  :to_name="'NormalizerAlt'"
                  :to_params="{ descriptionRouter: response.rna.description }"
                />
              </div>

              <div v-if="response.dna && response.dna.errors">
                <div class="overline">Predicted DNA description</div>
                <v-sheet>
                  <v-alert
                    color="red lighten-1"
                    tile
                    border="left"
                    dark
                    v-for="(error, index) in response.dna.errors"
                    :key="index"
                  >
                    <div>
                      {{ getMessage(error) }}
                    </div>
                  </v-alert>
                </v-sheet>
              </div>

              <div v-if="response.dna && response.dna.description">
                <div class="overline">Predicted DNA Description</div>
                <Description
                  :description="response.dna.description"
                  :css_class="'ok-description-link'"
                  :to_name="'NormalizerAlt'"
                  :to_params="{ descriptionRouter: response.dna.description }"
                />
              </div>

              <div v-if="response.protein && response.protein.description">
                <div class="overline">Predicted Protein Description</div>
                <Description
                  :description="response.protein.description"
                  :css_class="'ok-description-link'"
                  :to_name="'NormalizerAlt'"
                  :to_params="{
                    descriptionRouter: response.protein.description,
                  }"
                />
                <AffectedProtein
                  v-if="response.protein && response.protein.description"
                  :protein="response.protein"
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
                  :d_id="'corrected'"
                  :selector="this.response.selector_short"
                  :c_s_var="get_c_s_var()"
                  :c_s_seq="get_c_s_seq()"
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
                :d_id="'normalized'"
                :selector="this.response.selector_short"
                :c_s_var="get_c_s_var()"
                :c_s_seq="get_c_s_seq()"
              />
            </v-expansion-panel-content>
          </v-expansion-panel>
        </v-expansion-panels>

        <v-expansion-panels
          v-if="
            response &&
            (response.supremal || response.dot || response.minimal_descriptions)
          "
          accordionfocusable
          hover
          class="mt-5 mb-5"
          tile
        >
          <v-expansion-panel>
            <v-expansion-panel-header class="overline"
              >Internals</v-expansion-panel-header
            >
            <v-expansion-panel-content>
              <div class="pl-5">
                <div class="overline">Supremal variant</div>
                <div class="pl-5 pr-5">
                  <div class="overline">HGVS</div>
                  <Description
                    :description="response.supremal.hgvs"
                    :css_class="'ok-description-link'"
                    :to_name="'NormalizerAlt'"
                    :to_params="{ descriptionRouter: response.supremal.hgvs }"
                    :to_query="getParams()"
                  />
                  <div class="overline">SPDI</div>
                  <Description
                    :description="response.supremal.spdi"
                    :css_class="'ok-description'"
                  />
                </div>
              </div>

              <v-expansion-panels
                multiple
                flat
                focusable
                hover
                tile
                class="mt-5"
                v-if="response.view_local_supremal"
              >
                <v-expansion-panel>
                  <v-expansion-panel-header
                    class="overline blue-grey--text text"
                    >View Local Supremal Variants</v-expansion-panel-header
                  >
                  <v-expansion-panel-content>
                    <div class="overline"></div>
                    <ViewVariantsCore
                      :view="response.view_local_supremal"
                      :d_id="'local_supremal'"
                    />
                  </v-expansion-panel-content>
                </v-expansion-panel>
              </v-expansion-panels>

              <v-expansion-panels
                multiple
                flat
                focusable
                hover
                tile
                v-if="response && response.dot"
              >
                <v-expansion-panel id="dot-graph-container">
                  <v-expansion-panel-header
                    class="overline blue-grey--text text"
                    >Minimal Representations Graph</v-expansion-panel-header
                  >

                  <v-expansion-panel-content class="mt-5">
                    <DotGraph :dottext="response.dot" />
                  </v-expansion-panel-content>
                </v-expansion-panel>
              </v-expansion-panels>

              <v-expansion-panels
                multiple
                flat
                focusable
                hover
                tile
                v-if="response && response.minimal_descriptions"
              >
                <v-expansion-panel>
                  <v-expansion-panel-header
                    class="overline blue-grey--text text"
                    >{{ minimalTitle() }}</v-expansion-panel-header
                  >

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
                        :to_name="'NormalizerAlt'"
                        :to_params="{ descriptionRouter: minimal_description }"
                        :to_query="getParams()"
                      />
                    </div>
                  </v-expansion-panel-content>
                </v-expansion-panel>
              </v-expansion-panels>
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
                    name: 'NormalizerAlt',
                    params: { descriptionRouter: equivalentDescription },
                  }"
                  >{{ equivalentDescription }}</router-link
                >
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
    consequences_open: 1,
    back_translated_open: 1,
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
      this.normalize();
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
          name: "NormalizerAlt",
        });
      }
    },
    normalize: function () {
      if (this.mode == "hgvs") {
        this.normalizeHgvs();
      } else if (this.mode == "sequence") {
        this.normalizeSequence();
      }
    },
    normalizeHgvs: function () {
      if (this.inputDescriptionTextBox !== null) {
        this.loadingOverlay = true;
        this.inputDescription = null;
        this.response = null;
        this.connectionErrors = null;
        this.showCorrections = false;
        this.inputDescriptionTextBox = this.inputDescriptionTextBox.trim();

        MutalyzerService.normalizeAltHgvs(this.inputDescriptionTextBox)
          .then((response) => {
            if (response.data) {
              this.loadingOverlay = false;
              this.response = response.data;
              this.inputDescription = this.inputDescriptionTextBox;
              if (this.isNormalized()) {
                this.$nextTick(() => {
                  this.$vuetify.goTo(this.$refs.successAlert, this.options);
                });
                this.openPanels();
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
    normalizeSequence: function () {
      if (this.inputDescriptionTextBox !== null) {
        this.loadingOverlay = true;
        this.inputDescription = null;
        this.response = null;
        this.connectionErrors = null;
        this.showCorrections = false;
        this.inputDescriptionTextBox = this.inputDescriptionTextBox.trim();

        MutalyzerService.normalizeAltSequence(
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
            name: "NormalizerAlt",
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
    outputVariants: function (variants) {
      if (variants.length == 1) {
        return variants[0];
      }
      return variants.join(";");
    },
    openPanels: function () {
      if (
        this.response &&
        this.response.normalized_model &&
        (this.response.normalized_model.coordinate_system == "c" ||
          this.response.normalized_model.coordinate_system == "n" ||
          this.response.normalized_model.coordinate_system == "r")
      ) {
        this.consequences_open = 0;
      }
      if (
        this.response &&
        this.response.normalized_model &&
        this.response.normalized_model.coordinate_system == "p" &&
        this.response.back_translated_descriptions
      ) {
        this.back_translated_open = 0;
      }
    },
    showTranscripts: function () {
      if (this.response && this.response.equivalent_descriptions) {
        for (let c_s in this.response.equivalent_descriptions) {
          if (c_s == "c" || c_s == "n") {
            return true;
          }
        }
      }
      return false;
    },
    getEquivalentDescriptions: function (equivalent) {
      var c_s_mapping = {
        c: "Coding",
        n: "Noncoding",
      };
      var c_s_l = [];
      for (let c_s in c_s_mapping) {
        if (equivalent[c_s]) {
          let descriptions = [];
          for (let d in equivalent[c_s]) {
            descriptions.push(equivalent[c_s][d]);
          }
          c_s_l.push({
            type: c_s_mapping[c_s],
            descriptions: this.sortedEquivalent(descriptions),
          });
        }
      }
      return c_s_l;
    },
    sortedEquivalent: function (descriptions) {
      const sorted = [...descriptions].sort((a, b) => {
        if (a.tag && !b.tag) return -1;
        if (!a.tag && b.tag) return 1;
        if (a.description > b.description) return -1;
        if (a.description < b.description) return 1;
      });
      return sorted;
    },
    get_c_s_var: function () {
      if (
        this.response &&
        this.response.normalized_model &&
        this.response.normalized_model.coordinate_system
      ) {
        return this.response.normalized_model.coordinate_system + ".";
      }
      return null;
    },
    get_c_s_seq: function () {
      if (this.response && this.response.equivalent_descriptions) {
        for (let c_s in this.response.equivalent_descriptions) {
          if (c_s == "g") {
            return "g.";
          }
        }
      }
      return null;
    },
  },
};
</script>

<style scoped src="../assets/main.css"></style>
