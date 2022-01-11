<template>
  <v-container>
    <v-layout>
      <v-flex xs12>
        <h1 class="display-1 mt-10">Batch Checker</h1>
        <p>
          The Batch Checker can be used to process up to 50 descriptions with
          the Name Checker.
        </p>
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

        <v-alert
          prominent
          type="error"
          tile
          elevation="2"
          class="mt-10 mb-0"
          v-if="!validVariantsNumber"
        >
          <v-row align="center">
            <v-col class="grow overline"
              >A maximum number of 50 variant descriptions are supported.</v-col
            >
          </v-row>
        </v-alert>

        <v-sheet v-if="progress || done" elevation="2" class="pa-10 mt-10">
          <p v-if="progress">Processing {{ variants.length }} variants ...</p>
          <p v-if="done">Done!</p>

          <v-progress-linear :value="progressValue"></v-progress-linear>

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
          <v-btn v-if="done" class="ml-5 mt-5" color="primary" @click="getCsv">
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
            <div style="font-family: monospace">
              <strong>{{ index + 1 }}/{{ variants.length }}</strong>
            </div>

            <span style="font-family: monospace">
              {{ variant.input }}
            </span>

            <v-alert
              ref="successAlert"
              class="mt-5 mb-0"
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

            <v-alert
              prominent
              type="error"
              tile
              elevation="2"
              class="mt-5"
              icon="mdi-network-off-outline"
              color="grey darken-4"
              v-if="variant.error"
            >
              <v-row align="center">
                <v-col class="grow">
                  {{ variant.error.details }}
                </v-col>
              </v-row>
            </v-alert>

            <v-alert
              prominent
              type="error"
              tile
              elevation="2"
              class="mt-5 mb-0"
              v-if="variant.response && variant.response.errors"
            >
              <v-row align="center">
                <v-col class="grow overline"
                  >Description could not be interpreted</v-col
                >
              </v-row>
            </v-alert>

            <v-sheet
              elevation="2"
              v-if="variant.response && variant.response.errors"
            >
              <v-sheet class="pt-10 pr-10 pb-8 pl-10" color="red lighten-5">
                <v-alert
                  color="red lighten-1"
                  tile
                  border="left"
                  dark
                  v-for="(error, index) in variant.response.errors"
                  :key="index"
                >
                  {{ getMessage(error) }}
                </v-alert>
              </v-sheet>
            </v-sheet>
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
    validVariantsNumber: true,
    variants: [],
    progress: false,
    progressValue: 0,
    done: false,
    showDetails: false,
  }),
  methods: {
    loadFile() {
      this.fileData = null;
      this.variants = [];
      this.validVariantsNumber = true;
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
        if (this.variants.length > 50) {
          this.validVariantsNumber = false;
        } else {
          this.progress = true;
          this.batchCheck();
        }
      };
    },
    batchCheck() {
      this.progress = true;
      let i = 0;

      for (let variant of this.variants) {
        MutalyzerService.nameCheckHgvs(variant.input)
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
              if (
                error.response.status == 422 &&
                error.response.data &&
                error.response.data.custom
              ) {
                Vue.set(variant, "response", error.response.data.custom);
              } else {
                variant.error = {
                  details: "Some response error occured.",
                };
              }
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
      let rows = [
        ["Input", "Status", "Normalized", "DNA g.", "RNA", "Protein"],
      ];
      for (let variant of this.variants) {
        let row = [variant.input];
        if ((variant.response && variant.response.errors) || variant.error) {
          row.push("Failed");
          row.push("");
        } else if (
          variant.response.normalized_description &&
          variant.response.normalized_description != variant.input
        ) {
          row.push("Corrected");
          row.push(variant.response.normalized_description);
        } else if (variant.response.normalized_description) {
          row.push("Success");
          row.push(variant.response.normalized_description);
        }
        if (
          variant.response &&
          variant.response.equivalent_descriptions &&
          variant.response.equivalent_descriptions.g
        ) {
          row.push(variant.response.equivalent_descriptions.g[0]);
        } else {
          row.push("N/A");
        }
        if (
          variant.response &&
          variant.response.rna &&
          variant.response.rna.description
        ) {
          row.push(variant.response.rna.description);
        } else {
          row.push("N/A");
        }
        if (
          variant.response &&
          variant.response.protein &&
          variant.response.protein.description
        ) {
          row.push(variant.response.protein.description);
        } else {
          row.push("N/A");
        }
        rows.push(row);
      }
      let outputContent =
        "data:text/csv;charset=utf-8," +
        rows.map((e) => e.join("\t")).join("\n");
      var encodedUri = encodeURI(outputContent);
      var download_link = document.createElement("a");
      download_link.setAttribute("href", encodedUri);
      download_link.setAttribute("download", "batch_output.csv");
      document.body.appendChild(download_link);
      download_link.click();
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
    getMessage: function (message) {
      if (message.details) {
        return message.details + " (" + message.code + ")";
      }
      return message;
    },
  },
};
</script>

<style scoped src="../assets/main.css"></style>
