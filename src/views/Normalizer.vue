<template>
  <v-container>
    <v-layout>
      <v-flex xs12>
        <h1 class="display-1 mt-10">Normalizer</h1>
        <p>
          The Normalizer takes a variant description as input and checks whether
          it is correct.
        </p>
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
                  name: 'Normalizer',
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
                name: 'Normalizer',
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
                  response.normalized_description != inputDescription ||
                  response.infos
                    ? 'corrected-description-link-reverse'
                    : 'ok-description-link-reverse'
                "
                :to_name="'Normalizer'"
                :to_params="{
                  descriptionRouter: response.normalized_description,
                }"
                :to_query="getParams()"
                :tag="this.response.tag"
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
                    <span v-if="info.code == 'IMRNAGENOMICDIFFERENCE'"
                      ><router-link
                        class="text-decoration-none"
                        target="_blank"
                        :to="{
                          name: 'Mapper',
                          query: {
                            description: response.normalized_description,
                            reference_id: info.reference_id,
                            selector_id: info.selector_id,
                            slice_to: 'transcript',
                            not_run: false,
                          },
                        }"
                        >Check it using the Mapper tool.</router-link
                      ></span
                    >
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
          v-if="response && response.chromosomal_descriptions"
          :value="genomic_open"
        >
          <v-expansion-panel>
            <v-expansion-panel-header class="overline"
              >Chromosomal Descriptions</v-expansion-panel-header
            >
            <v-expansion-panel-content class="pt-5">
              <div
                class="ml-4"
                v-for="(pair, index) in response.chromosomal_descriptions"
                :key="index"
              >
                <span>{{ pair.assembly }}</span>
                <Description
                  v-if="pair.c"
                  :description="pair.c"
                  :css_class="'ok-description-link'"
                  :to_name="'Normalizer'"
                  :to_params="{
                    descriptionRouter: pair.c,
                  }"
                  :tag="pair.tag"
                />
                <Description
                  v-if="pair.g"
                  :description="pair.g"
                  :css_class="'ok-description-link'"
                  :to_name="'Normalizer'"
                  :to_params="{ descriptionRouter: pair.g }"
                />
                <v-expansion-panels
                  multiple
                  flat
                  tile
                  v-if="pair.errors"
                  v-model="panel"
                >
                  <v-expansion-panel>
                    <v-expansion-panel-header class="overline red--text text"
                      >Unsuccessful mapping
                      <template v-slot:actions>
                        <v-icon color="error"> mdi-alert-circle </v-icon>
                      </template>
                    </v-expansion-panel-header>
                    <v-expansion-panel-content>
                      <v-alert
                        color="red lighten-1"
                        tile
                        border="left"
                        dark
                        class="mt-5"
                        v-for="(error, index) in pair.errors"
                        :key="index"
                      >
                        <div>
                          {{ getMessage(error) }}
                        </div>
                      </v-alert>
                    </v-expansion-panel-content>
                  </v-expansion-panel>
                </v-expansion-panels>
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
          :value="equivalent_open"
        >
          <v-expansion-panel>
            <v-expansion-panel-header class="overline"
              >Equivalent Descriptions</v-expansion-panel-header
            >
            <v-expansion-panel-content>
              <v-sheet
                v-for="(values, c_s) in response.equivalent_descriptions"
                :key="c_s"
              >
                <v-subheader class="overline" v-if="c_s == 'c'"
                  >Coding</v-subheader
                >
                <v-subheader class="overline" v-else-if="c_s == 'n'"
                  >Noncoding</v-subheader
                >
                <v-subheader class="overline" v-else-if="c_s == 'g'"
                  >Genomic</v-subheader
                >
                <v-subheader v-else-if="c_s == 'p'"></v-subheader>
                <v-subheader v-else> {{ c_s }} </v-subheader>
                <v-sheet v-for="(e_d, index) in values" :key="index">
                  <v-hover v-slot="{ hover }">
                    <v-sheet
                      :color="hover ? 'grey lighten-3' : ''"
                      class="pa-2 ma-1"
                    >
                      <template v-if="c_s === 'c'">
                        <Description
                          :description="e_d.description"
                          :css_class="'ok-description-link'"
                          :to_name="'Normalizer'"
                          :to_params="{
                            descriptionRouter: e_d.description,
                          }"
                          :tag="e_d.tag"
                          :selector="e_d.selector"
                        />
                      </template>
                      <template v-else>
                        <Description
                          :description="e_d.description"
                          :css_class="'ok-description-link'"
                          :to_name="'Normalizer'"
                          :to_params="{ descriptionRouter: e_d.description }"
                        />
                      </template>
                    </v-sheet>
                  </v-hover>
                  <v-divider v-if="index != values.length - 1"></v-divider>
                </v-sheet>
              </v-sheet>
            </v-expansion-panel-content>
          </v-expansion-panel>
        </v-expansion-panels>

        <v-expansion-panels
          focusable
          hover
          class="mt-5 mb-5"
          tile
          v-if="response && response.back_translated_descriptions"
          :value="back_translated_open"
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
                    name: 'Normalizer',
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
          :value="rna_open"
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
                  :to_name="'Normalizer'"
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
          :value="protein_open"
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

        <v-expansion-panels
          focusable
          hover
          class="mt-5 mb-5"
          tile
          v-if="showReferenceInformation()"
        >
          <v-expansion-panel>
            <v-expansion-panel-header class="overline"
              >Reference Sequence Information</v-expansion-panel-header
            >
            <v-expansion-panel-content>
              <ReferenceInformation :model="this.response.corrected_model" />
              <SelectorShort
                v-if="response && response.selector_short"
                :selector="response.selector_short"
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
            response.normalized_model &&
            response.normalized_model.reference &&
            !['p'].includes(response.normalized_model.coordinate_system)
          "
        >
          <v-expansion-panel>
            <v-expansion-panel-header class="overline"
              >Related reference sequences</v-expansion-panel-header
            >
            <v-expansion-panel-content class="pt-5">
              <Related
                :model="this.response.normalized_model"
                :description="this.response.normalized_description"
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
          <v-expansion-panel>
            <v-expansion-panel-header class="overline"
              >View Variants Sequence Overview</v-expansion-panel-header
            >
            <v-expansion-panel-content class="pt-2 pb-2">
              <ViewVariants
                :description="this.response.normalized_description"
                :only_variants="this.response.only_variants"
                :sequence="this.response.sequence"
                :d_type="'normalized'"
                :selector="this.response.selector_short"
              />
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
import AffectedProtein from "../components/AffectedProtein.vue";
import SelectorShort from "../components/SelectorShort.vue";
import SyntaxError from "../components/SyntaxError.vue";
import ReferenceInformation from "../components/ReferenceInformation.vue";
import Related from "../components/Related.vue";
import ViewVariants from "../components/ViewVariants.vue";
import Description from "../components/Description.vue";

export default {
  components: {
    JsonPretty,
    SelectorShort,
    AffectedProtein,
    SyntaxError,
    ReferenceInformation,
    Related,
    ViewVariants,
    Description,
  },
  props: ["descriptionRouter"],
  data: () => ({
    valid: true,
    inputDescriptionTextBox: null,
    rules: [(value) => !!value || "Required."],
    inputDescriptionTextBoxLabel: "HGVS Description",
    descriptionExamples: [
      "NG_012337.3(NM_003002.4):c.274G>T",
      "NC_000011.10:g.112088970del",
      "GRCh38(chr11):g.112088970del",
    ],
    loadingOverlay: false,
    inputDescription: null, // The description for which the most recent call was sent.
    response: null,
    connectionErrors: null,
    showCorrections: false,
    sequence: null,
    only_variants: false,
    mode: "hgvs",
    genomic_open: 0,
    equivalent_open: 0,
    rna_open: 1,
    protein_open: 1,
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
          name: "Normalizer",
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

        MutalyzerService.normalizeHgvs(this.inputDescriptionTextBox)
          .then((response) => {
            if (response.data) {
              this.loadingOverlay = false;
              this.response = response.data;
              this.inputDescription = this.inputDescriptionTextBox;
              if (this.isNormalized()) {
                this.$nextTick(() => {
                  this.$vuetify.goTo(this.$refs.successAlert, this.options);
                });
                this.open_panels();
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

        MutalyzerService.normalizeSequence(
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
        if (
          this.response.normalized_description == this.inputDescription &&
          !this.response.infos
        ) {
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
            name: "Normalizer",
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
    open_panels: function () {
      if (
        this.response &&
        this.response.normalized_model &&
        this.response.normalized_model.coordinate_system == "c"
      ) {
        this.rna_open = 0;
        this.protein_open = 0;
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
  },
};
</script>

<style scoped src="../assets/main.css"></style>
