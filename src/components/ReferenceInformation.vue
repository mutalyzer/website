<template>
  <div>
    <v-expansion-panels
      multiple
      flat
      class="mt-5 mb-5"
      tile
      v-if="record"
      v-model="panel"
    >
      <v-expansion-panel v-if="record">
        <v-expansion-panel-header>{{ record.id }}</v-expansion-panel-header>
        <v-expansion-panel-content>
          <v-list shaped>
            <v-list-item v-for="(detail, index) in record.details" :key="index">
              <v-list-item-title>{{ detail.name }}</v-list-item-title>
              <v-list-item-subtitle class="text-right">{{
                detail.value
              }}</v-list-item-subtitle>
            </v-list-item>
          </v-list>
        </v-expansion-panel-content>
      </v-expansion-panel>

      <v-expansion-panel v-if="gene">
        <v-expansion-panel-header>{{ gene.id }}</v-expansion-panel-header>
        <v-expansion-panel-content>
          <v-list>
            <v-list-item v-for="(detail, index) in gene.details" :key="index">
              <v-list-item-title>{{ detail.name }}</v-list-item-title>
              <v-list-item-subtitle class="text-right">{{
                detail.value
              }}</v-list-item-subtitle>
            </v-list-item>
          </v-list>
        </v-expansion-panel-content>
      </v-expansion-panel>

      <v-expansion-panel v-if="selector">
        <v-expansion-panel-header>{{ selector.id }}</v-expansion-panel-header>
        <v-expansion-panel-content>
          <v-list shaped>
            <v-list-item
              v-for="(detail, index) in selector.details"
              :key="index"
            >
              <v-list-item-title>{{ detail.name }}</v-list-item-title>
              <v-list-item-subtitle class="text-right">{{
                detail.value
              }}</v-list-item-subtitle>
            </v-list-item>
          </v-list>
        </v-expansion-panel-content>
      </v-expansion-panel>
    </v-expansion-panels>

    <v-expansion-panels
      focusable
      hover
      flat
      class="mt-10 mb-10"
      v-if="record && false"
    >
      <v-expansion-panel>
        <v-expansion-panel-header>View as a tree</v-expansion-panel-header>
        <v-expansion-panel-content>
          <JsonPretty :summary="reference_model" />
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
    model: null,
  },
  data() {
    return {
      panel: [0, 1, 2],
      reference_model: null,
      record: null,
      gene: null,
      selector: null,
    };
  },
  created: function () {
    let reference = this.model.reference;
    let params = {
      reference_id: this.model.reference.id,
      feature_id: this.model.reference.id,
      siblings: false,
      ancestors: false,
      descendants: false,
    };

    if (reference.selector) {
      params = {
        reference_id: this.model.reference.id,
        feature_id: this.model.reference.selector.id,
        siblings: false,
        ancestors: true,
        descendants: true,
      };
    }
    MutalyzerService.referenceModel(params).then((response) => {
      if (response.data) {
        this.reference_model = response.data;
        this.record = this.getRecord(this.reference_model);
        this.gene = this.getGene(this.reference_model);
        this.selector = this.getSelector(this.reference_model);
      }
    });
  },
  methods: {
    getRecord(annotations) {
      if (annotations.type != "record") {
        return;
      }
      let output = { id: annotations.id };
      if (annotations.qualifiers) {
        output.details = this.extractQualifiers(annotations.qualifiers);
      }
      output.details.push({
        name: "Sequence length",
        value:
          annotations.location.end.position -
          annotations.location.start.position,
      });
      return output;
    },
    getGene(annotations) {
      if (annotations.features && annotations.features.length == 1) {
        let gene = annotations.features[0];
        let output = { id: gene.id };
        let details = [{ name: "Type", value: "gene" }];
        if (gene.qualifiers) {
          details.push(...this.extractQualifiers(gene.qualifiers));
        }
        output.details = details;
        return output;
      }
    },
    getSelector(annotations) {
      // TODO: Clean.
      if (
        annotations.features &&
        annotations.features.length == 1 &&
        annotations.features[0].features.length == 1
      ) {
        let selector = annotations.features[0].features[0];
        let details = [];
        details.push({ name: "Type", value: selector.type });

        let output = {
          id: selector.id,
          type: selector.type,
        };
        if (selector.location) {
          output.location = this.extractLocation(selector.location);
          if (output.location && output.location.strand) {
            details.push({ name: "Strand", value: output.location.strand });
          }
        }
        if (selector.features) {
          let exons = [];
          let cds = {};
          for (let entry of selector.features) {
            if (entry.type == "exon") {
              exons.push({
                id: entry.id,
                location: this.extractLocation(entry.location),
              });
            } else if (entry.type == "CDS") {
              details.push({ name: "CDS ID", value: entry.id });
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
        output.details = details;
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
    extractQualifiers(qualifiers) {
      let details = [];
      for (const [q, v] of Object.entries(qualifiers)) {
        if (q == "mol_type") {
          details.push({ name: "Molecule type", value: v });
        } else if (q == "name") {
          details.push({ name: "Name", value: v });
        } else if (q == "synonym") {
          if (typeof v == "string") {
            details.push({ name: "Synonym", value: v });
          } else {
            details.push({ name: "Synonyms", value: v.join(", ") });
          }
        } else if (q == "HGNC" || q == "hgnc_id") {
          details.push({ name: "HGNC ID", value: v });
        } else if (q == "organism") {
          details.push({ name: "Organism", value: v });
        } else if (q == "sequence_source") {
          details.push({ name: "Sequence source", value: v });
        } else if (q == "creation_date") {
          details.push({ name: "Creation date", value: v });
        } else {
          details.push({ name: q, value: v });
        }
      }
      return details;
    },
  },
};
</script>
