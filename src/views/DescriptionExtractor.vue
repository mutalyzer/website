<template>
  <v-container>
    <v-layout>
      <v-flex xs12>
        <h1 class="display-1  mt-10">Description Extractor</h1>
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
              <v-btn
                ref="extract"
                class="mt-5"
                color="primary"
                :disabled="!valid"
                @click.prevent="descriptionExtract()"
              >
                Extract
              </v-btn>
              <v-spacer></v-spacer>
              <v-btn color="success" class="mt-5" @click.prevent="setExample()">
                Example
              </v-btn>
            </v-row>
          </v-form>
        </v-sheet>
        <v-sheet elevation="2" class="pa-10 mt-10" v-if="summary">
          {{ summary }}
        </v-sheet>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
import axios from "axios";

export default {
  data: () => ({
    valid: true,
    lazy: false,
    reference: "",
    observed: "",
    position: "",
    rules: [value => !!value || "Required."],
    summary: null,
    responseApi: null,
    example: { reference: "AAA", observed: "ATA" }
  }),
  methods: {
    setExample: function() {
      this.reference = this.example.reference;
      this.observed = this.example.observed;
    },
    descriptionExtract: function() {
      if (this.reference !== null && this.observed !== null) {
        this.summary = null;
        this.responseApi = null;
        const params = {
          reference: this.reference,
          observed: this.observed
        };
        axios
          // .get('http://145.88.35.44/api/description_extract/', { params }, {})
          .get("http://127.0.0.1:5000/api/description_extract/", { params }, {})
          .then(response => {
            if (response.data) {
              this.responseHandler(response.data);
              this.loadingOverlay = false;
            }
          })
          .catch(error => {
            if (error.response) {
              // The request was made and the server responded with a status code
              // that falls out of the range of 2xx
              this.errorMessages = "Some response error.";
              // console.log(error.response.data);
              // console.log(error.response.status);
              // console.log(error.response.headers);
            } else if (error.request) {
              this.errorMessages = "Some request error.";
              // The request was made but no response was received
              // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
              // http.ClientRequest in node.js
              // console.log(error.request);
            } else {
              this.errorMessages = "Some error.";
              // console.log(error);
              // Something happened in setting up the request that triggered an Error
              // console.log("Error", error.message);
            }
            // console.log(error.config);
          });
      }
    },
    responseHandler: function(response) {
      this.summary = response;
      if ("errors" in response) {
        console.log("some error");
        this.errorsHandler(response.errors);
      } else {
        console.log("we have some response");
        this.summary = response;
      }
    },
    errorsHandler: function(errors) {
      console.log("Some Error", errors);
    }
  }
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
