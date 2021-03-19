<template>
  <div>
    <div v-if="response && response.genes">
      <v-list>
        <div v-if="updated_accession">
          <v-subheader inset class="overline"
            >New Reference Id Available</v-subheader
          >

          <MapDescription
            :description="description"
            :reference_id="updated_accession"
          />
        </div>

        <v-subheader inset class="overline">Reference Standards</v-subheader>

        <div
          v-for="r_s in response.genes[0].gene.reference_standards"
          :key="r_s.gene_range.accession_version"
        >
          <MapDescription
            :description="description"
            :reference_id="r_s.gene_range.accession_version"
            :selector_id="get_selector_id()"
          />
        </div>

        <v-subheader inset class="overline">Transcripts</v-subheader>

        <div
          v-for="t in response.genes[0].gene.transcripts"
          :key="t.accession_version"
        >
          <MapDescription
            :description="description"
            :reference_id="t.accession_version"
          />
        </div>

        <v-subheader inset class="overline"
          >Chromosome Selected Transcripts</v-subheader
        >

        <div
          v-for="t in response.genes[0].gene.transcripts"
          :key="t.accession_version + t"
        >
          <MapDescription
            :description="description"
            :reference_id="t.genomic_range.accession_version"
            :selector_id="t.accession_version"
          />
        </div>
      </v-list>
    </div>

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
import NcbiDatasetsApi from "../services/NcbiDatasetsApi";
import JsonPretty from "./JsonPretty.vue";
import MapDescription from "./MapDescription";

export default {
  name: "Map",
  components: {
    JsonPretty,
    MapDescription,
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
    get_selector_id() {
      if (this.updated_accession) {
        return this.updated_accession;
      }
      if (this.response) {
        return this.response.genes[0].query[0];
      }
    },
  },
};
</script>

<style scoped src="../assets/main.css"></style>
