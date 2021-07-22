<template>
  <v-container>
    <v-layout>
      <v-flex xs12>
        <h1 class="display-1 mt-10">Batch Checker</h1>
        <p>The Batch Checker ...</p>
        <v-sheet elevation="2" class="pa-10 mt-10">
          <v-file-input
            truncate-length="15"
            v-model="filePath"
            label="File input"
          ></v-file-input>

          <v-btn
            ref="nameCheck"
            class="mt-5"
            color="primary"
            @click="loadFile"
            :disabled="!filePath"
          >
            Batch Check
          </v-btn>
        </v-sheet>

        <v-progress-linear
          :active="progress"
          :value="progressValue"
        ></v-progress-linear>

        <v-sheet v-if="done" elevation="2" class="pa-10 mt-10">
          <p>Done!</p>
          <v-btn
            v-if="!showDetails"
            class="mt-5"
            color="primary"
            @click="showDetails = true"
          >
            Show Details
          </v-btn>
          <v-btn
            v-if="showDetails"
            class="mt-5"
            color="primary"
            @click="showDetails = false"
          >
            Hide Details
          </v-btn>
          <v-btn class="ml-5 mt-5" color="primary" @click="getCsv">
            Download
          </v-btn>
        </v-sheet>

        <div v-if="variants && showDetails">
          <v-sheet
            elevation="2"
            class="pa-10 mt-10"
            v-for="(variant, index) in variants"
            :key="index"
          >
            <span style="font-family: monospace">
              {{ variant.input }}
            </span>

            <v-alert
              ref="successAlert"
              class="mt-10 mb-0"
              elevation="2"
              prominent
              tile
              v-if="variant.response && variant.response.normalized_description"
              :color="getNormalizedColor(variant)"
              type="success"
            >
              <v-row align="center">
                <v-col class="grow">
                  <v-tooltip bottom>
                    <template v-slot:activator="{ on, attrs }">
                      <span
                        style="font-family: monospace"
                        v-bind="attrs"
                        v-on="on"
                      >
                        {{ variant.response.normalized_description }}
                      </span>
                    </template>
                    <span
                      v-if="
                        variant.response.normalized_description != variant.input
                      "
                      >Different than the input description</span
                    >
                    <span v-else>Same as the input description</span>
                  </v-tooltip>
                </v-col>
                <v-col class="shrink">
                  <v-tooltip bottom>
                    <template v-slot:activator="{ on, attrs }">
                      <v-btn
                        v-bind="attrs"
                        v-on="on"
                        icon
                        v-clipboard="variant.response.normalized_description"
                      >
                        <v-icon>mdi-content-copy</v-icon>
                      </v-btn>
                    </template>
                    <span>Copy</span>
                  </v-tooltip>
                </v-col>
              </v-row>
            </v-alert>
          </v-sheet>
        </div>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
import Vue from "vue";
import MutalyzerService from "../services/MutalyzerService.js";

export default {
  data: () => ({
    filePath: null,
    fileData: null,
    variants: [],
    progress: false,
    progressValue: 0,
    done: false,
    showDetails: false,
  }),
  methods: {
    loadFile() {
      console.log("pressed");
      this.fileData = null;
      this.variants = [];
      this.progress = false;
      this.progressValue = 0;
      this.done = false;
      if (!this.filePath) {
        this.fileData = "No File Chosen";
        return;
      }
      var reader = new FileReader();

      reader.readAsText(this.filePath);
      reader.onload = () => {
        this.fileData = reader.result;
        for (let variant of this.fileData.split(/\r?\n/)) {
          if (variant) {
            this.variants.push({ input: variant, progress: true });
          }
        }
        this.batchCheck();
      };
    },
    batchCheck() {
      this.progress = true;
      let i = 0;

      for (let variant of this.variants) {
        MutalyzerService.nameCheck(variant.input)
          .then((response) => {
            if (response.data) {
              i += 1;
              // variant.response = response.data;
              Vue.set(variant, "response", response.data);
              this.progressValue = (i / this.variants.length) * 100;
              if (i == this.variants.length) {
                this.progress = false;
                this.done = true;
              }
            }
          })
          .catch((error) => {
            i += 1;
            if (error.response) {
              variant.error = {
                details: "Some response error occured.",
              };
            } else if (error.request) {
              variant.error = {
                details: "Some connection or server error occured.",
              };
            } else {
              variant.error = { details: "Some error occured." };
            }
            this.progressValue = (i / this.variants.length) * 100;
            if (i == this.variants.length) {
              this.progress = false;
              this.done = true;
            }
          });
      }
    },
    getCsv() {
      let rows = [];
      for (let variant of this.variants) {
        if (variant.response.errors) {
          rows.push([variant.input, "error"]);
        } else {
          rows.push([variant.input, variant.response.normalized_description]);
        }
      }
      let outputContent =
        "data:text/csv;charset=utf-8," +
        rows.map((e) => e.join("\t")).join("\n");
      var encodedUri = encodeURI(outputContent);
      window.open(encodedUri);
    },
    getNormalizedColor: function (variant) {
      if (variant.response && variant.response.normalized_description) {
        if (variant.response.normalized_description == variant.input) {
          return "green";
        } else {
          return "blue";
        }
      }
    },
  },
};
</script>

<style scoped src="../assets/main.css"></style>
