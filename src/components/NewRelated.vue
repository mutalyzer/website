<template>
  <div>
    <div v-if="related && related.related">
      <!-- assemblies -->
      <v-sheet>
        <div v-if="related.related.assemblies" class="overline">Assemblies</div>

        <v-hover
          v-for="(assembly, aindex) in related.related.assemblies"
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
                    <v-chip small label> {{ assembly.assembly_name }} </v-chip>
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
        <div v-if="related.related.genes" class="overline mt-3">Genes</div>
        <v-hover
          v-for="(gene, gindex) in related.related.genes"
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
                    <v-chip small label class="ml-1">{{ gene.comment }}</v-chip>
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
                        {{ tsource.transcript_id }}
                      </div>
                      <div class="v-list-item__subtitle">
                        <v-chip
                          v-if="tsource.transcript_comment"
                          class="ml-1"
                          label
                          small
                        >
                          {{ tsource.transcript_comment }}
                        </v-chip>
                        <v-chip class="ml-1" label small>
                          {{ tsource.protein_id }}
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
                            @click="map(tsource.transcript_id)"
                          >
                            Map
                          </v-btn>
                        </template>
                        <span
                          >Map this description to
                          {{ tsource.transcript_id }}.</span
                        >
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
    description: null,
    normalized_description_model: null,
  },
  data: () => ({
    accession: null,
    related: null,
    mockupdata: true,
    mapsuccess: false,
    mapped_to: null,
    mapped_description: null,
    mapped_description_assembly_1: null,
    mapped_description_assembly_2: null,
    mapped_description_assembly_3: null,
    mapped_description_assembly_4: null,
    mapped_description_assembly_5: null,
    mapped_description_assembly_6: null,
    mapped_description_assembly_7: null,
    mapped_description_assembly_8: null,
  }),
  mounted: function () {
    this.get_accession();
    this.get_location();
    // this.get_response();
    this.get_related();
  },
  methods: {
    get_related() {
      if (this.mockupdata) {
        fetch("/related_output_example.json")
          .then((res) => {
            if (!res.ok) throw new Error("Failed to fetch mock data");
            return res.json();
          })
          .then((data) => {
            this.related = data;
            this.progress_related = false;
          })
          .catch((error) => {
            console.error("Error loading mock related data:", error);
            this.progress_related = false;
          });
      } else {
        const locations = this.get_location(this.normalized_description_model);
        MutalyzerService.newRelatedReferences(this.accession, locations)
          .then((response) => {
            if (response.data) {
              this.progress_related = false;
              this.related = response.data;
            }
          })
          .catch((error) => {
            console.error("Error fetching related references:", error);
            this.progress_related = false;
          });
      }
    },
    get_accession() {
      const model = this.normalized_description_model;
      this.accession =
        model?.reference?.selector?.id || model?.reference?.id || null;
    },
    get_location(normalized_model) {
      if (!normalized_model?.variants?.length) return ["0-0"];

      const locations = normalized_model.variants.map((variant) => {
        const loc = variant.location;
        if (!loc) return "0-0";

        if (loc.type === "point") {
          return `${loc.position}-${loc.position}`;
        }

        if (loc.type === "range" && loc.start && loc.end) {
          return `${loc.start.position}-${loc.end.position}`;
        }

        return "0-0"; // by default
      });

      return locations;
    },
    map(reference_id) {
      const descriptionMap = {
        "NC_000011.10": "NC_000011.10:g.726564125G>T",
        "NC_060935.1": "NC_060935.1:g.71515125G>T",
        "NG_047156.1": "NG_047156.1:g.5155G>T",
        "NM_014361.4": "NM_014361.4:c.55G>T",
      };

      this.mapped_to = reference_id;

      console.log("Mapped description", descriptionMap[reference_id]);
      if (descriptionMap[reference_id]) {
        this.mapped_description = descriptionMap[reference_id];
      } else {
        // fake value
        this.mapped_description = "NX_0000011.x:o.10000del";
      }
    },
  },
};
</script>

<style scoped src="../assets/main.css"></style>
