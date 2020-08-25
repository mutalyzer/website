<template>
  <v-container>
    <v-layout>
      <v-flex xs12>
        <h1 class="display-1 mt-10">Position Converter</h1>
        <p>
          Convert reference positions to selector orientated positions and vice
          versa.
        </p>
        <v-sheet elevation="2" class="mt-10 pa-10">
          <v-row>
            <v-col cols="12" sm="6" lg="3">
              <v-text-field
                :rules="rules"
                ref="referenceId"
                v-model="referenceId"
                :label="'Reference ID'"
                :hint="'E.g. NC_000001.11'"
                :clearable="true"
                autofocus
              ></v-text-field>
            </v-col>

            <v-col cols="12" sm="6" lg="3">
              <v-text-field
                :rules="rules"
                ref="selectorId"
                v-model="selectorId"
                :label="'Selector ID'"
                :hint="'E.g. NM_001232.3'"
                :clearable="true"
              ></v-text-field>
            </v-col>

            <v-col cols="12" sm="6" lg="3">
              <v-text-field
                :rules="rules"
                ref="position"
                v-model="position"
                :label="'Position'"
                :hint="'E.g. 100'"
                :clearable="true"
              ></v-text-field>
            </v-col>

            <v-col cols="12" sm="6" lg="3">
              <v-select
                :items="['Reference', 'Selector']"
                v-model="relativeTo"
                label="Relative to"
              ></v-select>
            </v-col>
          </v-row>
          <v-row>
            <v-col>
              <v-btn
                ref="convert"
                class="mt-5"
                :to="{
                  name: 'PositionConverter',
                  query: {
                    referenceId: referenceId,
                    selectorId: selectorId,
                    position: position,
                    relativeTo: relativeTo
                  }
                }"
              >
                Convert
              </v-btn>
            </v-col>
            <v-col>
              <v-btn
                class="mt-5"
                @click.prevent="setExample()"
              >
                Example
              </v-btn>
            </v-col>
          </v-row>
        </v-sheet>
        <v-sheet elevation="2" class="pa-10 mt-10" v-if="summary">
          {{summary}}
        </v-sheet>
        <v-alert
          border="right"
          color="red lighten-2"
          dark
          colored-border
          type="error"
          elevation="2"
          tile="true"
          class="mt-10"
          v-if="error"
        >
          {{ error }}
        </v-alert>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
import axios from "axios";

export default {
  data: () => ({
    referenceId: "",
    selectorId: "",
    position: "",
    relativeTo: "",
    rules: [value => !!value || "Required."],
    summary: null,
    error: null
  }),
  created: function() {
    console.log("Created")
    console.log(this.$route)
    if (this.$route.query.referenceId && 0 !== this.$route.query.referenceId.length) {
      this.referenceId = this.$route.query.referenceId;
    }
    if (this.$route.query.selectorId && 0 !== this.$route.query.selectorId.length) {
      this.selectorId = this.$route.query.selectorId;
    }
    if (this.$route.query.position && 0 !== this.$route.query.position.length) {
      this.position = this.$route.query.position;
    }
    if (this.$route.query.relativeTo && 0 !== this.$route.query.relativeTo.length) {
      this.relativeTo = this.$route.query.relativeTo;
    }
    this.positionConvert();
  },
  watch: {
    $route() {
      console.log("Watch")
      console.log(this.$route.params)
      if (this.$route.query.referenceId && 0 !== this.$route.query.referenceId.length) {
        this.referenceId = this.$route.query.referenceId;
      }
      if (this.$route.query.selectorId && 0 !== this.$route.query.selectorId.length) {
        this.selectorId = this.$route.query.selectorId;
      }
      if (this.$route.query.position && 0 !== this.$route.query.position.length) {
        this.position = this.$route.query.position;
      }
      if (this.$route.query.relativeTo && 0 !== this.$route.query.relativeTo.length) {
        this.relativeTo = this.$route.query.relativeTo;
      }
      this.positionConvert();
    }
  },
  methods: {
    setExample: function() {
      this.referenceId = "LRG_1";
      this.selectorId = "t1";
      this.position = "100";
      this.relativeTo = "Reference";
    },
    positionConvert: function() {
      this.error = null
      if ((this.referenceId !== null) && (this.selectorId !== null) && (this.position !== null)) {
        this.summary = null;
        const params = {
          "reference_id": this.referenceId,
          "selector_id": this.selectorId,
          "position": this.position,
          "relative_to": this.relativeTo
        }
        axios
          // .get('http://145.88.35.44/api/name_check/' + this.description, {
          .get("http://127.0.0.1:5000/api/position_convert/", { params }, {
            
          })
          .then(response => {
            if (response.data) {
              this.summary = response.data;
              this.loadingOverlay = false;
            }
          })
          .catch(error => {
            if (error.response) {
              // The request was made and the server responded with a status code
              // that falls out of the range of 2xx
              this.error = "Some response error."
              console.log(error.response.data);
              console.log(error.response.status);
              console.log(error.response.headers);
            } else if (error.request) {
              this.error = "Some request error."
              // The request was made but no response was received
              // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
              // http.ClientRequest in node.js
              console.log(error.request);
            } else {
              this.error = "Some error."
              console.log("error.other")
              // Something happened in setting up the request that triggered an Error
              console.log('Error', error.message);
            }
            console.log(error.config);
          });
      }
    },
  }
};
</script>

<style scoped></style>
