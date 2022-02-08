<template>
  <v-container>
    <v-layout>
      <v-flex xs12>
        <h1 class="display-1 mt-10">Description Extractor</h1>
        <p>
          Generates the HGVS variant description from a reference sequence and
          an observed sequence.
        </p>
        <v-sheet elevation="2" class="mt-10 pa-10">
          <v-form ref="form" v-model="valid" :lazy-validation="lazy">
            <v-row>
              <v-col cols="12">
                <v-text-field
                  :rules="rules"
                  ref="reference"
                  v-model="reference"
                  :label="'Reference sequence'"
                  :hint="'E.g. AATTTCCCGGG'"
                  :clearable="true"
                  autofocus
                ></v-text-field>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="12">
                <v-text-field
                  :rules="rules"
                  ref="observed"
                  v-model="observed"
                  :label="'Observed Sequence'"
                  :hint="'E.g. AATCCGG'"
                  :clearable="true"
                ></v-text-field>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="12">
                <span class="example-link" @click="setExample()">Example</span>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="12">
                <v-btn
                  ref="extract"
                  color="primary"
                  :disabled="!valid"
                  :to="{
                    name: 'DescriptionExtractor',
                    query: {
                      reference: reference,
                      observed: observed,
                    },
                  }"
                >
                  Extract
                </v-btn>
              </v-col>
            </v-row>
          </v-form>
        </v-sheet>
        <v-sheet elevation="2" class="pa-10 mt-10" v-if="summary">
          <Description :description="summary" />
        </v-sheet>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
import MutalyzerService from "../services/MutalyzerService.js";
import Description from "../components/Description.vue";

export default {
  components: {
    Description,
  },
  data: () => ({
    valid: true,
    lazy: false,
    reference: "",
    observed: "",
    position: "",
    rules: [(value) => !!value || "Required."],
    summary: null,
    responseApi: null,
    example: { reference: "AAA", observed: "ATA" },
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
      if (
        this.$route.query.reference &&
        0 !== this.$route.query.reference.length
      ) {
        this.reference = this.$route.query.reference;
      }
      if (
        this.$route.query.observed &&
        0 !== this.$route.query.observed.length
      ) {
        this.observed = this.$route.query.observed;
      }
      if (
        this.$route.query.reference &&
        0 !== this.$route.query.reference.length &&
        this.$route.query.observed &&
        0 !== this.$route.query.observed.length
      ) {
        this.descriptionExtract();
      }
    },
    setExample: function () {
      this.reference = this.example.reference;
      this.observed = this.example.observed;
    },
    descriptionExtract: function () {
      if (this.reference !== null && this.observed !== null) {
        this.summary = null;
        this.responseApi = null;
        const params = {
          reference: this.reference,
          observed: this.observed,
        };
        MutalyzerService.descriptionExtract(params)
          .then((response) => {
            if (response.data) {
              this.responseHandler(response.data);
              this.loadingOverlay = false;
            }
          })
          .catch((error) => {
            if (error.response) {
              if (
                error.response.status == 422 &&
                error.response.data &&
                error.response.data.custom
              ) {
                this.errorMessages = "Some response error.";
              }
            } else if (error.request) {
              this.errorMessages = "Some request error.";
            } else {
              this.errorMessages = "Some error.";
            }
          });
      }
    },
    responseHandler: function (response) {
      this.summary = response;
      if ("errors" in response) {
        this.errorsHandler(response.errors);
      } else {
        this.summary = response;
      }
    },
    errorsHandler: function (errors) {
      console.log("Some Error", errors);
    },
  },
};
</script>

<style scoped>
.description {
  display: inline-block;
  /* white-space: nowrap; */
  color: #1565c0;
  font-family: monospace;
}

.description:hover {
  color: #0d47a1;
}

.v-text-field {
  font-family: monospace;
}
</style>
