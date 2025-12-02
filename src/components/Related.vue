<template>
  <div>
    <v-progress-linear v-if="progress" indeterminate></v-progress-linear>

    <v-alert v-if="related && related.error" type="error" class="ma-2">
      {{ related.error }}
      <v-btn text small @click="retryLoadRelated()">Retry</v-btn>
    </v-alert>

    <div v-if="related && !related.error">
      <!-- Assemblies -->
      <v-sheet>
        <div v-if="related.assemblies" class="overline">Assemblies</div>

        <v-hover
          v-for="(assembly, aindex) in related.assemblies"
          :key="aindex"
          v-slot="{ hover }"
        >
          <div>
            <v-sheet
              :color="hover ? 'grey lighten-4' : 'grey lighten-5'"
              class="pa-2 ma-1"
            >
              <v-row align="center" no-gutters>
                <v-col class="py-0">
                  <div class="v-list-item__title">
                    {{ assembly.accession }}
                  </div>
                  <div class="v-list-item__subtitle">
                    <v-chip small label>{{ assembly.name }}</v-chip>
                    <v-chip class="ml-1" small label>
                      {{ assembly.accession }}
                      <v-tooltip top :open-delay="0" :close-delay="0">
                        <template #activator="{ on, attrs }">
                          <v-btn
                            icon
                            x-small
                            v-bind="attrs"
                            :href="nuccoreUrl(assembly.accession)"
                            target="_blank"
                            rel="noopener"
                            aria-label="Open NCBI nuccore page"
                            v-on="on"
                          >
                            <v-icon small>mdi-open-in-new</v-icon>
                          </v-btn>
                        </template>
                        <span>{{ nuccoreTip(assembly.accession) }}</span>
                      </v-tooltip>
                    </v-chip>
                  </div>
                </v-col>
                <v-spacer />
                <v-col
                  v-if="!mapped_descriptions[assembly.accession]"
                  cols="auto"
                  class="py-0"
                >
                  <v-tooltip bottom>
                    <template #activator="{ on, attrs }">
                      <v-btn
                        color="primary"
                        outlined
                        small
                        :loading="loading_accessions[assembly.accession]"
                        :disabled="!canMapToAssembly()"
                        v-bind="attrs"
                        v-on="on"
                        @click="map(assembly.accession, true)"
                      >
                        Map
                      </v-btn>
                    </template>
                    <span v-if="canMapToAssembly()">
                      Map this description to {{ assembly.accession }}.
                    </span>
                    <span v-else>
                      Cannot map: No valid selector available.
                    </span>
                  </v-tooltip>
                </v-col>
              </v-row>

              <v-row
                v-if="
                  mapped_descriptions[assembly.accession] ||
                  mapping_errors[assembly.accession]
                "
              >
                <v-col>
                  <v-card
                    v-if="mapped_descriptions[assembly.accession]"
                    tile
                    elevation="0"
                    color="white"
                  >
                    <v-card-subtitle class="grey--text ml-2">
                      Mapped description to {{ assembly.accession }}
                    </v-card-subtitle>
                    <v-card-text>
                      <v-row>
                        <v-col>
                          <div class="ok-description-link">
                            {{ mapped_descriptions[assembly.accession] }}
                          </div>
                        </v-col>
                        <v-col class="shrink">
                          <v-tooltip bottom>
                            <template #activator="{ on, attrs }">
                              <v-btn
                                v-clipboard="
                                  mapped_descriptions[assembly.accession]
                                "
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

                  <div v-if="mapping_errors[assembly.accession]">
                    <div class="grey--text ml-2 mt-2">
                      Mapping description to {{ assembly.accession }} was
                      unsuccessful.
                    </div>
                    <v-alert
                      v-for="(error, index) in mapping_errors[
                        assembly.accession
                      ].errors"
                      :key="index"
                      color="red lighten-1"
                      tile
                      border="left"
                      dark
                      dense
                      class="mt-2"
                    >
                      <div>{{ getMessage(error) }}</div>
                    </v-alert>
                  </div>
                </v-col>
              </v-row>
            </v-sheet>
            <v-divider class="my-2"></v-divider>
          </div>
        </v-hover>
      </v-sheet>

      <!-- Genes -->
      <v-sheet>
        <div v-if="related.genes" class="overline mt-3">Genes</div>
        <v-hover
          v-for="(gene, gindex) in related.genes"
          :key="'gene-' + gindex"
        >
          <div>
            <v-sheet color="grey lighten-5" class="pa-2 ma-1">
              <v-row align="center" no-gutters>
                <v-col class="py-0">
                  <div class="v-list-item__title">{{ gene.name }}</div>
                  <div>
                    <v-chip small label class="ml-1">
                      {{ gene.description }}
                    </v-chip>
                    <v-chip small label class="ml-1">
                      HGNC:{{ gene.hgnc_id }}
                      <v-tooltip top :open-delay="0" :close-delay="0">
                        <template #activator="{ on, attrs }">
                          <v-btn
                            icon
                            x-small
                            v-bind="attrs"
                            :href="hgncUrl(gene.hgnc_id)"
                            target="_blank"
                            rel="noopener"
                            aria-label="Open HGNC page"
                            v-on="on"
                          >
                            <v-icon small>mdi-open-in-new</v-icon>
                          </v-btn>
                        </template>
                        <span>{{ hgncTip(gene.hgnc_id) }}</span>
                      </v-tooltip>
                    </v-chip>
                    <v-chip v-if="getNcbiGeneId(gene)" small label class="ml-1">
                      NCBI Gene: {{ getNcbiGeneId(gene) }}
                      <v-tooltip top :open-delay="0" :close-delay="0">
                        <template #activator="{ on, attrs }">
                          <v-btn
                            icon
                            x-small
                            v-bind="attrs"
                            :href="ncbiGeneUrl(getNcbiGeneId(gene))"
                            target="_blank"
                            rel="noopener"
                            aria-label="Open NCBI Gene page"
                            v-on="on"
                          >
                            <v-icon small>mdi-open-in-new</v-icon>
                          </v-btn>
                        </template>
                        <span>{{ ncbiGeneTip(getNcbiGeneId(gene)) }}</span>
                      </v-tooltip>
                    </v-chip>
                  </div>
                </v-col>
              </v-row>

              <!-- Providers -->
              <v-hover
                v-for="(gsource, gsindex) in gene.providers"
                :key="'provider-' + gsindex"
                v-slot="{ hover: providerHover }"
              >
                <v-sheet
                  :color="providerHover ? 'grey lighten-4' : 'grey lighten-3'"
                  class="pa-2 ma-1"
                >
                  <v-row align="center" no-gutters>
                    <v-col class="py-0">
                      <div class="v-list-item__title">
                        {{ gsource.accession }}
                      </div>
                      <div class="v-list-item__subtitle">
                        <v-chip small label>RefSeqGene</v-chip>
                        <v-chip small label class="ml-1">
                          {{ gsource.accession }}
                          <v-tooltip top :open-delay="0" :close-delay="0">
                            <template #activator="{ on, attrs }">
                              <v-btn
                                icon
                                x-small
                                v-bind="attrs"
                                :href="
                                  linkForIdentifier(
                                    gsource.accession,
                                    gsource.name,
                                  ).href
                                "
                                target="_blank"
                                rel="noopener"
                                :aria-label="
                                  linkForIdentifier(
                                    gsource.accession,
                                    gsource.name,
                                  ).aria
                                "
                                v-on="on"
                              >
                                <v-icon small>mdi-open-in-new</v-icon>
                              </v-btn>
                            </template>
                            <span>
                              {{
                                linkForIdentifier(
                                  gsource.accession,
                                  gsource.name,
                                ).tip
                              }}
                            </span>
                          </v-tooltip>
                        </v-chip>
                      </div>
                    </v-col>
                    <v-spacer />
                    <v-col
                      v-if="!mapped_descriptions[gsource.accession]"
                      cols="auto"
                      class="py-0"
                    >
                      <v-tooltip bottom>
                        <template #activator="{ on, attrs }">
                          <v-btn
                            color="primary"
                            outlined
                            small
                            :loading="loading_accessions[gsource.accession]"
                            v-bind="attrs"
                            v-on="on"
                            @click="map(gsource.accession, false)"
                          >
                            Map
                          </v-btn>
                        </template>
                        <span>
                          Map this description to {{ gsource.accession }}.
                        </span>
                      </v-tooltip>
                    </v-col>
                  </v-row>

                  <v-row
                    v-if="
                      mapped_descriptions[gsource.accession] ||
                      mapping_errors[gsource.accession]
                    "
                  >
                    <v-col>
                      <v-card
                        v-if="mapped_descriptions[gsource.accession]"
                        tile
                        elevation="0"
                        color="grey lighten-4"
                      >
                        <v-card-subtitle class="grey--text ml-2">
                          Mapped description to {{ gsource.accession }}
                        </v-card-subtitle>
                        <v-card-text>
                          <v-row>
                            <v-col>
                              <div class="ok-description-link">
                                {{ mapped_descriptions[gsource.accession] }}
                              </div>
                            </v-col>
                            <v-col class="shrink">
                              <v-tooltip bottom>
                                <template #activator="{ on, attrs }">
                                  <v-btn
                                    v-clipboard="
                                      mapped_descriptions[gsource.accession]
                                    "
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

                      <div v-if="mapping_errors[gsource.accession]">
                        <div class="grey--text ml-2 mt-2">
                          Mapping description to {{ gsource.accession }} was
                          unsuccessful.
                        </div>
                        <v-alert
                          v-for="(error, index) in mapping_errors[
                            gsource.accession
                          ].errors"
                          :key="index"
                          color="red lighten-1"
                          tile
                          border="left"
                          dark
                          dense
                          class="mt-2"
                        >
                          <div>{{ getMessage(error) }}</div>
                        </v-alert>
                      </div>
                    </v-col>
                  </v-row>
                </v-sheet>
              </v-hover>
              <v-divider></v-divider>

              <!-- Transcripts -->
              <v-hover
                v-for="(transcript, tindex) in gene.transcripts"
                :key="'transcript-' + tindex"
                v-slot="{ hover: transcriptHover }"
              >
                <v-sheet
                  :color="transcriptHover ? 'grey lighten-4' : 'grey lighten-3'"
                  class="pa-2 ma-1"
                >
                  <div
                    v-for="(tsource, tsindex) in transcript.providers"
                    :key="'tsource-' + tindex + '-' + tsindex"
                  >
                    <v-row align="center" no-gutters>
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
                            {{ tsource.name }}
                            <v-tooltip top :open-delay="0" :close-delay="0">
                              <template #activator="{ on, attrs }">
                                <v-btn
                                  icon
                                  x-small
                                  v-bind="attrs"
                                  :href="
                                    linkForIdentifier(
                                      tsource.transcript_accession,
                                      tsource.name,
                                    ).href
                                  "
                                  target="_blank"
                                  rel="noopener"
                                  :aria-label="
                                    linkForIdentifier(
                                      tsource.transcript_accession,
                                      tsource.name,
                                    ).aria
                                  "
                                  v-on="on"
                                >
                                  <v-icon small>mdi-open-in-new</v-icon>
                                </v-btn>
                              </template>
                              <span>
                                {{
                                  linkForIdentifier(
                                    tsource.transcript_accession,
                                    tsource.name,
                                  ).tip
                                }}
                              </span>
                            </v-tooltip>
                          </v-chip>
                          <v-chip class="ml-1" label small>
                            {{ tsource.protein_accession }}
                            <v-tooltip top :open-delay="0" :close-delay="0">
                              <template #activator="{ on, attrs }">
                                <v-btn
                                  icon
                                  x-small
                                  v-bind="attrs"
                                  :href="
                                    linkForIdentifier(
                                      tsource.protein_accession,
                                      tsource.name,
                                    ).href
                                  "
                                  target="_blank"
                                  rel="noopener"
                                  :aria-label="
                                    linkForIdentifier(
                                      tsource.protein_accession,
                                      tsource.name,
                                    ).aria
                                  "
                                  v-on="on"
                                >
                                  <v-icon small>mdi-open-in-new</v-icon>
                                </v-btn>
                              </template>
                              <span>
                                {{
                                  linkForIdentifier(
                                    tsource.protein_accession,
                                    tsource.name,
                                  ).tip
                                }}
                              </span>
                            </v-tooltip>
                          </v-chip>
                          <v-chip
                            v-if="transcript.tag"
                            class="ml-1"
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
                      <v-col
                        v-if="
                          !mapped_descriptions[tsource.transcript_accession]
                        "
                        cols="auto"
                        class="py-0"
                      >
                        <v-tooltip bottom>
                          <template #activator="{ on, attrs }">
                            <v-btn
                              color="primary"
                              outlined
                              small
                              :loading="
                                loading_accessions[tsource.transcript_accession]
                              "
                              v-bind="attrs"
                              v-on="on"
                              @click="map(tsource.transcript_accession, false)"
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

                    <v-row
                      v-if="
                        mapped_descriptions[tsource.transcript_accession] ||
                        mapping_errors[tsource.transcript_accession]
                      "
                    >
                      <v-col>
                        <v-card
                          v-if="
                            mapped_descriptions[tsource.transcript_accession]
                          "
                          tile
                          elevation="0"
                          color="grey lighten-4"
                        >
                          <v-card-subtitle class="grey--text ml-2">
                            Mapped description to
                            {{ tsource.transcript_accession }}
                          </v-card-subtitle>
                          <v-card-text>
                            <v-row>
                              <v-col>
                                <div class="ok-description-link">
                                  {{
                                    mapped_descriptions[
                                      tsource.transcript_accession
                                    ]
                                  }}
                                </div>
                              </v-col>
                              <v-col class="shrink">
                                <v-tooltip bottom>
                                  <template #activator="{ on, attrs }">
                                    <v-btn
                                      v-clipboard="
                                        mapped_descriptions[
                                          tsource.transcript_accession
                                        ]
                                      "
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

                        <div
                          v-if="mapping_errors[tsource.transcript_accession]"
                        >
                          <div class="grey--text ml-2 mt-2">
                            Mapping description to
                            {{ tsource.transcript_accession }} was unsuccessful.
                          </div>
                          <v-alert
                            v-for="(error, index) in mapping_errors[
                              tsource.transcript_accession
                            ].errors"
                            :key="index"
                            color="red lighten-1"
                            tile
                            border="left"
                            dark
                            dense
                            class="mt-2"
                          >
                            <div>{{ getMessage(error) }}</div>
                          </v-alert>
                        </div>
                      </v-col>
                    </v-row>
                  </div>
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
import JsonPretty from "./JsonPretty.vue";
import MutalyzerService from "../services/MutalyzerService.js";
import converter from "@/mixins/converter.js";

export default {
  name: "Related",
  components: {
    JsonPretty,
  },
  mixins: [converter],
  props: {
    normalized_response: {
      type: Object,
      default: null,
    },
  },
  data: function () {
    return {
      accession: null,
      locations: null,
      related: null,
      mockupdata: true,
      mapsuccess: false,
      mapped_to: null,
      mapped_descriptions: {},
      mapping_errors: {},
      progress: true,
      loading_accessions: {},
    };
  },
  mounted: function () {
    this.get_accession();
    this.locations = this.get_locations();
    this.get_related_references_retriever();
  },
  methods: {
    get_related_references_retriever: function (retryCount) {
      if (retryCount === undefined) {
        retryCount = 0;
      }

      var accessionPrefix = this.accession
        ? this.accession.substring(0, 3)
        : null;
      var needsLocations = accessionPrefix === "NC_";

      var config =
        needsLocations && this.locations
          ? { params: { locations: this.locations } }
          : {};

      var self = this;

      MutalyzerService.relatedReferences(this.accession, config)
        .then(function (response) {
          if (response.data) {
            self.progress = false;
            self.related = response.data;
          }
        })
        .catch(function (error) {
          self.progress = false;

          if (error.response && error.response.status === 500) {
            if (retryCount < 2) {
              setTimeout(
                function () {
                  self.get_related_references_retriever(retryCount + 1);
                },
                1000 * (retryCount + 1),
              );
              return;
            }
            self.related = {
              error: "Server error occurred. Please try again later.",
            };
          } else if (error.message === "Network Error") {
            if (retryCount < 2) {
              setTimeout(
                function () {
                  self.get_related_references_retriever(retryCount + 1);
                },
                1000 * (retryCount + 1),
              );
              return;
            }
            self.related = {
              error:
                "Network error. Please check your connection and try again.",
            };
          } else {
            self.related = {
              error: "Failed to load related references.",
            };
          }
        });
    },

    retryLoadRelated: function () {
      this.progress = true;
      this.related = null;
      this.get_related_references_retriever();
    },

    get_accession: function () {
      if (
        this.normalized_response &&
        this.normalized_response.normalized_model &&
        this.normalized_response.normalized_model.reference
      ) {
        this.accession = this.normalized_response.normalized_model.reference.id;
      }
    },

    get_locations: function () {
      if (!this.accession) {
        return null;
      }

      var accessionPrefix = this.accession.substring(0, 3);

      if (accessionPrefix !== "NC_") {
        return null;
      }

      if (
        !this.normalized_response ||
        !this.normalized_response.normalized_model
      ) {
        return null;
      }

      var coordSystem =
        this.normalized_response.normalized_model.coordinate_system;
      if (coordSystem !== "c" && coordSystem !== "n") {
        return null;
      }

      var selectorData = this.getSelectorData(this.normalized_response);
      var exons = selectorData.exons;
      var cds = selectorData.cds;
      var inverted = selectorData.inverted;

      if (!exons) {
        return null;
      }

      var isNoncoding = coordSystem === "n";
      var variants = this.normalized_response.normalized_model.variants;
      var locationStrings = [];
      var self = this;

      variants.forEach(function (variant) {
        if (!variant.location) {
          return;
        }

        var location = variant.location;

        if (location.type === "point") {
          var coding = self.pointToCoding(location);
          var coordinate;

          if (isNoncoding) {
            coordinate = self.noncodingToCoordinate(
              [coding[0], coding[1]],
              exons,
              inverted,
            );
          } else {
            coordinate = self.codingToCoordinate(coding, exons, cds, inverted);
          }

          locationStrings.push(String(coordinate));
        } else if (location.type === "range") {
          var startCoding = self.pointToCoding(location.start);
          var endCoding = self.pointToCoding(location.end);
          var startCoord, endCoord;

          if (isNoncoding) {
            startCoord = self.noncodingToCoordinate(
              [startCoding[0], startCoding[1]],
              exons,
              inverted,
            );
            endCoord = self.noncodingToCoordinate(
              [endCoding[0], endCoding[1]],
              exons,
              inverted,
            );
          } else {
            startCoord = self.codingToCoordinate(
              startCoding,
              exons,
              cds,
              inverted,
            );
            endCoord = self.codingToCoordinate(endCoding, exons, cds, inverted);
          }

          var min = Math.min(startCoord, endCoord);
          var max = Math.max(startCoord, endCoord);
          locationStrings.push(min + "_" + max);
        }
      });

      return locationStrings.join(";");
    },

    getSelector: function () {
      if (
        this.normalized_response &&
        this.normalized_response.normalized_model &&
        this.normalized_response.normalized_model.reference &&
        this.normalized_response.normalized_model.reference.selector
      ) {
        return this.normalized_response.normalized_model.reference.selector.id;
      }
      return null;
    },

    getReferenceId: function () {
      if (
        this.normalized_response &&
        this.normalized_response.normalized_model &&
        this.normalized_response.normalized_model.reference
      ) {
        return this.normalized_response.normalized_model.reference.id;
      }
      return null;
    },

    determineSelectorId: function (isAssembly, targetAccession) {
      var referenceId = this.getReferenceId();
      var hasSelector = this.getSelector();

      var refPrefix = this.getAccessionPrefix(referenceId);
      var targetPrefix = this.getAccessionPrefix(targetAccession);

      // ENST reference -> Map to ENSG using ENST as selector
      if (refPrefix === "ENST" && targetPrefix === "ENSG") {
        return referenceId;
      }

      // ENST reference -> Map to NG_ using NM_ from transcripts as selector
      if (refPrefix === "ENST" && targetPrefix === "NG_") {
        var nmSelector = this.findFirstTranscriptSelector();
        if (nmSelector) {
          return nmSelector;
        }
        if (hasSelector && this.isTranscriptSelector(hasSelector)) {
          return hasSelector;
        }
      }

      // NG_ reference -> Map using transcript from related
      if (refPrefix === "NG_") {
        var transcriptSelector = this.findFirstTranscriptSelector();
        if (transcriptSelector) {
          if (targetPrefix === "ENSG") {
            var enstSelector = this.findENSTForTranscript(transcriptSelector);
            if (enstSelector) {
              return enstSelector;
            }
          }
          return transcriptSelector;
        }

        if (hasSelector && this.isTranscriptSelector(hasSelector)) {
          if (targetPrefix === "ENSG") {
            var enstForSelector = this.findENSTForTranscript(hasSelector);
            if (enstForSelector) {
              return enstForSelector;
            }
          }
          return hasSelector;
        }
      }

      // NC_ with transcript selector
      if (
        refPrefix === "NC_" &&
        hasSelector &&
        this.isTranscriptSelector(hasSelector)
      ) {
        if (targetPrefix === "NG_") {
          return hasSelector;
        }

        if (targetPrefix === "ENSG") {
          var enstForNc = this.findENSTForTranscript(hasSelector);
          if (enstForNc) {
            return enstForNc;
          }
        }
      }

      // Default logic for assemblies
      if (isAssembly) {
        if (!referenceId.startsWith("LRG_") && hasSelector) {
          return hasSelector;
        }

        if (this.canBeUsedAsSelector(referenceId)) {
          return referenceId;
        }

        return null;
      }

      return targetAccession;
    },

    isTranscriptSelector: function (accession) {
      if (!accession) {
        return false;
      }
      var validPrefixes = ["NM_", "NR_", "XM_", "XR_"];
      for (var i = 0; i < validPrefixes.length; i++) {
        if (accession.startsWith(validPrefixes[i])) {
          return true;
        }
      }
      return false;
    },

    findFirstTranscriptSelector: function () {
      if (!this.related || !this.related.genes) {
        return null;
      }

      for (var g = 0; g < this.related.genes.length; g++) {
        var gene = this.related.genes[g];
        if (!gene.transcripts) {
          continue;
        }

        for (var t = 0; t < gene.transcripts.length; t++) {
          var transcript = gene.transcripts[t];
          if (!transcript.providers) {
            continue;
          }

          for (var p = 0; p < transcript.providers.length; p++) {
            var provider = transcript.providers[p];
            var acc = provider.transcript_accession;
            if (acc && this.isTranscriptSelector(acc)) {
              return acc;
            }
          }
        }
      }

      return null;
    },

    findENSTForTranscript: function (transcriptAccession) {
      if (!this.related || !this.related.genes || !transcriptAccession) {
        return null;
      }

      for (var g = 0; g < this.related.genes.length; g++) {
        var gene = this.related.genes[g];
        if (!gene.transcripts) {
          continue;
        }

        for (var t = 0; t < gene.transcripts.length; t++) {
          var transcript = gene.transcripts[t];
          if (!transcript.providers) {
            continue;
          }

          var hasTranscript = false;
          for (var p = 0; p < transcript.providers.length; p++) {
            if (
              transcript.providers[p].transcript_accession ===
              transcriptAccession
            ) {
              hasTranscript = true;
              break;
            }
          }

          if (hasTranscript) {
            for (var q = 0; q < transcript.providers.length; q++) {
              var acc = transcript.providers[q].transcript_accession;
              if (acc && acc.startsWith("ENST")) {
                return acc;
              }
            }
          }
        }
      }

      return null;
    },

    canBeUsedAsSelector: function (referenceId) {
      return this.isTranscriptSelector(referenceId);
    },

    getAccessionPrefix: function (accession) {
      if (!accession) {
        return null;
      }

      var acc = accession.toUpperCase();

      if (acc.startsWith("ENSG")) return "ENSG";
      if (acc.startsWith("ENST")) return "ENST";
      if (acc.startsWith("ENSP")) return "ENSP";

      var match = acc.match(/^([A-Z]{2}_)/);
      if (match) {
        return match[1];
      }

      return null;
    },

    map: function (targetAccession, isAssembly) {
      if (isAssembly === undefined) {
        isAssembly = false;
      }

      this.$set(this.mapping_errors, targetAccession, null);
      this.$set(this.loading_accessions, targetAccession, true);
      this.mapped_to = targetAccession;

      var selectorId = this.determineSelectorId(isAssembly, targetAccession);

      if (!selectorId) {
        this.handleMappingError(targetAccession, {
          details: "No valid selector available for mapping.",
        });
        return;
      }

      var mapParams = this.buildMapParams(targetAccession, selectorId);
      var self = this;

      MutalyzerService.map(mapParams)
        .then(function (response) {
          self.handleMappingSuccess(targetAccession, response);
        })
        .catch(function (error) {
          self.handleMappingError(targetAccession, error);
        });
    },

    buildMapParams: function (targetAccession, selectorId) {
      return {
        description: this.getOriginalDescription(),
        reference_id: targetAccession,
        selector_id: selectorId,
        slice_to: "transcript",
        filter_out: false,
      };
    },

    handleMappingSuccess: function (targetAccession, response) {
      if (response.data) {
        this.$set(this.loading_accessions, targetAccession, false);
        this.$set(
          this.mapped_descriptions,
          targetAccession,
          response.data.mapped_description,
        );
      }
    },

    handleMappingError: function (targetAccession, error) {
      this.$set(this.loading_accessions, targetAccession, false);

      var errorData;

      if (error.details) {
        errorData = error;
      } else if (error.response) {
        if (
          error.response.status === 422 &&
          error.response.data &&
          error.response.data.custom
        ) {
          errorData = error.response.data.custom;
        } else {
          errorData = {
            details: "Some response error occurred.",
          };
        }
      } else if (error.request) {
        errorData = {
          details: "Some connection or server error occurred.",
        };
      } else {
        errorData = { details: "Some error occurred." };
      }

      this.$set(this.mapping_errors, targetAccession, errorData);
    },

    canMapToAssembly: function () {
      if (
        !this.normalized_response ||
        !this.normalized_response.normalized_model ||
        !this.normalized_response.normalized_model.reference
      ) {
        return false;
      }

      var referenceId = this.normalized_response.normalized_model.reference.id;
      var hasSelector = this.getSelector();

      return (
        (!referenceId.startsWith("LRG_") && hasSelector) ||
        this.canBeUsedAsSelector(referenceId)
      );
    },

    getOriginalDescription: function () {
      if (
        this.normalized_response &&
        this.normalized_response.input_description
      ) {
        return this.normalized_response.input_description;
      }
      return null;
    },

    getMessage: function (message) {
      if (message.details) {
        if (message.options) {
          return (
            message.details +
            " Choose from: " +
            message.options.join(", ") +
            "."
          );
        }
        return message.details;
      }
      return message;
    },

    hgncUrl: function (id) {
      return (
        "https://genenames.org/data/gene-symbol-report/#!/hgnc_id/HGNC:" +
        encodeURIComponent(id)
      );
    },

    ensemblUrl: function (id) {
      return "https://www.ensembl.org/id/" + encodeURIComponent(id);
    },

    nuccoreUrl: function (acc) {
      return "https://www.ncbi.nlm.nih.gov/nuccore/" + encodeURIComponent(acc);
    },

    ncbiProteinUrl: function (acc) {
      return "https://www.ncbi.nlm.nih.gov/protein/" + encodeURIComponent(acc);
    },

    ncbiGeneUrl: function (gid) {
      return "https://www.ncbi.nlm.nih.gov/gene/" + encodeURIComponent(gid);
    },

    hgncTip: function (id) {
      return "Open HGNC page for HGNC:" + id;
    },

    ensemblTip: function (id) {
      return "Open Ensembl for " + id;
    },

    nuccoreTip: function (acc) {
      return "Open NCBI nuccore for " + acc;
    },

    proteinTip: function (acc) {
      return "Open NCBI protein for " + acc;
    },

    ncbiGeneTip: function (gid) {
      return "Open NCBI Gene " + gid;
    },

    linkForIdentifier: function (id, providerName) {
      var a = String(id || "").toUpperCase();
      var p = String(providerName || "").toUpperCase();

      if (
        p === "ENSEMBL" ||
        a.startsWith("ENSG") ||
        a.startsWith("ENST") ||
        a.startsWith("ENSP")
      ) {
        return {
          href: this.ensemblUrl(id),
          tip: this.ensemblTip(id),
          aria: "Open Ensembl page",
        };
      }

      if (
        a.startsWith("NP_") ||
        a.startsWith("XP_") ||
        a.startsWith("YP_") ||
        a.startsWith("WP_")
      ) {
        return {
          href: this.ncbiProteinUrl(id),
          tip: this.proteinTip(id),
          aria: "Open NCBI protein page",
        };
      }

      if (
        p === "NCBI" ||
        a.startsWith("NG_") ||
        a.startsWith("NM_") ||
        a.startsWith("NR_") ||
        a.startsWith("XR_") ||
        a.startsWith("XM_") ||
        a.startsWith("NC_") ||
        a.startsWith("NT_") ||
        a.startsWith("NW_")
      ) {
        return {
          href: this.nuccoreUrl(id),
          tip: this.nuccoreTip(id),
          aria: "Open NCBI nuccore page",
        };
      }

      return {
        href: this.nuccoreUrl(id),
        tip: this.nuccoreTip(id),
        aria: "Open NCBI nuccore page",
      };
    },

    getNcbiGeneId: function (gene) {
      if (!gene || !gene.providers) {
        return null;
      }

      for (var i = 0; i < gene.providers.length; i++) {
        var provider = gene.providers[i];
        var name = String(provider.name || "").toUpperCase();
        if (name === "NCBI" && provider.id) {
          return provider.id;
        }
      }

      return null;
    },
  },
};
</script>

<style scoped src="../assets/main.css"></style>
