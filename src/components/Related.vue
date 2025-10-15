<template>
  <div>
    <v-progress-linear v-if="progress" indeterminate></v-progress-linear>
    <div v-if="related">
      <!-- assemblies -->
      <v-sheet>
        <div v-if="related.assemblies" class="overline">Assemblies</div>

        <v-hover
          v-for="(assembly, aindex) in related.assemblies"
          :key="aindex"
          v-slot="{ hover }"
        >
          <div>
            <v-sheet
              :color="hover ? 'grey lighten-3' : 'grey lighten-5'"
              class="pa-2 ma-1"
            >
              <v-row align="center" no-gutters>
                <v-col class="py-0">
                  <div class="v-list-item__title">
                    {{ assembly.accession }}
                  </div>
                  <div class="v-list-item__subtitle">
                    <v-chip small label> {{ assembly.name }} </v-chip>
                    <v-chip class="ml-1" small label>
                      NCBI <v-icon right small> mdi-open-in-new </v-icon>
                    </v-chip>
                  </div>
                </v-col>
                <v-spacer />
                <v-col cols="auto" class="py-0">
                  <v-tooltip bottom>
                    <template #activator="{ on, attrs }">
                      <v-btn
                        color="primary"
                        outlined
                        small
                        :loading="loading"
                        v-bind="attrs"
                        v-on="on"
                        @click="map(assembly.accession)"
                      >
                        Map
                      </v-btn>
                    </template>
                    <span
                      >Map this description to {{ assembly.accession }}.</span
                    >
                  </v-tooltip>
                </v-col>
              </v-row>

              <v-row v-if="mapped_to === assembly.accession">
                <v-col>
                  <v-card tile elevation="0" color="grey lighten-5">
                    <v-card-subtitle class="grey--text ml-2">
                      Mapped description to {{ mapped_to }}
                    </v-card-subtitle>
                    <v-card-text>
                      <v-row>
                        <v-col>
                          <div class="ok-description-link">
                            {{ mapped_description }}
                          </div>
                        </v-col>
                        <v-col class="shrink">
                          <v-tooltip bottom>
                            <template #activator="{ on, attrs }">
                              <v-btn
                                v-clipboard="mapped_description"
                                v-bind="attrs"
                                icon
                                v-on="on"
                              >
                                <v-icon>mdi-content-copy</v-icon>
                              </v-btn>
                            </template>
                            <span>Copy</span>
                          </v-tooltip>
                        </v-col>
                      </v-row>
                    </v-card-text>
                  </v-card>
                </v-col>
              </v-row>
            </v-sheet>
            <v-divider class="my-2"></v-divider>
          </div>
        </v-hover>
      </v-sheet>

      <!-- genes -->
      <v-sheet>
        <div v-if="related.genes" class="overline mt-3">Genes</div>
        <v-hover
          v-for="(gene, gindex) in related.genes"
          :key="'gene-' + gindex"
          v-slot="{ hover }"
        >
          <div>
            <v-sheet
              :color="hover ? 'grey lighten-3' : 'grey lighten-5'"
              class="pa-2 ma-1"
            >
              <v-row align="center" no-gutters>
                <v-col class="py-0">
                  <div class="v-list-item__title">{{ gene.name }}</div>
                  <div>
                    <v-chip small label class="ml-1">{{
                      gene.description
                    }}</v-chip>
                    <v-chip small label class="ml-1">
                      HGNC:{{ gene.hgnc_id }}
                      <v-icon right small>mdi-open-in-new</v-icon>
                    </v-chip>
                  </div>
                </v-col>
              </v-row>

              <!-- providers -->
              <v-hover
                v-for="(gsource, gsindex) in gene.providers"
                :key="'provider-' + gsindex"
                v-slot="{ hover }"
              >
                <v-sheet
                  :color="hover ? 'grey lighten-4' : 'grey lighten-3'"
                  class="pa-2 ma-1"
                >
                  <v-row align="center" no-gutters>
                    <v-col class="py-0">
                      <div class="v-list-item__title">
                        {{ gsource.accession }}
                      </div>
                      <div class="v-list-item__subtitle">
                        <v-chip small label>RefSeqGene</v-chip>
                        <v-chip class="ml-1" small label>
                          {{ gsource.name }}
                          <v-icon right small>mdi-open-in-new</v-icon>
                        </v-chip>
                      </div>
                    </v-col>
                    <v-spacer />
                    <v-col cols="auto" calss="py-0">
                      <v-tooltip bottom>
                        <template #activator="{ on, attrs }">
                          <v-btn
                            color="primary"
                            outlined
                            small
                            :loading="loading"
                            v-bind="attrs"
                            v-on="on"
                            @click="map(gsource.accession)"
                          >
                            Map
                          </v-btn>
                        </template>
                        <span
                          >Map this description to
                          {{ gsource.accession }}.</span
                        >
                      </v-tooltip>
                    </v-col>
                  </v-row>
                </v-sheet>
              </v-hover>
              <v-divider></v-divider>
              <!-- transcripts -->
              <v-hover
                v-for="(transcript, tindex) in gene.transcripts"
                :key="'transcript-' + tindex"
                v-slot="{ hover }"
              >
                <v-sheet
                  :color="hover ? 'grey lighten-4' : 'grey lighten-3'"
                  class="pa-2 ma-1"
                >
                  <v-row
                    v-for="(tsource, tsindex) in transcript.providers"
                    :key="'tsource-' + tindex + '-' + tsindex"
                    align="center"
                    no-gutters
                  >
                    <v-col class="py-0">
                      <div class="v-list-item__title">
                        {{ tsource.transcript_accession }}
                      </div>
                      <div class="v-list-item__subtitle">
                        <v-chip
                          v-if="tsource.description"
                          class="ml-1"
                          label
                          small
                        >
                          {{ tsource.description }}
                        </v-chip>
                        <v-chip class="ml-1" label small>
                          {{ tsource.protein_accession }}
                        </v-chip>
                        <v-chip class="ml-1" label small>
                          {{ tsource.name }}
                          <v-icon right small>mdi-open-in-new</v-icon>
                        </v-chip>
                        <v-chip
                          v-if="transcript.tag"
                          class="ml-1"
                          v-bind="attrs"
                          color="green darken-4"
                          text-color="green darken-4"
                          outlined
                          label
                          small
                        >
                          {{ transcript.tag }}
                        </v-chip>
                      </div>
                    </v-col>
                    <v-col cols="auto" class="py-0">
                      <v-tooltip bottom>
                        <template #activator="{ on, attrs }">
                          <v-btn
                            color="primary"
                            outlined
                            small
                            :loading="loading"
                            v-bind="attrs"
                            v-on="on"
                            @click="map(tsource.transcript_accession)"
                          >
                            Map
                          </v-btn>
                        </template>
                        <span>
                          Map this description to
                          {{ tsource.transcript_accession }}.
                        </span>
                      </v-tooltip>
                    </v-col>
                  </v-row>
                </v-sheet>
              </v-hover>
            </v-sheet>
          </div>
        </v-hover>
      </v-sheet>

      <v-expansion-panels focusable hover flat class="mt-3 mb-3">
        <v-expansion-panel>
          <v-expansion-panel-header>
            View response as a tree
          </v-expansion-panel-header>
          <v-expansion-panel-content>
            <JsonPretty :summary="related" />
          </v-expansion-panel-content>
        </v-expansion-panel>
      </v-expansion-panels>
    </div>
  </div>
</template>

<script>
import MutalyzerService from "../services/MutalyzerService";
import JsonPretty from "./JsonPretty.vue";

export default {
  name: "NewRelated",
  components: {
    JsonPretty,
  },
  props: {
    model: null,
    description: null,
  },
  data: () => ({
    accession: null,
    related: null,
    mockupdata: true,
    mapsuccess: false,
    mapped_to: null,
    progress: true,
  }),
  mounted: function () {
    this.get_accession();
    // this.get_response();
    this.get_related_references_retriever();
  },
  methods: {
    get_related_references_retriever() {
      MutalyzerService.relatedReferences(this.accession).then((response) => {
        if (response.data) {
          console.log(response.data);
          this.progress = false;
          this.related = response.data;
        }
      });
    },
    get_accession() {
      this.accession = this.model.reference.id;
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
