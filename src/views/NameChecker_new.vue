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

        <v-sheet elevation="2" class="pa-10 mt-10" v-if="inputDescription">
          <div>
            <div class="overline">Input Description</div>
            <div :class="getInputDescriptionClass()">
              {{ inputDescription }}
            </div>
          </div>
          <div
            v-if="
              response &&
              response.corrected_description &&
              response.corrected_description != inputDescription
            "
          >
            <div class="overline">Corrected Description</div>
            <div class="normalized-description">
              {{ response.corrected_description }}
            </div>
          </div>
          <div v-if="response && response.normalized_description">
            <div class="overline">Normalized Description</div>
            <div class="normalized-description">
              {{ response.normalized_description }}
            </div>
          </div>
        </v-sheet>

        <v-sheet
          elevation="2"
          class="pa-10 mt-10"
          v-if="response && response.selector_short"
        >
          <SelectorShort :selector="response.selector_short" />
        </v-sheet>

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

export default {
  components: {
    JsonPretty,
    SelectorShort,
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
        console.log(this.response.corrected_description);
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
        } else if (this.response.corrected_description) {
          return "corrected-description";
        } else {
          return "error-description";
        }
      }
    },
  },
};
</script>
