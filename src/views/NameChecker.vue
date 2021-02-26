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

        <v-sheet
          elevation="2"
          class="pa-10 mt-10"
          v-if="response && response.normalized_description"
        >
          <div v-if="response && response.normalized_description">
            <div class="normalized-description">
              {{ response.normalized_description }}
            </div>
          </div>
        </v-sheet>

        <v-alert
          prominent
          type="error"
          tile
          elevation="2"
          class="mt-10"
          v-if="response && response.errors"
        >
          <v-row align="center">
            <v-col class="grow"> Errors were encountered. </v-col>
          </v-row>
        </v-alert>

        <v-sheet elevation="2" class="pa-10 mt-10" v-if="isSyntaxError()">
          <v-alert
            border="right"
            dark
            colored-border
            type="error"
            elevation="2"
            tile
          >
            Syntax Error
          </v-alert>

          <div class="overline mb-4">Unexpected Character</div>
          <SyntaxError :errorModel="getSyntaxError()" />
        </v-sheet>

        <v-alert
          dense
          type="info"
          class="mt-5 mb-0"
          v-if="wereCorrections()"
          elevation="2"
          tile
        >
          <v-row align="center">
            <v-col class="grow">
              Corrections were performed on the input description.
            </v-col>
            <v-col class="shrink">
              <v-btn
                small
                color="secondary"
                @click="showCorrections = !showCorrections"
                >{{
                  showCorrections ? "Hide Corrections" : "See Corrections"
                }}</v-btn
              >
            </v-col>
          </v-row>
        </v-alert>

        <v-sheet
          elevation="2"
          class="pa-10 mt-0"
          v-if="
            (wereCorrections() && showCorrections) ||
            (response && response.errors)
          "
        >
          <div v-if="wereCorrections() && showCorrections">
            <div class="overline">Input Description</div>
            <div :class="getInputDescriptionClass()">
              {{ inputDescription }}
            </div>
            <div class="overline">Corrections</div>
            <div class="'info-message'">
              <div
                v-for="(info, index) in response.infos"
                :key="index"
                :class="'info-message'"
              >
                {{ getMessage(info) }}
              </div>
            </div>
            <div
              v-if="
                response &&
                response.corrected_description &&
                response.corrected_description != inputDescription &&
                showCorrections
              "
            >
              <div class="overline">Corrected Description</div>
              <div :class="getCorrectedDescriptionClass()">
                {{ response.corrected_description }}
              </div>
            </div>
          </div>
          <div v-if="response && response.errors">
            <div class="overline">Errors</div>
            <div class="'error-message'">
              <div
                v-for="(error, index) in response.errors"
                :key="index"
                :class="'error-message'"
              >
                {{ getMessage(error) }}
              </div>
            </div>
          </div>
        </v-sheet>

        <v-expansion-panels
          focusable
          hover
          class="mt-5 mb-5"
          v-if="response && response.equivalent_descriptions"
        >
          <v-expansion-panel>
            <v-expansion-panel-header
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
          v-if="response && response.selector_short"
        >
          <v-expansion-panel>
            <v-expansion-panel-header
              >Selector Details</v-expansion-panel-header
            >
            <v-expansion-panel-content>
              <SelectorShort :selector="response.selector_short" />
            </v-expansion-panel-content>
          </v-expansion-panel>
        </v-expansion-panels>

        <v-expansion-panels
          focusable
          hover
          class="mt-5 mb-5"
          v-if="response && response.protein"
        >
          <v-expansion-panel>
            <v-expansion-panel-header>Protein Details</v-expansion-panel-header>
            <v-expansion-panel-content>
              <AffectedProtein :protein="this.response.protein" />
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
import SelectorShort from "../components/SelectorShort.vue";
import AffectedProtein from "../components/AffectedProtein.vue";
import SyntaxError from "../components/SyntaxError.vue";

export default {
  components: {
    JsonPretty,
    SelectorShort,
    AffectedProtein,
    SyntaxError,
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

    errors: null,

    showCorrections: false,
  }),
  methods: {
    selectDescriptionExample: function (i) {
      this.inputDescriptionTextBox = this.descriptionExamples[i];
      this.$refs.refInputDescriptionTextBox.focus();
    },
    nameCheck: function () {
      this.errorMessages = null;
      if (this.inputDescriptionTextBox !== null) {
        this.loadingOverlay = true;
        this.inputDescription = null;
        this.showCorrections = false;

        MutalyzerService.nameCheck(this.inputDescriptionTextBox)
          .then((response) => {
            if (response.data) {
              this.loadingOverlay = false;
              this.response = response.data;
              this.inputDescription = this.inputDescriptionTextBox;
            }
          })
          .catch((error) => {
            this.loadingOverlay = false;
            if (error.response) {
              this.errors = [{ details: "Some response error occured." }];
            } else if (error.request) {
              this.errors = [
                { details: "Some error occured on the server side." },
              ];
            } else {
              this.errors = [{ details: "Some error occured." }];
            }
          });
      }
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
    wereCorrections: function () {
      console.log(this.showCorrections);
      return (
        this.response &&
        this.response.corrected_description &&
        this.response.corrected_description != this.inputDescription
      );
    },
    getMessage: function (message) {
      if (message.details) {
        return message.details + " (" + message.code + ")";
      }
      return message;
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
    isSyntaxError: function () {
      if (this.getSyntaxError()) {
        return true;
      } else {
        return false;
      }
    },
  },
};
</script>
