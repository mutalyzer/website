<template>
  <div>
    <v-alert v-if="updated_accession" tile color="white">
      <div class="overline">New Reference Id Available</div>
      <div>
        <v-tooltip bottom>
          <template v-slot:activator="{ on, attrs }">
            <div
              v-show="!show"
              v-bind="attrs"
              v-on="on"
              class="example-item"
              @click="lift()"
            >
              {{ updated_accession }}
            </div>
          </template>
          <span>Lift to the new reference ID!</span>
        </v-tooltip>
        <v-expand-transition>
          <div v-if="show">
            <router-link
              class="ok-description-link"
              :to="{
                name: 'NameChecker',
                params: {
                  descriptionRouter: lifted_description,
                },
              }"
              >{{ lifted_description }}</router-link
            >
          </div>
        </v-expand-transition>
      </div>
    </v-alert>
    <v-expansion-panels focusable hover flat class="mb-3" v-if="response">
      <v-expansion-panel>
        <v-expansion-panel-header
          >View NCBI response as a tree</v-expansion-panel-header
        >
        <v-expansion-panel-content>
          <JsonPretty :summary="response" />
        </v-expansion-panel-content>
      </v-expansion-panel>
    </v-expansion-panels>
    <div v-if="!accession">Work in progress.</div>
  </div>
</template>

<script>
import MutalyzerService from "../services/MutalyzerService.js";
import NcbiDatasetsApi from "../services/NcbiDatasetsApi";
import JsonPretty from "./JsonPretty.vue";

export default {
  name: "LiftOver",
  components: {
    JsonPretty,
  },
  props: {
    model: null,
    description: null,
  },
  data() {
    return {
      response: null,
      accession: null,
      updated_accession: null,
      connectionError: null,
      show: false,
      lifted_description: null,
    };
  },
  mounted: function () {
    this.get_accession();
    this.get_response();
  },
  methods: {
    get_accession() {
      if (
        ["c", "n"].includes(this.model.coordinate_system) &&
        !this.model.reference.selector
      ) {
        this.accession = this.model.reference.id;
      }
    },
    get_response() {
      if (this.accession) {
        NcbiDatasetsApi.gene_accession(this.accession).then((response) => {
          if (response.data) {
            this.response = response.data;
            this.process_response(response.data);
          }
        });
      }
    },
    process_response(response) {
      if (
        response &&
        response.genes &&
        response.genes.length == 1 &&
        response.genes[0].warnings &&
        response.genes[0].warnings.length == 1 &&
        response.genes[0].warnings[0].gene_warning_code ==
          "ACCESSION_VERSION_MISMATCH"
      ) {
        this.updated_accession =
          response.genes[0].warnings[0].replaced_id.returned;
      }
    },
    lift() {
      if (this.description && this.updated_accession) {
        const params = {
          description: this.description,
          reference_id: this.updated_accession,
        };
        MutalyzerService.lift(params)
          .then((response) => {
            if (response.data) {
              this.lifted_description = response.data;
              this.show = !this.show;
            }
          })
          .catch((error) => {
            console.log(error);
            if (error.response) {
              this.connectionErrors = {
                details: "Some response error occured.",
              };
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
  },
};
</script>

<style scoped src="../assets/main.css"></style>
