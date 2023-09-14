<template>
  <v-container>
    <v-layout>
      <v-flex xs12>
        <h1 class="display-1 mt-10">Batch Processor</h1>

        <v-expansion-panels flat hover>
          <v-expansion-panel>
            <v-expansion-panel-header expand-icon="mdi-help" disable-icon-rotate
              >Process up to 50 descriptions with the
              Normalizer.</v-expansion-panel-header
            >
            <v-expansion-panel-content color="grey lighten-5">
              <h4 class="mt-5">Input file format</h4>
              <p>
                The Batch Processor accepts a <b>tab</b> delimited text file as
                input. Each row consists of a variant description and an
                optional second field as a selector (coding transcript) ID. Note
                that empty lines are removed from the batch input file and that
                no header-row is accepted.
              </p>
              <v-btn class="mb-5" depressed @click="getInputFileExample">
                Download Input File Example
                <v-icon right dark> mdi-file-download </v-icon>
              </v-btn>
              <h4>Output file format</h4>
              <p>
                The output of the Batch Processor is a <b>tab</b> delimited CSV
                file, which has a header-row to clarify the results. We
                recommend opening the file in a spreadsheet program, such as
                OpenOffice Calc or Microsoft Excel. Please check the table below
                for details regarding each column output. Note that the
                descriptions present in the
                <span class="font-weight-medium">RNA</span> and
                <span class="font-weight-medium">Protein</span> columns are
                relative to the input description if the input description
                contains a coding transcript, otherwise to the transcript
                mentioned in the second column of the input file or to the only
                MANE transcript present in the reference sequence.
              </p>
              <v-simple-table>
                <template v-slot:default>
                  <thead>
                    <tr>
                      <th
                        v-for="item in getHeaderRow()[0]"
                        :key="item"
                        class="text-left"
                      >
                        <v-tooltip bottom>
                          <template v-slot:activator="{ on, attrs }">
                            <span v-bind="attrs" v-on="on">{{ item }}</span>
                          </template>
                          <span>{{ getHeaderTooltip(item) }}</span>
                        </v-tooltip>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(row, i) in getExampleRows()" :key="i">
                      <td v-for="(item, j) in row" :key="j">
                        <v-tooltip bottom>
                          <template v-slot:activator="{ on, attrs }">
                            <span v-bind="attrs" v-on="on">{{ item }}</span>
                          </template>
                          <span>{{ getRowTooltip(row, i, item, j) }}</span>
                        </v-tooltip>
                      </td>
                    </tr>
                  </tbody>
                </template>
              </v-simple-table>
              <v-btn class="mt-5 mb-5" depressed @click="getOutputFileExample">
                Download Output File Example
                <v-icon right dark> mdi-file-download </v-icon>
              </v-btn>
            </v-expansion-panel-content>
          </v-expansion-panel>
        </v-expansion-panels>

        <v-sheet v-if="!(progress || done)" elevation="2" class="pa-5 mt-10">
          <v-file-input
            truncate-length="15"
            v-model="filePath"
            label="File input"
          ></v-file-input>

          <v-btn
            ref="normalize"
            class="mt-5"
            color="primary"
            @click="loadFile"
            :disabled="!filePath"
          >
            Batch Process
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
          <p v-if="progress">
            Processing {{ variants.length }} variants from file '{{
              filePath.name
            }}' ...
          </p>
          <p v-if="done">Done processing file '{{ filePath.name }}'!</p>

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
            Download Output File
            <v-icon right dark> mdi-file-download </v-icon>
          </v-btn>
          <v-btn
            v-if="done"
            class="ml-5 mt-5"
            color="primary"
            @click="$router.go()"
          >
            New Batch Check
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
    processed_number: 0,
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
        for (let line of this.fileData.split(/\r?\n/)) {
          if (line) {
            var tabs = line.trim().split("\t");
            if (tabs.length == 1) {
              this.variants.push({ input: tabs[0], progress: true });
            } else if (tabs.length == 2) {
              this.variants.push({
                input: tabs[0],
                progress: true,
                input_selector_id: tabs[1],
              });
            }
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
      for (let variant of this.variants) {
        MutalyzerService.normalizeHgvs(variant.input)
          .then((response) => {
            if (response.data) {
              Vue.set(variant, "response", response.data);

              let dna_c = this.getDnaC(variant);
              if (dna_c && dna_c != "N/A") {
                MutalyzerService.normalizeHgvs(dna_c)
                  .then((response) => {
                    Vue.set(variant, "dna_c", response.data);
                    this.updateStatus();
                  })
                  .catch(() => {
                    this.updateStatus();
                  });
              } else {
                this.updateStatus();
              }
            }
          })
          .catch((error) => {
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
            this.updateStatus();
          });
      }
    },
    updateStatus() {
      this.processed_number += 1;
      this.progressValue = (this.processed_number / this.variants.length) * 100;
      if (this.processed_number == this.variants.length) {
        this.progress = false;
        this.done = true;
      }
    },
    getHeaderTooltip(header) {
      if (header == "Input description") {
        return "The description present in the input file.";
      } else if (header == "Input selector ID") {
        return "The selector ID present in the input file.";
      } else if (header == "Status") {
        return "The status of the normalization procedure.";
      } else if (header == "Normalized") {
        return "The normalized description.";
      } else if (header == "DNA g.") {
        return "The equivalent genomic description.";
      } else if (header == "DNA selector c.") {
        return "If an input selector ID was specified then this is the equivalent coding description for that selector.";
      } else if (header == "RNA") {
        return "The predicted RNA description from the normalized description (or the equivalent c. description).";
      } else if (header == "Protein") {
        return "The predicted RNA description from the normalized description (or the equivalent c. description).";
      }
    },
    getRowTooltip(row, i, item, j) {
      let header = this.getHeaderRow()[0];
      if (j == 1) {
        if (item == "N/A") {
          return "There was no selector ID present in the input file.";
        }
      } else if (j == 2) {
        if (item == "Success") {
          return "The input description was correct.";
        } else if (item == "Corrected") {
          return "The input description was corrected.";
        } else if (item == "Failed") {
          return "Mutalyzer was not able to normalize the input description.";
        }
      } else if (j == 3) {
        if (item == "N/A" && row[2] == "Failed") {
          return "No normalized description since normalization failed.";
        }
      } else if (j == 4) {
        if (item == "N/A") {
          if (row[2] == "Failed") {
            return "No equivalent genomic description since normalization failed.";
          } else {
            return "The normalized description (previous column) is also the genomic one.";
          }
        }
      } else if (j == 5) {
        if (item == "N/A") {
          if (row[2] == "Failed") {
            return "No description since normalization failed.";
          } else if (row[1] == "N/A") {
            return "No description since there was no selector ID present in the input file and no equivalent MANE transcript within the equivalent descriptions.";
          }
        } else if (item) {
          if (row[1] == "N/A") {
            return "The equivalent coding description for the only MANE transcript.";
          } else if (row[1]) {
            return "The equivalent coding description for the selector ID present in the input file.";
          }
        }
      } else if (j == 6) {
        if (item == "N/A") {
          if (row[2] == "Failed") {
            return "No description since normalization failed.";
          } else if (row[1] == "N/A" && row[5] == "N/A") {
            return "No RNA prediction since there was no selector ID present in the input file and no equivalent MANE transcript within the equivalent descriptions.";
          }
        } else if (item) {
          if (row[4] != "N/A") {
            return "The predicted RNA description for the input description.";
          } else if (row[1] != "N/A" && row[5] != "N/A") {
            return "The predicted RNA description for the selector ID present in the input file.";
          } else {
            return "The predicted RNA description for the MANE transcript.";
          }
        }
      } else if (j == 7) {
        if (item == "N/A") {
          if (row[2] == "Failed") {
            return "No description since normalization failed.";
          } else if (row[1] == "N/A" && row[5] == "N/A") {
            return "No protein prediction since there was no selector ID present in the input file and no equivalent MANE selector ID within the equivalent descriptions.";
          }
        } else if (item) {
          if (row[4] != "N/A") {
            return "The predicted protein description for the input description.";
          } else if (row[1] != "N/A" && row[5] != "N/A") {
            return "The predicted protein description for the selector ID present in the input file.";
          } else {
            return "The predicted protein description for the MANE transcript.";
          }
        }
      }

      return this.getHeaderTooltip(header[j]);
    },
    getInputRows() {
      return [
        ["NG_012337.3(NM_003002.4):c.274G>T"],
        ["NG_012337.3:g.4830del"],
        ["NG_012337.3:g.4830del", "NM_012459.4"],
        ["NG_012337.3(SDHD_v001):c.274G>T"],
        ["NC_000011.10:g.112088971del"],
        ["NC_000011.10(NM_003002.4):c.274del", "NM_001276504.2"],
        ["NC_000011.10:g.112088971d"],
      ];
    },
    getInputFileExample() {
      let rows = this.getInputRows();
      let outputContent =
        "data:text/csv;charset=utf-8," +
        rows.map((e) => e.join("\t")).join("\n");
      var encodedUri = encodeURI(outputContent);
      var download_link = document.createElement("a");
      download_link.setAttribute("href", encodedUri);
      download_link.setAttribute("download", "example_batch_input.csv");
      document.body.appendChild(download_link);
      download_link.click();
    },
    getOutputFileExample() {
      let rows = [...this.getHeaderRow(), ...this.getExampleRows()];
      let outputContent =
        "data:text/csv;charset=utf-8," +
        rows.map((e) => e.join("\t")).join("\n");
      var encodedUri = encodeURI(outputContent);
      var download_link = document.createElement("a");
      download_link.setAttribute("href", encodedUri);
      download_link.setAttribute("download", "example_batch_output.csv");
      document.body.appendChild(download_link);
      download_link.click();
    },
    getRows() {
      let rows = [];
      for (let variant of this.variants) {
        // Input description
        let row = [variant.input];

        // Input selector ID
        if (variant.input_selector_id) {
          row.push(variant.input_selector_id);
        } else {
          row.push("N/A");
        }

        // Status & Normalized
        if ((variant.response && variant.response.errors) || variant.error) {
          row.push("Failed");
          row.push("N/A");
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

        // DNA g.
        if (
          variant.response &&
          variant.response.equivalent_descriptions &&
          variant.response.equivalent_descriptions.g &&
          variant.response.equivalent_descriptions.g.length == 1 &&
          variant.response.equivalent_descriptions.g[0].description
        ) {
          row.push(variant.response.equivalent_descriptions.g[0].description);
        } else {
          row.push("N/A");
        }

        // DNA selector c.
        row.push(this.getDnaC(variant));

        // RNA
        if (
          variant.response &&
          variant.response.rna &&
          variant.response.rna.description
        ) {
          row.push(variant.response.rna.description);
        } else if (
          variant.dna_c &&
          variant.dna_c.rna &&
          variant.dna_c.rna.description
        ) {
          row.push(variant.dna_c.rna.description);
        } else {
          row.push("N/A");
        }

        // Protein
        if (
          variant.response &&
          variant.response.protein &&
          variant.response.protein.description
        ) {
          row.push(variant.response.protein.description);
        } else if (
          variant.dna_c &&
          variant.dna_c.protein &&
          variant.dna_c.protein.description
        ) {
          row.push(variant.dna_c.protein.description);
        } else {
          row.push("N/A");
        }
        rows.push(row);
      }
      return rows;
    },
    getExampleRows() {
      return [
        [
          "NG_012337.3(NM_003002.4):c.274G>T",
          "N/A",
          "Success",
          "NG_012337.3(NM_003002.4):c.274G>T",
          "NG_012337.3:g.7125G>T",
          "N/A",
          "NG_012337.3(NM_003002.4):r.(274g>u)",
          "NG_012337.3(NP_002993.1):p.(Asp92Tyr)",
        ],
        [
          "NG_012337.3:g.4830del",
          "N/A",
          "Success",
          "NG_012337.3:g.4830del",
          "N/A",
          "N/A",
          "N/A",
          "N/A",
        ],
        [
          "NG_012337.3:g.4830del",
          "NM_012459.4",
          "Success",
          "NG_012337.3:g.4830del",
          "N/A",
          "NG_012337.3(NM_012459.4):c.49del",
          "NG_012337.3(NM_012459.4):r.(49del)",
          "NG_012337.3(NP_036591.3):p.(Ala17Profs*32)",
        ],
        [
          "NG_012337.3(SDHD_v001):c.274G>T",
          "N/A",
          "Corrected",
          "NG_012337.3(NM_003002.4):c.274G>T",
          "NG_012337.3:g.7125G>T",
          "N/A",
          "NG_012337.3(NM_003002.4):r.(274g>u)",
          "NG_012337.3(NP_002993.1):p.(Asp92Tyr)",
        ],
        [
          "NC_000011.10:g.112088971del",
          "N/A",
          "Success",
          "NC_000011.10:g.112088971del",
          "N/A",
          "NC_000011.10(NM_003002.4):c.274del",
          "NC_000011.10(NM_003002.4):r.(274del)",
          "NC_000011.10(NP_002993.1):p.(Asp92Thrfs*43)",
        ],
        [
          "NC_000011.10(NM_003002.4):c.274del",
          "NM_001276504.2",
          "Success",
          "NC_000011.10(NM_003002.4):c.274del",
          "NC_000011.10:g.112088971del",
          "NC_000011.10(NM_001276504.2):c.157del",
          "NC_000011.10(NM_003002.4):r.(274del)",
          "NC_000011.10(NP_002993.1):p.(Asp92Thrfs*43)",
        ],
        [
          "NC_000011.10:g.112088971d",
          "N/A",
          "Failed",
          "N/A",
          "N/A",
          "N/A",
          "N/A",
          "N/A",
        ],
      ];
    },
    getHeaderRow() {
      return [
        [
          "Input description",
          "Input selector ID",
          "Status",
          "Normalized",
          "DNA g.",
          "DNA selector c.",
          "RNA",
          "Protein",
        ],
      ];
    },
    getCsv() {
      let rows = [].concat(this.getHeaderRow(), this.getRows());
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
    getDnaC: function (variant) {
      if (variant.input_selector_id) {
        if (
          variant.response &&
          variant.response.equivalent_descriptions &&
          variant.response.equivalent_descriptions.c
        ) {
          for (let equivalent of variant.response.equivalent_descriptions.c) {
            if (variant.input_selector_id === equivalent.selector.id) {
              return equivalent.description;
            }
          }
        }
      } else if (
        variant.response &&
        variant.response.normalized_description &&
        variant.response.normalized_model.coordinate_system &&
        variant.response.normalized_model.coordinate_system == "g" &&
        variant.response.equivalent_descriptions &&
        variant.response.equivalent_descriptions.c
      ) {
        if (variant.response.equivalent_descriptions.c.length == 1) {
          return variant.response.equivalent_descriptions.c[0].description;
        } else {
          for (let equivalent of variant.response.equivalent_descriptions.c) {
            if (
              equivalent.tag &&
              equivalent.tag.details &&
              equivalent.tag.details == "MANE Select"
            ) {
              return equivalent.description;
            }
          }
        }
      }
      return "N/A";
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
