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

        <!-- <div v-if="errors">
          <v-alert
            border="right"
            dark
            colored-border
            type="error"
            elevation="2"
            tile
            class="mt-5"
            v-for="(error, i) in errors"
            :key="i"
          >
            {{ getError(error) }}
          </v-alert>
        </div> -->

        <v-sheet elevation="2" class="pa-10 mt-10" v-if="syntaxError">
          <div class="overline mb-4">Unexpected Character</div>
          <SyntaxError :errorModel="syntaxError" />
        </v-sheet>

        <v-sheet
          elevation="2"
          class="pa-10 mt-10"
          v-if="
            (correctedDescription &&
              correctedDescription != inputDescription) ||
              errors
          "
        >
          <div
            class="overline"
            v-if="
              correctedDescription && correctedDescription != inputDescription
            "
          >
            Input description was changed to:
          </div>
          <router-link
            v-if="
              correctedDescription && correctedDescription != inputDescription
            "
            class="links"
            :to="{
              name: 'NameChecker',
              params: { descriptionRouter: normalizedDescription }
            }"
            >{{ correctedDescription }}</router-link
          >

          <div v-if="infos" class="overline">Info messages</div>
          <div v-if="infos" class="'info-message'">
            <div
              v-for="(info, index) in infos"
              :key="index"
              :class="'info-message'"
            >
              {{ getMessage(info) }}
            </div>
          </div>

          <div v-if="errors" class="overline">Errors encountered</div>
          <div v-if="errors" :class="'error-message'">
            <div
              v-for="(info, index) in errors"
              :key="index"
              :class="'error-message'"
            >
              {{ getMessage(info) }}
            </div>
          </div>
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
          </div>
        </v-sheet>

        <v-sheet
          elevation="2"
          class="pa-10 mt-10"
          v-if="summary && normalizedDescription"
        >
          <div v-if="equivalentDescriptions">
            <div class="overline mt-4">Equivalent Descriptions</div>
            <div
              class="ml-4"
              v-for="(values, c_s) in equivalentDescriptions"
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
                      class="links"
                      :to="{
                        name: 'NameChecker',
                        params: { descriptionRouter: equivalentDescription[0] }
                      }"
                      >{{ equivalentDescription[0] }}</router-link
                    >
                  </div>
                  <div class="protein-description">
                    {{ equivalentDescription[1] }}
                  </div>
                </template>
                <template v-else>
                  <router-link
                    class="links"
                    :to="{
                      name: 'NameChecker',
                      params: { descriptionRouter: equivalentDescription }
                    }"
                    >{{ equivalentDescription }}</router-link
                  >
                </template>
              </div>
            </div>
          </div>
        </v-sheet>

        <v-sheet
          elevation="2"
          class="pa-10 mt-10"
          v-if="correctedModel && false"
        >
          <div class="overline mb-4">Information</div>
          <ModelView :model="correctedModel" />
        </v-sheet>

        <v-sheet
          elevation="2"
          class="pa-10 mt-10"
          v-if="correctedModel && false"
        >
          <div class="overline mb-4">Information</div>
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
import "vue-json-pretty/lib/styles.css";

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
    inputDescription: null,
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
      // "LRG_303:g.[11del;6883_6884insTTTCGCCCC;7000del]",
      // "LRG_303:g.[11del;6883_6884insTTTCGCCCC]",
      // "LRG_303:g.6883_6884insTTTCGCCCC",
      // "NG_012337(TIMM8B):c.10_11ins[T;10_20inv;NG_008835(NM_022153.2):159_170]",
      // "NG_012337(11818):c.10_11ins[T;10_20inv;NG_008835(NM_022153.2):159_170]",
      // "NG_012337.1:g.[5del;10_20del;20_21insT;21del]",
      // "NG_012337.1:g.[15del;10_20del;20_21insT;21del]",
      // "NG_012337.1:g.[5del;10_20del;20_21insT;21del]",
      // "NG_012337.1:g.[5del;10_20del;20_21insT;30_(40_?)del]",
      // "NG_012337.1:g.7125G>T",
      // "NG_012337.1:g.10_11ins[T;10_20inv;NG_008835:159_170]",
      // "NG_012337.1:g.10_11ins[T;10_20inv;NG_008835(NM_022153.2):159_170]",
      // "NG_008835.1(NR_120672.1):n.159dup",
      "NG_012337.1(NM_003002.2):c.274G>T",
      // "LRG_23:c.159dup",
      "LRG_24:g.5525_5532del",
      // "LRG_1:c.5525_5532del",
      // "LRG_24:c.159dup",
      // "LRG_24(t3):c.159dup",
      // "LRG_24(t1):c.159dup",
      // "LRG_24:g.[5A>T;10_12del]",
      // "LRG_24:g.[5A>T;13_15del]",
      // "NC_000024.10:g.100del",
      // "NG_008835.1:g.100del",
      // "NM_003002.4:c.1del",
      // "NR_120672.1:n.159dup"
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
        this.inputDescription = null;
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
              if (response.data["input_description"]) {
                this.inputDescription = response.data["input_description"];
              }
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
      } else {
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
    },
    getMessage: function(message) {
      if (message.details) {
        return message.details + " (" + message.code + ")";
      }
      return message;
    },
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

.info-message {
  margin: 10px 0;
  padding: 5px;
  font-family: monospace;
  background-color: #e1f5fe;
}

.info-message-hover {
  margin: 10px 0;
  padding: 5px;
  font-family: monospace;
  background-color: #81d4fa;
}

.error-message {
  margin: 10px 0;
  padding: 5px;
  font-family: monospace;
  background-color: #ffebee;
}

.error-message-hover {
  margin: 10px 0;
  padding: 5px;
  font-family: monospace;
  background-color: #ffcdd2;
}

.description-info {
  margin: 0;
  padding: 0 1px;
  color: #01579b;
  font-family: monospace;
  display: inline-block;
}

.description-info-hover {
  margin: 0;
  padding: 0 1px;
  color: #01579b;
  font-family: monospace;
  background-color: #81d4fa;
  display: inline-block;
}

.description-error {
  margin: 0;
  padding: 0 1px;
  color: #b71c1c;
  font-family: monospace;
  display: inline-block;
}

.description-error-hover {
  margin: 0;
  padding: 0 1px;
  color: #b71c1c;
  font-family: monospace;
  background-color: #ffcdd2;
  display: inline-block;
}
</style>
