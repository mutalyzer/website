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
            ref="descriptionInput"
            v-on:keydown.enter="
              $router.push({
                name: 'NameChecker',
                params: { descriptionRouter: description }
              })
            "
            v-model="description"
            :label="label"
            :hint="hint"
            :placeholder="placeholder"
            :clearable="true"
            autofocus
          ></v-text-field>

          <div class="examples-list">
            Examples:
            <code
              v-for="(example, index) in examples"
              :key="index"
              @click.prevent="selectExample(index)"
            >
              <span class="example-item">{{ example }}</span>
            </code>
          </div>

          <v-btn
            ref="nameCheck"
            :disabled="!valid"
            class="mt-5"
            color="primary"
            :to="{
              name: 'NameChecker',
              params: { descriptionRouter: description }
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

        <div v-if="errorMessages">
          <v-alert
            border="right"
            dark
            colored-border
            type="error"
            elevation="2"
            tile
            class="mt-10"
            v-if="syntaxError"
          >
            Syntax Error
          </v-alert>
        </div>

        <v-sheet elevation="2" class="pa-10 mt-10" v-if="syntaxError">
          <div class="overline mb-4">Unexpected Character</div>
          <SyntaxError :errorModel="syntaxError" />
        </v-sheet>

        <v-sheet
          elevation="2"
          class="pa-10 mt-10"
          v-if="summary && normalizedDescription"
        >
          <div v-if="normalizedDescription">
            <div class="overline">Normalized Description</div>
            <router-link
              class="links"
              :to="{
                name: 'NameChecker',
                params: { descriptionRouter: normalizedDescription }
              }"
              >{{ normalizedDescription }}</router-link
            >

            <div v-if="equivalentDescriptions">
              <div class="overline mt-4">Equivalent Descriptions (MAX 20)</div>
              <div
                v-for="(equivalentDescription, index) in equivalentDescriptions"
                :key="index"
              >
                <router-link
                  class="links"
                  :to="{
                    name: 'NameChecker',
                    params: { descriptionRouter: equivalentDescription }
                  }"
                  >{{ equivalentDescription }}</router-link
                >
              </div>
            </div>

            <div v-if="proteinDescriptions">
              <div class="overline mt-4">Protein Descriptions (MAX 20)</div>
              <div
                v-for="(proteinDescription, index) in proteinDescriptions"
                :key="index"
              >
                <span class="protein-description">
                  {{ proteinDescription }}
                </span>
              </div>
            </div>
          </div>
        </v-sheet>

        <!-- <v-sheet elevation="2" class="pa-10 mt-10" v-if="correctedModel">
          <div class="overline mb-4">Information</div>
          <ModelView :model="correctedModel" />
        </v-sheet> -->

        <v-sheet elevation="2" class="pa-10 mt-10" v-if="correctedModel">
          <div class="overline mb-4">information</div>
          <NewModelView 
            :model="correctedModel"
            :description="correctedDescription"
            :errors="errors"
            :infos="infos"
          />
        </v-sheet>

        <v-sheet
          elevation="2"
          class="pa-10 mt-10"
          v-if="internalCoordinatesModel"
        >
          <div class="overline mb-4">Internal Coordinates Model</div>
          <ModelView :model="internalCoordinatesModel" />
        </v-sheet>

        <v-sheet elevation="2" class="pa-10 mt-10" v-if="internalIndexingModel">
          <div class="overline mb-4">Internal Indexing Model</div>
          <ModelView :model="internalIndexingModel" />
        </v-sheet>

        <v-expansion-panels focusable hover class="mt-10 mb-10" v-if="summary">
          <v-expansion-panel>
            <v-expansion-panel-header>Raw Response</v-expansion-panel-header>
            <v-expansion-panel-content>
              <JsonPretty :summary="summary" />
            </v-expansion-panel-content>
          </v-expansion-panel>
        </v-expansion-panels>

        <!-- <v-sheet elevation="2" class="pa-10 mt-10" v-if="summary">
          <div class="overline mb-4">Raw Response</div>
          <JsonPretty :summary="summary" />
        </v-sheet> -->
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
import JsonPretty from "../components/JsonPretty.vue";
import ModelView from "../components/ModelView.vue";
import NewModelView from "../components/NewModelView.vue";
import SyntaxError from "../components/SyntaxError.vue";
import MutalyzerService from "../services/MutalyzerService.js";

export default {
  components: {
    JsonPretty,
    ModelView,
    NewModelView,
    SyntaxError
  },
  props: ["descriptionRouter"],
  created: function() {
    if (this.descriptionRouter && 0 !== this.descriptionRouter.length) {
      this.description = this.descriptionRouter;
      this.nameCheck();
    }
  },
  watch: {
    $route() {
      if (this.descriptionRouter && 0 !== this.descriptionRouter.length) {
        this.description = this.descriptionRouter;
        this.nameCheck();
      }
    }
  },
  data: () => ({
    description: null,
    descriptionModel: null,

    inputModel: null,
    correctedModel: null,
    internalCoordinatesModel: null,
    internalIndexingModel: null,
    delinsModel: null,
    syntaxError: null,

    referenceModel: null,
    correctedDescription: null,
    normalizedDescription: null,
    equivalentDescriptions: null,
    proteinDescriptions: null,
    visualize: null,
    sequence: null,
    summary: null,
    errors: null,
    infos: null,
    loadingOverlay: false,
    errorMessages: [],
    valid: true,
    model: "",
    label: "HGVS Description",
    hint: "",
    placeholder: "",
    rules: [value => !!value || "Required."],
    examples: [
      "LRG_303:g.[11del;6883_6884insTTTCGCCCC;7000del]",
      "LRG_303:g.[11del;6883_6884insTTTCGCCCC]",
      "LRG_303:g.6883_6884insTTTCGCCCC",
      "NG_012337(TIMM8B):c.10_11ins[T;10_20inv;NG_008835(NM_022153.2):159_170]",
      "NG_012337(11818):c.10_11ins[T;10_20inv;NG_008835(NM_022153.2):159_170]",
      "NG_012337.1:g.[5del;10_20del;20_21insT;21del]",
      "NG_012337.1:g.[15del;10_20del;20_21insT;21del]",
      "NG_012337.1:g.[5del;10_20del;20_21insT;21del]",
      "NG_012337.1:g.[5del;10_20del;20_21insT;30_(40_?)del]",
      "NG_012337.1:g.7125G>T",
      // "NG_012337.1:g.10_11ins[T;10_20inv;NG_008835:159_170]",
      "NG_012337.1:g.10_11ins[T;10_20inv;NG_008835(NM_022153.2):159_170]",
      // 'NG_008835.1(NR_120672.1):n.159dup',
      // 'NG_012337.1(NM_003002.2):c.274G>T',
      // 'LRG_23:c.159dup',
      "LRG_24:g.5525_5532del",
      "LRG_1:c.5525_5532del",
      "LRG_24:c.159dup",
      "LRG_24(t3):c.159dup",
      // 'LRG_24(t1):c.159dup',
      // 'LRG_24:g.[5A>T;10_12del]',
      // 'LRG_24:g.[5A>T;13_15del]',
      // 'NC_000024.10:g.100del',
      // 'NG_008835.1:n.100del',
      // 'NM_003002.4:c.1del',
      "NR_120672.1:n.159dup"
    ]
  }),
  methods: {
    selectExample: function(index) {
      this.description = this.examples[index];
      this.$refs.descriptionInput.focus();
    },
    nameCheck: function() {
      this.errorMessages = [];
      if (this.description !== null) {
        this.loadingOverlay = true;
        this.summary = null;

        this.inputModel = null;
        this.correctedModel = null;
        this.internalCoordinatesModel = null;
        this.internalIndexingModel = null;
        this.correctedDescription = null;
        this.normalizedDescription = null;

        this.syntaxError = null;

        this.errors = null;
        this.infos = null;
        this.equivalentDescriptions = null;
        this.proteinDescriptions = null;
        this.visualize = null;
        this.descriptionModel = null;
        this.referenceModel = null;
        MutalyzerService.nameCheck(this.description)
          .then(response => {
            if (response.data) {
              this.loadingOverlay = false;
              this.summary = response.data;
              if (response.data["normalized_description"]) {
                this.normalizedDescription =
                  response.data["normalized_description"];
              }
              if (response.data["corrected_description"]) {
                this.correctedDescription =
                  response.data["corrected_description"];
              }
              if (response.data["errors"]) {
                this.processErrors(response.data["errors"]);
              }
              if (response.data["infos"]) {
                this.infos = response.data["infos"];
              }
              if (response.data["equivalent_descriptions"]) {
                this.equivalentDescriptions =
                  response.data["equivalent_descriptions"];
              }
              if (response.data["protein_descriptions"]) {
                this.proteinDescriptions =
                  response.data["protein_descriptions"];
              }
              if (response.data["visualize"]) {
                this.visualize = response.data["visualize"];
              }
              if (response.data["input_model"]) {
                this.processInputModel(response.data["input_model"]);
              }
              if (response.data["corrected_model"]) {
                this.correctedModel = response.data["corrected_model"];
              }
              if (response.data["internal_coordinates_model"]) {
                this.internalCoordinatesModel =
                  response.data["internal_coordinates_model"];
              }
              if (response.data["internal_indexing_model"]) {
                this.internalIndexingModel =
                  response.data["internal_indexing_model"];
              }
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
    processErrors: function(errors) {
      if (
        (errors.length === 1 && errors[0].code === "ESYNTAXUEOF") ||
        errors[0].code === "ESYNTAXUC"
      ) {
        this.syntaxError = errors[0];
      }
      else {
        this.errors = errors;
      }
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
    },
    processInputModel: function(model) {
      if (model.errors && model.errors.length === 1) {
        if (model.errors[0].code === "ESYNTAXUEOF") {
          this.syntaxError = model.errors[0];
        } else if (model.errors[0].code === "ESYNTAXUC") {
          this.syntaxError = model.errors[0];
        } else {
          this.inputModel = model;
        }
      }
    }
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}

.btn {
  margin-top: 5px;
}

.examples-list {
  margin-top: 5px;
}

.example-item {
  display: inline-block;
  color: #1e90ff;
  background-color: #ffffff;
  padding-left: 10px;
  padding-right: 10px;
  padding-top: 5px;
  padding-bottom: 5px;
}

.example-item:hover {
  color: #f2f9f3;
  background-color: #1e90ff;
  cursor: pointer;
}

.v-application code {
  background-color: #ffffff;
}

.v-text-field {
  font-family: monospace;
}

.normalized-description {
  color: #0b9b33;
  padding-left: 10px;
  padding-right: 10px;
  padding-top: 5px;
  padding-bottom: 5px;
}

.description {
  margin: 0;
  padding: 0 1px;
  font-family: monospace;
  display: inline-block;
}

.links {
  text-decoration: none;
  margin: 0;
  padding: 0 1px;
  font-family: monospace;
  display: inline-block;

  color: #00c853;
  background-color: #ffffff;
  padding-left: 10px;
  padding-right: 10px;
  padding-top: 5px;
  padding-bottom: 5px;
}

.links:hover {
  color: #f2f9f3;
  background-color: #00c853;
  cursor: pointer;
}

.protein-description {
  text-decoration: none;
  margin: 0;
  padding: 0 1px;
  font-family: monospace;
  display: inline-block;

  color: #004d40;
  background-color: #ffffff;
  padding-left: 10px;
  padding-right: 10px;
  padding-top: 5px;
  padding-bottom: 5px;
}
</style>
