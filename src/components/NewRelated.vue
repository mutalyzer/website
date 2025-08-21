<template>
  <div>
    <div v-if="related && related.related">
      <!-- assemblies -->
      <v-sheet>
        <div class="overline">Assemblies</div>
        <v-hover v-slot="{ hover }">
          <v-sheet
            :color="hover ? 'grey lighten-3' : 'grey lighten-5'"
            class="pa-2 ma-1"
          >
            <v-row align="center" no-gutters>
              <v-col class="py-0">
                <div class="v-list-item__title">NC_000011.10</div>
                <div class="v-list-item__subtitle">
                  <v-chip small label> GRCh38.p14 </v-chip>
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
                      @click="map('NC_000011.10')"
                    >
                      Map
                    </v-btn>
                  </template>
                  <span>Map this description to NC_000011.10.</span>
                </v-tooltip>
              </v-col>
            </v-row>
            <v-row v-if="mapped_description_assembly_1">
              <v-col>
                <v-card tile elevation="0" color="grey lighten-5">
                  <v-card-subtitle class="grey--text ml-2"
                    >Mapped description to NC_000011.10</v-card-subtitle
                  >
                  <v-card-text
                    ><v-row
                      ><v-col>
                        <div :class="'ok-description-link'">
                          {{ mapped_description_assembly_1 }}
                        </div></v-col
                      >
                      <v-col class="shrink">
                        <v-tooltip bottom>
                          <template #activator="{ on, attrs }">
                            <v-btn
                              v-clipboard="mapped_description_assembly_1"
                              v-bind="attrs"
                              icon
                              v-on="on"
                            >
                              <v-icon>mdi-content-copy</v-icon>
                            </v-btn>
                          </template>
                          <span>Copy</span>
                        </v-tooltip>
                      </v-col></v-row
                    >
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row></v-sheet
          ></v-hover
        >

        <v-divider></v-divider>

        <v-hover v-slot="{ hover }">
          <v-sheet
            :color="hover ? 'grey lighten-3' : 'grey lighten-5'"
            class="pa-2 ma-1"
          >
            <v-row align="center" no-gutters>
              <v-col class="py-0">
                <div class="v-list-item__title">NC_060935.1</div>
                <div class="v-list-item__subtitle">
                  <v-chip small label>T2T-CHM13v2.0</v-chip>
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
                      @click="map('NC_060935.1')"
                    >
                      Map
                    </v-btn>
                  </template>
                  <span>Map this description to NC_060935.1.</span>
                </v-tooltip>
              </v-col>
            </v-row>
            <v-row v-if="mapped_description_assembly_2">
              <v-col>
                <v-card tile elevation="0" color="grey lighten-5">
                  <v-card-subtitle class="grey--text ml-2"
                    >Mapped description to NC_060935.1</v-card-subtitle
                  >
                  <v-card-text
                    ><v-row
                      ><v-col>
                        <div :class="'ok-description-link'">
                          {{ mapped_description_assembly_2 }}
                        </div></v-col
                      >
                      <v-col class="shrink">
                        <v-tooltip bottom>
                          <template #activator="{ on, attrs }">
                            <v-btn
                              v-clipboard="mapped_description_assembly_2"
                              v-bind="attrs"
                              icon
                              v-on="on"
                            >
                              <v-icon>mdi-content-copy</v-icon>
                            </v-btn>
                          </template>
                          <span>Copy</span>
                        </v-tooltip>
                      </v-col></v-row
                    >
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>
          </v-sheet>
        </v-hover>
      </v-sheet>
      <!-- genes -->
      <v-sheet>
        <div class="overline mt-3">Genes</div>
        <v-sheet color="'grey lighten-3'" class="pa-2 ma-1">
          <div class="v-list-item__title">CNTN5</div>
          <div>
            <v-chip small label class="ml-1">contactin 5 </v-chip>
            <v-chip small label class="ml-1"
              >HGNC:2175 <v-icon right small> mdi-open-in-new </v-icon>
            </v-chip>
          </div>
          <v-hover v-slot="{ hover }">
            <v-sheet
              :color="hover ? 'grey lighten-3' : 'grey lighten-5'"
              class="pa-2 ma-1"
            >
              <v-row align="center" no-gutters>
                <v-col class="py-0">
                  <div class="v-list-item__title">NG_047156.1</div>
                  <div class="v-list-item__subtitle">
                    <v-chip small label>RefSeqGene</v-chip>
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
                        @click="map('NG_047156.1')"
                      >
                        Map
                      </v-btn>
                    </template>
                    <span>Map this description to NG_047156.1.</span>
                  </v-tooltip>
                </v-col>
              </v-row>
              <v-row v-if="mapped_description_assembly_3">
                <v-col>
                  <v-card tile elevation="0" color="grey lighten-5">
                    <v-card-subtitle class="grey--text ml-2"
                      >Mapped description to NG_047156.1</v-card-subtitle
                    >
                    <v-card-text
                      ><v-row
                        ><v-col>
                          <div :class="'ok-description-link'">
                            {{ mapped_description_assembly_3 }}
                          </div></v-col
                        >
                        <v-col class="shrink">
                          <v-tooltip bottom>
                            <template #activator="{ on, attrs }">
                              <v-btn
                                v-clipboard="mapped_description_assembly_3"
                                v-bind="attrs"
                                icon
                                v-on="on"
                              >
                                <v-icon>mdi-content-copy</v-icon>
                              </v-btn>
                            </template>
                            <span>Copy</span>
                          </v-tooltip>
                        </v-col></v-row
                      >
                    </v-card-text>
                  </v-card>
                </v-col>
              </v-row></v-sheet
            ></v-hover
          >
          <v-divider></v-divider>
          <v-hover v-slot="{ hover }">
            <v-sheet
              :color="hover ? 'grey lighten-3' : 'grey lighten-5'"
              class="pa-2 ma-1"
            >
              <v-row align="center" no-gutters>
                <v-col class="py-0">
                  <div class="v-list-item__title">NM_014361.4</div>
                  <div class="v-list-item__subtitle">
                    <v-chip class="ml-1" label small>
                      Coding transcript
                    </v-chip>
                    <v-chip class="ml-1" label small>
                      NCBI <v-icon right small> mdi-open-in-new </v-icon>
                    </v-chip>
                    <v-chip
                      class="ml-1"
                      v-bind="attrs"
                      color="green darken-4"
                      text-color="green darken-4"
                      outlined
                      label
                      small
                      v-on="on"
                    >
                      Mane Select
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
                        @click="map('NC_060935.1')"
                      >
                        Map
                      </v-btn>
                    </template>
                    <span>Map this description to NM_014361.4.</span>
                  </v-tooltip>
                </v-col>
              </v-row>
              <v-row v-if="mapped_description_assembly_4">
                <v-col>
                  <v-card tile elevation="0" color="grey lighten-5">
                    <v-card-subtitle class="grey--text ml-2"
                      >Mapped description to NM_014361.4</v-card-subtitle
                    >
                    <v-card-text
                      ><v-row
                        ><v-col>
                          <div :class="'ok-description-link'">
                            {{ mapped_description_assembly_4 }}
                          </div></v-col
                        >
                        <v-col class="shrink">
                          <v-tooltip bottom>
                            <template #activator="{ on, attrs }">
                              <v-btn
                                v-clipboard="mapped_description_assembly_4"
                                v-bind="attrs"
                                icon
                                v-on="on"
                                @click="map('NM_014361.4')"
                              >
                                <v-icon>mdi-content-copy</v-icon>
                              </v-btn>
                            </template>
                            <span>Copy</span>
                          </v-tooltip>
                        </v-col></v-row
                      >
                    </v-card-text>
                  </v-card>
                </v-col>
              </v-row>
              <v-row align="center" no-gutters>
                <v-col class="py-0 mt-2">
                  <div class="v-list-item__title">ENST00000524871.6</div>
                  <div class="v-list-item__subtitle">
                    <v-chip class="ml-1" label small>
                      Coding transcript
                    </v-chip>
                    <v-chip class="ml-1" label small>
                      Ensembl <v-icon right small> mdi-open-in-new </v-icon>
                    </v-chip>
                    <v-chip
                      class="ml-1"
                      v-bind="attrs"
                      color="green darken-4"
                      text-color="green darken-4"
                      outlined
                      label
                      small
                      v-on="on"
                    >
                      Mane Select
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
                        @click="map('NC_060935.1')"
                      >
                        Map
                      </v-btn>
                    </template>
                    <span>Map this description to NC_060935.1.</span>
                  </v-tooltip>
                </v-col>
              </v-row>
              <v-row v-if="mapped_description_assembly_5">
                <v-col>
                  <v-card tile elevation="0" color="grey lighten-5">
                    <v-card-subtitle class="grey--text ml-2"
                      >Mapped description to NC_060935.1</v-card-subtitle
                    >
                    <v-card-text
                      ><v-row
                        ><v-col>
                          <div :class="'ok-description-link'">
                            {{ mapped_description_assembly_5 }}
                          </div></v-col
                        >
                        <v-col class="shrink">
                          <v-tooltip bottom>
                            <template #activator="{ on, attrs }">
                              <v-btn
                                v-clipboard="mapped_description_assembly_5"
                                v-bind="attrs"
                                icon
                                v-on="on"
                              >
                                <v-icon>mdi-content-copy</v-icon>
                              </v-btn>
                            </template>
                            <span>Copy</span>
                          </v-tooltip>
                        </v-col></v-row
                      >
                    </v-card-text>
                  </v-card>
                </v-col>
              </v-row>
            </v-sheet>
          </v-hover>
        </v-sheet>
        <v-sheet class="pa-2 ma-1">
          <div class="v-list-item__title">SDHD</div>
          <v-hover v-slot="{ hover }">
            <v-sheet
              :color="hover ? 'grey lighten-3' : 'grey lighten-5'"
              class="pa-2 ma-1"
            >
              <v-row align="center" no-gutters>
                <v-col class="py-0">
                  <div class="v-list-item__title">NG_12337.3</div>
                  <div class="v-list-item__subtitle">
                    <v-chip small label>RefSeqGene</v-chip>
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
                        @click="map('NG_12337.3')"
                      >
                        Map
                      </v-btn>
                    </template>
                    <span>Map this description to NG_12337.3.</span>
                  </v-tooltip>
                </v-col>
              </v-row>
              <v-row v-if="mapped_description_assembly_6">
                <v-col>
                  <v-card tile elevation="0" color="grey lighten-5">
                    <v-card-subtitle class="grey--text ml-2"
                      >Mapped description to NC_000011.10</v-card-subtitle
                    >
                    <v-card-text
                      ><v-row
                        ><v-col>
                          <div :class="'ok-description-link'">
                            {{ mapped_description_assembly_6 }}
                          </div></v-col
                        >
                        <v-col class="shrink">
                          <v-tooltip bottom>
                            <template #activator="{ on, attrs }">
                              <v-btn
                                v-clipboard="mapped_description_assembly_6"
                                v-bind="attrs"
                                icon
                                v-on="on"
                              >
                                <v-icon>mdi-content-copy</v-icon>
                              </v-btn>
                            </template>
                            <span>Copy</span>
                          </v-tooltip>
                        </v-col></v-row
                      >
                    </v-card-text>
                  </v-card>
                </v-col>
              </v-row></v-sheet
            ></v-hover
          >
          <v-divider></v-divider>
          <v-hover v-slot="{ hover }">
            <v-sheet
              :color="hover ? 'grey lighten-3' : 'grey lighten-5'"
              class="pa-2 ma-1"
            >
              <v-row align="center" no-gutters>
                <v-col class="py-0">
                  <div class="v-list-item__title">NM_003002.4</div>
                  <div class="v-list-item__subtitle">
                    <v-chip class="ml-1" label small>
                      Coding transcript
                    </v-chip>
                    <v-chip class="ml-1" label small>
                      NCBI <v-icon right small> mdi-open-in-new </v-icon>
                    </v-chip>
                    <v-chip
                      class="ml-1"
                      v-bind="attrs"
                      color="green darken-4"
                      text-color="green darken-4"
                      outlined
                      label
                      small
                      v-on="on"
                    >
                      Mane Select
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
                        @click="map('NC_060935.1')"
                      >
                        Map
                      </v-btn>
                    </template>
                    <span>Map this description to NM_003002.4</span>
                  </v-tooltip>
                </v-col>
              </v-row>
              <v-row v-if="mapped_description_assembly_7">
                <v-col>
                  <v-card tile elevation="0" color="grey lighten-5">
                    <v-card-subtitle class="grey--text ml-2"
                      >Mapped description to NM_003002.4</v-card-subtitle
                    >
                    <v-card-text
                      ><v-row
                        ><v-col>
                          <div :class="'ok-description-link'">
                            {{ mapped_description_assembly_7 }}
                          </div></v-col
                        >
                        <v-col class="shrink">
                          <v-tooltip bottom>
                            <template #activator="{ on, attrs }">
                              <v-btn
                                v-clipboard="mapped_description_assembly_7"
                                v-bind="attrs"
                                icon
                                v-on="on"
                              >
                                <v-icon>mdi-content-copy</v-icon>
                              </v-btn>
                            </template>
                            <span>Copy</span>
                          </v-tooltip>
                        </v-col></v-row
                      >
                    </v-card-text>
                  </v-card>
                </v-col>
              </v-row>
              <v-row align="center" no-gutters>
                <v-col class="py-0 mt-2">
                  <div class="v-list-item__title">ENST00000524871.6</div>
                  <div class="v-list-item__subtitle">
                    <v-chip class="ml-1" label small>
                      Coding transcript
                    </v-chip>
                    <v-chip class="ml-1" label small>
                      Ensembl <v-icon right small> mdi-open-in-new </v-icon>
                    </v-chip>
                    <v-chip
                      class="ml-1"
                      v-bind="attrs"
                      color="green darken-4"
                      text-color="green darken-4"
                      outlined
                      label
                      small
                      v-on="on"
                    >
                      Mane Select
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
                        @click="map('NC_060935.1')"
                      >
                        Map
                      </v-btn>
                    </template>
                    <span>Map this description to ENST00000524871.6.</span>
                  </v-tooltip>
                </v-col>
              </v-row>
              <v-row v-if="mapped_description_assembly_8">
                <v-col>
                  <v-card tile elevation="0" color="grey lighten-5">
                    <v-card-subtitle class="grey--text ml-2"
                      >Mapped description to NC_060935.1</v-card-subtitle
                    >
                    <v-card-text
                      ><v-row
                        ><v-col>
                          <div :class="'ok-description-link'">
                            {{ mapped_description_assembly_8 }}
                          </div></v-col
                        >
                        <v-col class="shrink">
                          <v-tooltip bottom>
                            <template #activator="{ on, attrs }">
                              <v-btn
                                v-clipboard="mapped_description_assembly_8"
                                v-bind="attrs"
                                icon
                                v-on="on"
                              >
                                <v-icon>mdi-content-copy</v-icon>
                              </v-btn>
                            </template>
                            <span>Copy</span>
                          </v-tooltip>
                        </v-col></v-row
                      >
                    </v-card-text>
                  </v-card>
                </v-col>
              </v-row>
            </v-sheet>
          </v-hover>
        </v-sheet>
      </v-sheet>
      <v-expansion-panels focusable hover flat class="mt-3 mb-3">
        <v-expansion-panel>
          <v-expansion-panel-header
            >View response as a tree</v-expansion-panel-header
          >
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
      if (reference_id == "NC_000011.10") {
        this.mapped_description_assembly_1 = "NC_000011.10:g.726564125G>T";
      } else if (reference_id == "NC_060935.1") {
        this.mapped_description_assembly_2 = "NC_060935.1:g.71515125G>T";
      } else if (reference_id == "NG_047156.1") {
        this.mapped_description_assembly_3 = "NG_047156.1:g.5155G>T";
      } else if (reference_id == "NM_014361.4") {
        this.mapped_description_assembly_4 = "NM_014361.4:c.55G>T";
      }
    },
  },
};
</script>

<style scoped src="../assets/main.css"></style>
