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
          >View NCBI Datasets response as a tree</v-expansion-panel-header
        >
        <v-expansion-panel-content>
          <JsonPretty :summary="response" />
        </v-expansion-panel-content>
      </v-expansion-panel>
    </v-expansion-panels>

    <div v-if="other_references">
      <v-list>
        <div>
          <v-subheader inset class="overline">Other</v-subheader>

          <div
            v-for="t in other_references"
            :key="t.reference_id + t.selector_id"
          >
            <MapDescription
              :description="description"
              :reference_id="t.reference_id"
              :selector_id="t.selector_id"
            />
          </div>
        </div>
      </v-list>
    </div>

    <v-expansion-panels focusable hover flat class="mb-3" v-if="eutils">
      <v-expansion-panel>
        <v-expansion-panel-header
          >View NCBI Eutils response as a tree</v-expansion-panel-header
        >
        <v-expansion-panel-content>
          <JsonPretty :summary="eutils" />
        </v-expansion-panel-content>
      </v-expansion-panel>
    </v-expansion-panels>

    <div v-if="!accession">Work in progress.</div>
  </div>
</template>

<script>
import MutalyzerService from "../services/MutalyzerService";
import NcbiDatasetsApi from "../services/NcbiDatasetsApi";
import NcbiEutils from "../services/NcbiEutils";
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
      gene_id: null,
      eutils: null,
      chromosomes: [],
      other_references: [],
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
            if (this.response.genes[0].gene.transcripts) {
              for (let t of this.response.genes[0].gene.transcripts) {
                this.chromosomes.push({
                  reference_id: t.genomic_range.accession_version,
                  selector_id: t.accession_version,
                });
              }
            }
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
      if (
        response &&
        response.genes &&
        response.genes.length == 1 &&
        response.genes[0].gene &&
        response.genes[0].gene.gene_id
      ) {
        this.gene_id = response.genes[0].gene.gene_id;
        let gene_name = response.genes[0].gene.symbol;
        NcbiEutils.get_gene_summary(this.gene_id).then((response) => {
          if (response.data) {
            this.eutils = response.data;
            let references = this.get_eutils_hist(response.data, this.gene_id);
            for (let reference of references) {
              this.get_eutils_related(reference, gene_name);
            }
          }
        });
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
    get_eutils_hist(r, gene_id) {
      let references = [];
      if (r.result && r.result[gene_id] && r.result[gene_id].locationhist) {
        for (let locationhist of r.result[gene_id].locationhist) {
          if (
            locationhist.chraccver &&
            !references.includes(locationhist.chraccver)
          ) {
            references.push(locationhist.chraccver);
          }
        }
        return references;
      }
    },
    get_eutils_related(reference_id, gene_name) {
      const params = {
        reference_id: reference_id,
        feature_id: gene_name,
        siblings: false,
        ancestors: true,
        descendats: true,
      };
      MutalyzerService.referenceModel(params).then((response) => {
        if (response.data) {
          this.eutils = response.data;
          if (response.data.id) {
            if (
              response.data.features &&
              response.data.features.length == 1 &&
              response.data.features[0].features
            ) {
              for (let selector of response.data.features[0].features) {
                if (["mRNA"].includes(selector.type)) {
                  let other_reference = {
                    reference_id: response.data.id,
                    selector_id: selector.id,
                  };
                  if (!this.in_chromosomes(other_reference))
                    this.other_references.push(other_reference);
                }
              }
            }
          }
        }
      });
    },
    in_chromosomes(reference) {
      for (let c of this.chromosomes) {
        if (
          c.reference_id == reference.reference_id &&
          c.selector_id == reference.selector_id
        ) {
          return true;
        }
      }
      return false;
    },
  },
};
</script>

<style scoped src="../assets/main.css"></style>
