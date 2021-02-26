<template>
  <div>
    <div class="overline mb-4">Reference Information</div>
    <v-expansion-panels flat hover multiple focusable v-model="panel">
      <v-expansion-panel v-if="record" v-model="panel">
        <v-expansion-panel-header v-slot="{ open }">
          <v-row no-gutters>
            <v-col cols="4">
              {{ record.id }}
            </v-col>
            <v-col cols="8" class="text--secondary">
              <v-fade-transition leave-absolute>
                <span v-if="open"></span>
                <v-row v-else no-gutters style="width: 100%">
                  <v-col cols="6" align="center">
                    {{ record.mol_type }}
                  </v-col>
                  <v-col cols="6" align="center">
                    {{ record.length }} bases
                  </v-col>
                </v-row>
              </v-fade-transition>
            </v-col>
          </v-row>
        </v-expansion-panel-header>
        <v-expansion-panel-content class="pl-1">
          <v-row no-gutters>
            <v-col cols="4"> Molecule type </v-col>
            <v-col cols="8" class="text--secondary">
              {{ record.mol_type }}
            </v-col>
          </v-row>
          <v-row no-gutters>
            <v-col cols="4"> Length </v-col>
            <v-col cols="8" class="text--secondary">
              {{ record.length }} bases
            </v-col>
          </v-row>
        </v-expansion-panel-content>
      </v-expansion-panel>

      <v-expansion-panel v-if="this.gene" class="pl-2">
        <v-expansion-panel-header v-slot="{ open }">
          <v-row no-gutters>
            <v-col cols="4">
              {{ gene.id }}
            </v-col>
            <v-col cols="8" class="text--secondary">
              <v-fade-transition leave-absolute>
                <span v-if="open"></span>
                <v-row v-else no-gutters style="width: 100%">
                  <v-col align="center"> gene </v-col>
                </v-row>
              </v-fade-transition>
            </v-col>
          </v-row>
        </v-expansion-panel-header>
        <v-expansion-panel-content class="pl-1">
          <v-row v-if="gene.hgnc" no-gutters>
            <v-col cols="4"> HGNC ID </v-col>
            <v-col cols="8" class="text--secondary">
              {{ gene.hgnc }}
            </v-col>
          </v-row>
          <v-row v-if="gene.synonym" no-gutters>
            <v-col cols="4"> Synonym </v-col>
            <v-col cols="8" class="text--secondary">
              {{ gene.synonym }}
            </v-col>
          </v-row>
          <v-row v-if="gene.location" no-gutters>
            <v-col cols="4"> Location </v-col>
            <v-col cols="8" class="text--secondary">
              [{{ gene.location.start }}; {{ gene.location.end }}]
              {{ gene.location.strand }}
            </v-col>
          </v-row>
        </v-expansion-panel-content>
      </v-expansion-panel>

      <v-expansion-panel v-if="this.transcript" class="pl-4">
        <v-expansion-panel-header v-slot="{ open }">
          <v-row no-gutters>
            <v-col cols="4">
              {{ transcript.id }}
            </v-col>
            <v-col cols="8" class="text--secondary">
              <v-fade-transition leave-absolute>
                <span v-if="open"></span>
                <v-row v-else no-gutters style="width: 100%">
                  <v-col align="center">
                    {{ transcript.type }}
                  </v-col>
                </v-row>
              </v-fade-transition>
            </v-col>
          </v-row>
        </v-expansion-panel-header>
        <v-expansion-panel-content class="pl-1">
          <v-row no-gutters>
            <v-col cols="4"> Type </v-col>
            <v-col cols="8" class="text--secondary">
              {{ transcript.type }}
            </v-col>
          </v-row>
          <v-row no-gutters>
            <v-col cols="4"> Location </v-col>
            <v-col cols="8" class="text--secondary">
              [{{ transcript.location.start }}; {{ transcript.location.end }}]
              {{ transcript.location.strand }}
            </v-col>
          </v-row>
          <v-row v-if="transcript.exons" no-gutters>
            <v-col cols="4"> Exons </v-col>
            <v-col cols="8" class="text--secondary">
              <v-row
                v-for="(exon, index) in transcript.exons"
                :key="index"
                no-gutters
              >
                <v-col cols="4">
                  {{ exon.id }}
                </v-col>
                <v-col cols="8" class="text--secondary">
                  [{{ exon.location.start }}; {{ exon.location.end }}]
                </v-col>
              </v-row>
            </v-col>
          </v-row>
          <v-row v-if="transcript.cds" no-gutters>
            <v-col cols="4"> CDS </v-col>
            <v-col cols="8" class="text--secondary">
              <v-row no-gutters>
                <v-col cols="4">
                  {{ transcript.cds.id }}
                </v-col>
                <v-col cols="8" class="text--secondary">
                  [{{ transcript.cds.location.start }};
                  {{ transcript.cds.location.end }}]
                </v-col>
              </v-row>
            </v-col>
          </v-row>
        </v-expansion-panel-content>
      </v-expansion-panel>
    </v-expansion-panels>

    <v-expansion-panels
      focusable
      hover
      flat
      class="mt-10 mb-10"
      v-if="selectorModel"
    >
      <v-expansion-panel>
        <v-expansion-panel-header>View as a tree</v-expansion-panel-header>
        <v-expansion-panel-content>
          <JsonPretty :summary="selectorModel" />
        </v-expansion-panel-content>
      </v-expansion-panel>
    </v-expansion-panels>
  </div>
</template>

<script>
import MutalyzerService from "../services/MutalyzerService.js";
import JsonPretty from "./JsonPretty.vue";

export default {
  name: "RenderSelectorDetails",
  components: {
    JsonPretty,
  },
  props: {
    referenceId: null,
    selectorId: null,
  },
  data() {
    return {
      panel: [2],
      selectorModel: null,
      record: null,
      gene: null,
      transcript: null,
    };
  },
  created: function () {
    const params = {
      reference_id: this.referenceId,
      feature_id: this.selectorId,
    };
    MutalyzerService.referenceModel(params).then((response) => {
      if (response.data) {
        this.selectorModel = response.data;
        this.record = this.getRecord(this.selectorModel);
        this.gene = this.getGene(this.selectorModel);
        this.transcript = this.getTranscript(this.selectorModel);
      }
    });
  },
  methods: {
    getRecord(annotations) {
      if (annotations.type != "record") {
        return;
      }
      let output = { id: annotations.id };
      if (annotations.qualifiers && annotations.qualifiers.mol_type) {
        output.mol_type = annotations.qualifiers.mol_type;
      }
      output.length =
        annotations.location.end.position - annotations.location.start.position;
      return output;
    },
    getGene(annotations) {
      if (annotations.type == "record" && annotations.features.length == 1) {
        let gene = annotations.features[0];
        let output = { id: gene.id };
        if (gene.qualifiers) {
          if (gene.qualifiers.HGNC) {
            output.hgnc = gene.qualifiers.HGNC;
          }
          if (gene.qualifiers.synonym) {
            if (typeof gene.qualifiers.synonym == "string") {
              output.synonym = gene.qualifiers.synonym;
            } else {
              output.synonym = gene.qualifiers.synonym.join(", ");
            }
          }
        }
        if (gene.location) {
          output.location = this.extractLocation(gene.location);
        }
        return output;
      }
    },
    getTranscript(annotations) {
      if (
        annotations.type == "record" &&
        annotations.features.length == 1 &&
        annotations.features[0].features.length == 1
      ) {
        let transcript = annotations.features[0].features[0];
        let output = {
          id: transcript.id,
          type: transcript.type,
        };
        if (transcript.location) {
          output.location = this.extractLocation(transcript.location);
        }
        if (transcript.features) {
          let exons = [];
          let cds = {};
          for (let entry of transcript.features) {
            if (entry.type == "exon") {
              exons.push({
                id: entry.id,
                location: this.extractLocation(entry.location),
              });
            } else if (entry.type == "CDS") {
              cds.location = this.extractLocation(entry.location);
              cds.id = entry.id;
            }
          }
          if (exons.length > 0) {
            output.exons = exons;
          }
          if (!(Object.keys(cds).length === 0 && cds.constructor === Object)) {
            output.cds = cds;
          }
        }
        return output;
      }
    },
    extractLocation(location) {
      let output = {
        start: location.start.position,
        end: location.end.position,
      };
      if (location.strand == 1) {
        output.strand = "+";
      } else if (location.strand == -1) {
        output.strand = "-";
      }
      return output;
    },
  },
};
</script>
