<template>
  <v-container>
    <v-layout>
      <v-flex xs12>
        <h1 class="display-1 mt-10">Mapper</h1>
        <p>Map a description to another reference.</p>
        <v-sheet elevation="2" class="pa-5 mt-10">
          <v-row>
            <v-subheader>Map</v-subheader>
          </v-row>

          <v-divider></v-divider>

          <v-row class="pl-2 pr-2 mt-1">
            <v-col>
              <v-text-field
                :rules="rules"
                v-model="description"
                :hint="'NG_012337.1:g.7125G>T'"
                label="HGVS Description"
                :clearable="true"
                autofocus
              ></v-text-field>
            </v-col>
          </v-row>

          <v-row class="mt-0">
            <v-subheader>To</v-subheader>
          </v-row>

          <v-divider></v-divider>

          <v-row class="pl-2 pr-2 mt-1">
            <v-col cols="12" sm="4" lg="4">
              <v-text-field
                :rules="rules"
                :hint="'NG_012337.3'"
                v-model="reference_id"
                label="Reference ID"
                :clearable="true"
              ></v-text-field>
            </v-col>

            <v-col cols="12" sm="4" lg="4">
              <v-combobox
                v-model="selector_id"
                :label="'Selector ID'"
                :hint="'E.g. NM_003002.4'"
                :items="availableSelectors.selectors"
                :click="getAvailableSelectors()"
                :clearable="true"
              ></v-combobox>
            </v-col>

            <v-col cols="12" sm="4" lg="4">
              <v-combobox
                v-model="slice_to"
                :label="'Slice to'"
                :items="['gene', 'transcript']"
                :clearable="true"
              ></v-combobox>
            </v-col>
          </v-row>

          <v-row class="pl-2 pr-2 mt-0">
            <v-col cols="12" sm="6" lg="3">
              <v-switch
                v-model="filter"
                label="Filter non original variant operations"
                color="primary"
              ></v-switch
            ></v-col>
          </v-row>

          <v-row class="pl-5 pb-5">
            <v-btn
              class="mt-5"
              color="primary"
              :disabled="!valid"
              :to="{
                name: 'Mapper',
                query: getParams(),
              }"
            >
              Map
            </v-btn>
            <v-spacer></v-spacer>
            <v-btn color="success" class="mt-5 mr-5" @click="setExample()">
              Example
            </v-btn>
          </v-row>
        </v-sheet>

        <v-overlay :absolute="true" :value="loadingOverlay">
          <div class="text-center">
            <v-progress-circular :size="50" indeterminate></v-progress-circular>
          </div>
          <div class="text-center">
            <v-btn @click="loadingOverlay = false" class="mt-5"> Cancel </v-btn>
          </div>
        </v-overlay>

        <v-alert
          ref="successAlert"
          class="mt-10 mb-0"
          elevation="2"
          prominent
          tile
          v-if="isMapped()"
          color="green"
          type="success"
        >
          <v-row align="center">
            <v-col class="grow">
              <Description
                :description="response.mapped_description"
                css_class="ok-description-link-reverse"
                :to_name="'NameChecker'"
                :to_params="{
                  descriptionRouter: response.mapped_description,
                }"
              />
            </v-col>
            <v-col class="shrink" v-if="infoMessages()">
              <v-tooltip bottom>
                <template v-slot:activator="{ on, attrs }">
                  <v-btn
                    v-bind="attrs"
                    v-on="on"
                    icon
                    @click="showCorrections = !showCorrections"
                  >
                    <v-icon>
                      mdi-details {{ showCorrections ? "mdi-rotate-180" : "" }}
                    </v-icon>
                  </v-btn>
                </template>
                <span>{{ showCorrections ? "Hide" : "See" }} Details</span>
              </v-tooltip>
            </v-col>
          </v-row>
        </v-alert>

        <v-alert
          prominent
          type="error"
          tile
          elevation="2"
          class="mt-10"
          icon="mdi-network-off-outline"
          color="grey darken-4"
          v-if="connectionErrors"
        >
          <v-row align="center">
            <v-col class="grow">
              {{ connectionErrors.details }}
            </v-col>
          </v-row>
        </v-alert>

        <v-alert
          prominent
          type="error"
          tile
          elevation="2"
          class="mt-10 mb-0"
          v-if="response && response.errors"
        >
          <v-row align="center">
            <v-col class="grow overline"
              >Description could not be interpreted</v-col
            >
            <v-col class="shrink" v-if="infoMessages()">
              <v-tooltip bottom>
                <template v-slot:activator="{ on, attrs }">
                  <v-btn
                    v-bind="attrs"
                    v-on="on"
                    icon
                    @click="showCorrections = !showCorrections"
                  >
                    <v-icon>
                      mdi-details {{ showCorrections ? "mdi-rotate-180" : "" }}
                    </v-icon>
                  </v-btn>
                </template>
                <span>{{ showCorrections ? "Hide" : "See" }} Details</span>
              </v-tooltip>
            </v-col>
          </v-row>
        </v-alert>

        <v-expand-transition>
          <v-sheet
            elevation="2"
            v-if="(infoMessages() && showCorrections) || errorsEncountered()"
          >
            <v-expand-transition>
              <v-sheet
                ref="refCorrections"
                class="pt-5 pr-10 pb-5 pl-10"
                color="grey lighten-5"
                v-if="infoMessages() && showCorrections"
              >
                <div v-if="correctionsPerformed()" class="overline">
                  Input Description
                </div>
                <div
                  v-if="correctionsPerformed()"
                  :class="getInputDescriptionClass()"
                >
                  {{ inputDescription }}
                </div>
                <div v-if="response.infos">
                  <div class="overline">Corrections / Info Messages</div>
                  <v-alert
                    color="light-blue lighten-5"
                    tile
                    border="left"
                    class="ml-2"
                    v-for="(info, index) in response.infos"
                    :key="index"
                  >
                    {{ getMessage(info) }}
                  </v-alert>
                </div>
                <div v-if="correctionsPerformed() && showCorrections">
                  <div class="overline">Corrected Description</div>
                  <div class="ok-description">
                    {{ response.corrected_description }}
                  </div>
                </div>
              </v-sheet>
            </v-expand-transition>

            <v-sheet
              class="pt-10 pr-10 pb-8 pl-10"
              color="red lighten-5"
              v-if="errorsEncountered()"
            >
              <v-alert
                color="red lighten-1"
                tile
                border="left"
                dark
                v-for="(error, index) in response.errors"
                :key="index"
              >
                <div v-if="syntaxError()">
                  <SyntaxError :errorModel="getSyntaxError()" />
                </div>
                <div v-else>
                  {{ getMessage(error) }}
                </div>
              </v-alert>
            </v-sheet>
          </v-sheet>
        </v-expand-transition>

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
import SyntaxError from "../components/SyntaxError.vue";
import Description from "../components/Description.vue";

export default {
  components: {
    JsonPretty,
    SyntaxError,
    Description,
  },
  data: () => ({
    valid: true,
    rules: [(value) => !!value || "Required."],
    loadingOverlay: false,
    description: null,
    reference_id: null,
    selector_id: null,
    slice_to: null,
    filter: null,
    not_run: null,
    response: null,
    connectionErrors: null,
    showCorrections: false,
    availableSelectors: {},
  }),
  created: function () {
    this.run();
  },
  watch: {
    $route() {
      this.run();
    },
    referenceId() {
      if (this.availableSelectors.reference !== this.referenceId) {
        this.availableSelectors = {};
      }
    },
  },
  methods: {
    run: function () {
      this.setRouterParams();
      if (!this.not_run) {
        this.map();
      }
    },
    setRouterParams: function () {
      if (
        this.$route.query.description &&
        this.$route.query.description !== 0
      ) {
        this.description = this.$route.query.description;
      }
      if (
        this.$route.query.reference_id &&
        this.$route.query.reference_id !== 0
      ) {
        this.reference_id = this.$route.query.reference_id;
      }
      if (
        this.$route.query.selector_id &&
        this.$route.query.selector_id !== 0
      ) {
        this.selector_id = this.$route.query.selector_id;
      }
      if (this.$route.query.slice_to && this.$route.query.slice_to !== 0) {
        this.slice_to = this.$route.query.slice_to;
      }
      if (this.$route.query.not_run && this.$route.query.not_run !== 0) {
        if (this.$route.query.not_run === "true") {
          this.not_run = true;
        } else if (this.$route.query.not_run === "false") {
          this.not_run = false;
        }
      } else {
        this.not_run = false;
      }
      if (this.$route.query.filter && this.$route.query.filter !== 0) {
        if (this.$route.query.filter === "true") {
          this.filter = true;
        } else if (this.$route.query.filter === "false") {
          this.filter = false;
        }
      }
    },
    map: function () {
      if (this.description && this.reference_id) {
        this.loadingOverlay = true;
        this.response = null;
        this.connectionErrors = null;
        this.showCorrections = false;
        MutalyzerService.map(this.getParams())
          .then((response) => {
            if (response.data) {
              this.loadingOverlay = false;
              this.response = response.data;
            }
          })
          .catch((error) => {
            this.loadingOverlay = false;
            if (error.response) {
              if (
                error.response.status == 422 &&
                error.response.data &&
                error.response.data.custom
              ) {
                this.response = error.response.data.custom;
              } else {
                this.connectionErrors = {
                  details: "Some response error occured.",
                };
              }
            } else if (error.request) {
              this.connectionErrors = {
                details: "Some connection or server error occured.",
              };
            } else {
              this.connectionErrors = { details: "Some error occured." };
            }
          });
      }
    },
    isMapped: function () {
      if (this.response && this.response.mapped_description) {
        return true;
      } else {
        return false;
      }
    },
    correctionsPerformed: function () {
      return (
        this.response &&
        this.response.corrected_description &&
        this.response.corrected_description != this.inputDescription
      );
    },
    infoMessages: function () {
      return this.response && this.response.infos;
    },
    syntaxError: function () {
      if (this.getSyntaxError()) {
        return true;
      } else {
        return false;
      }
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
    errorsEncountered: function () {
      if (this.response && this.response.errors) {
        return true;
      } else {
        return false;
      }
    },
    getMessage: function (message) {
      if (message.details) {
        return message.details + " (" + message.code + ")";
      }
      return message;
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
    getParams: function () {
      let params = {
        description: this.description,
        reference_id: this.reference_id,
      };
      if (this.selector_id) {
        params.selector_id = this.selector_id;
      }
      if (this.slice_to) {
        params.slice_to = this.slice_to;
      }
      if (this.filter == true || this.filter == false) {
        params.filter = this.filter;
      }
      return params;
    },
    setExample: function () {
      this.description = "NM_003002.2:c.274G>T";
      this.reference_id = "NG_012337.3";
      this.selector_id = "NM_003002.4";
      this.slice_to = null;
      this.filter = true;
    },
    getAvailableSelectors: function () {
      if (this.reference_id !== null && 0 !== this.reference_id.length) {
        if (
          this.availableSelectors &&
          this.availableSelectors.reference !== this.reference_id
        ) {
          MutalyzerService.getSelectors(this.reference_id)
            .then((response) => {
              if (response.data) {
                this.availableSelectors = response.data;
              }
            })
            .catch((error) => {
              this.availableSelectors = {
                reference: this.reference_id,
                error: error,
              };
            });
        }
      }
    },
  },
};
</script>

<style scoped src="../assets/main.css"></style>
