<template>
  <div>
    <v-progress-linear
      indeterminate
      v-if="progress_related_references_retriever"
    ></v-progress-linear>

    <div v-if="related_references_retriever">
      <div
        v-for="(references, source) in related_references_retriever"
        :key="source"
      >
        <v-subheader inset class="overline">{{ source }}</v-subheader>
        <div
          v-for="reference in references"
          :key="
            reference.selector
              ? reference.id + reference.selector.id
              : reference.id
          "
        >
          <router-link
            v-if="reference.selector"
            :class="'map-link'"
            target="_blank"
            :to="{
              name: 'Mapper',
              query: {
                description: description,
                reference_id: reference.id,
                selector_id: reference.selector.id,
                slice_to: 'transcript',
                not_run: true,
              },
            }"
            >{{ reference.id + "(" + reference.selector.id + ")" }}</router-link
          >
          <router-link
            v-else
            :class="'map-link'"
            target="_blank"
            :to="{
              name: 'Mapper',
              query: {
                description: description,
                reference_id: reference.id,
                not_run: true,
              },
            }"
            >{{ reference.id }}</router-link
          >
        </div>
      </div>
      <v-expansion-panels focusable hover flat class="mt-3 mb-3">
        <v-expansion-panel>
          <v-expansion-panel-header
            >View response as a tree</v-expansion-panel-header
          >
          <v-expansion-panel-content>
            <JsonPretty :summary="related_references_retriever" />
          </v-expansion-panel-content>
        </v-expansion-panel>
      </v-expansion-panels>
    </div>
  </div>
</template>

<script>
import MutalyzerService from "../services/MutalyzerService";
import NcbiDatasetsApi from "../services/NcbiDatasetsApi";
import NcbiEutils from "../services/NcbiEutils";
import JsonPretty from "./JsonPretty.vue";

export default {
  name: "Related",
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
      gene_id: null,
      eutils: null,
      chromosomes: [],
      other_references: [],
      progress_datasets: true,
      progress_other: true,
      response_datasets: false,
      related_references_retriever: null,
      progress_related_references_retriever: true,
    };
  },
  mounted: function () {
    this.get_accession();
    // this.get_response();
    this.get_related_references_retriever();
  },
  methods: {
    get_related_references_retriever() {
      MutalyzerService.relatedReferences(this.accession).then((response) => {
        if (response.data) {
          this.progress_related_references_retriever = false;
          this.related_references_retriever = response.data;
        }
      });
    },
    get_accession() {
      this.accession = this.model.reference.id;
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
          this.progress_other = false;
          if (response.data) {
            this.response_other = true;
            this.eutils = response.data;
            let references = this.get_eutils_hist(response.data, this.gene_id);
            for (let reference of references) {
              this.get_eutils_related(reference, gene_name);
            }
          } else {
            this.response_other = false;
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
        this.progress_datasets = false;
        if (response.data) {
          this.response_datasets = true;
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
                  if (!this.in_chromosomes(other_reference)) {
                    this.other_references.push(other_reference);
                  }
                }
              }
            }
          }
        } else {
          this.response_datasets = false;
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
