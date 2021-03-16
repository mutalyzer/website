<template>
  <v-container>
    <v-layout>
      <v-flex xs12>
        <h1 class="display-1 mt-10">Name Checker</h1>
        <p>
          The Name Checker takes the variant description as input and checks
          whether it is correct.
        </p>
        <v-sheet elevation="2" class="pa-10 mt-10">
          <v-text-field
            :rules="rules"
            ref="refInputDescriptionTextBox"
            v-on:keydown.enter="
              $router.push({
                name: 'NameChecker',
                params: { descriptionRouter: inputDescriptionTextBox },
              })
            "
            v-model="inputDescriptionTextBox"
            :label="inputDescriptionTextBoxLabel"
            :clearable="true"
            autofocus
          ></v-text-field>

          <div class="examples-list">
            Examples:
            <span
              class="example-item"
              v-for="(example, index) in descriptionExamples"
              :key="index"
              @click.prevent="selectDescriptionExample(index)"
              >{{ example }}</span
            >
          </div>

          <v-btn
            ref="nameCheck"
            class="mt-5"
            color="primary"
            :to="{
              name: 'NameChecker',
              params: { descriptionRouter: inputDescriptionTextBox },
            }"
          >
            Normalize
          </v-btn>
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
          type="success"
        >
          <v-row align="center">
            <v-col class="grow">
              <span style="font-family: monospace"
                >{{ response.normalized_description }}
              </span>
            </v-col>
            <v-col class="shrink">
              <v-tooltip bottom>
                <template v-slot:activator="{ on, attrs }">
                  <v-btn
                    v-bind="attrs"
                    v-on="on"
                    icon
                    v-clipboard="response.normalized_description"
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
            <v-col class="grow overline"
              >Description could not be interpreted</v-col
            >
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
                <div class="overline">Input Description</div>
                <div :class="getInputDescriptionClass()">
                  {{ inputDescription }}
                </div>
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
          v-if="
            response &&
            response.normalized_description &&
            response.normalized_model &&
            !response.normalized_model.reference.selector &&
            ['c', 'n'].includes(response.normalized_model.coordinate_system)
          "
        >
          <v-expansion-panel>
            <v-expansion-panel-header class="overline"
              >Lift Over</v-expansion-panel-header
            >
            <v-expansion-panel-content class="pt-5">
              <LiftOver
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
                <span v-else> {{ c_s }} </span>
                <div
                  v-for="(equivalentDescription, index) in values"
                  :key="index"
                >
                  <template v-if="c_s === 'c'">
                    <div>
                      <router-link
                        class="ok-description-link"
                        :to="{
                          name: 'NameChecker',
                          params: {
                            descriptionRouter: equivalentDescription[0],
                          },
                        }"
                        >{{ equivalentDescription[0] }}</router-link
                      >
                    </div>
                  </template>
                  <template v-else>
                    <router-link
                      class="ok-description-link"
                      :to="{
                        name: 'NameChecker',
                        params: { descriptionRouter: equivalentDescription },
                      }"
                      >{{ equivalentDescription }}</router-link
                    >
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
          v-if="response && response.protein"
        >
          <v-expansion-panel>
            <v-expansion-panel-header class="overline"
              >Protein Details</v-expansion-panel-header
            >
            <v-expansion-panel-content>
              <AffectedProtein :protein="this.response.protein" />
            </v-expansion-panel-content>
          </v-expansion-panel>
        </v-expansion-panels>

        <v-expansion-panels
          focusable
          hover
          class="mt-5 mb-5"
          tile
          v-if="response && response.corrected_model"
        >
          <v-expansion-panel>
            <v-expansion-panel-header class="overline"
              >Reference Information</v-expansion-panel-header
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
import LiftOver from "../components/LiftOver.vue";

export default {
  components: {
    JsonPretty,
    SelectorShort,
    AffectedProtein,
    SyntaxError,
    ReferenceInformation,
    LiftOver,
  },
  props: ["descriptionRouter"],
  created: function () {
    if (this.descriptionRouter && 0 !== this.descriptionRouter.length) {
      this.inputDescriptionTextBox = this.descriptionRouter;
      this.nameCheck();
    }
  },
  watch: {
    $route() {
      if (this.descriptionRouter && 0 !== this.descriptionRouter.length) {
        this.inputDescriptionTextBox = this.descriptionRouter;
        this.nameCheck();
      }
    },
  },
  data: () => ({
    inputDescriptionTextBox: null,
    rules: [(value) => !!value || "Required."],
    inputDescriptionTextBoxLabel: "HGVS Description",
    descriptionExamples: [
      "NG_012337.1(NM_003002.2):c.274G>T",
      "LRG_24:g.5525_5532del",
    ],
    loadingOverlay: false,
    inputDescription: null, // The description for which the most recent call was sent.
    response: null,
    connectionErrors: null,
    showCorrections: false,
  }),
  methods: {
    selectDescriptionExample: function (i) {
      this.inputDescriptionTextBox = this.descriptionExamples[i];
      this.$refs.refInputDescriptionTextBox.focus();
    },
    nameCheck: function () {
      if (this.inputDescriptionTextBox !== null) {
        this.loadingOverlay = true;
        this.inputDescription = null;
        this.response = null;
        this.connectionErrors = null;
        this.showCorrections = false;
        this.inputDescriptionTextBox = this.inputDescriptionTextBox.trim();

        MutalyzerService.nameCheck(this.inputDescriptionTextBox)
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
    isNormalized: function () {
      if (this.response && this.response.normalized_description) {
        return true;
      } else {
        return false;
      }
    },
    correctionsPerformed: function () {
      return (
        this.response &&
        this.response.corrected_description &&
        this.response.corrected_description != this.inputDescription
      );
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
  },
};
</script>

<style scoped src="../assets/main.css"></style>
