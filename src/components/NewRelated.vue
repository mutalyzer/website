<template>
  <div>
    <div v-if="related && related.related">
      <!--genes-->
      <div v-for="gene in related.related.genes" :key="gene.name">
        <div class="overline">
          <a
            :href="`https://www.genenames.org/data/gene-symbol-report/#!/hgnc_id/HGNC:${gene.hgnc_id}`"
            >{{ gene.name }}
          </a>
        </div>
        <div v-for="provider in gene.providers" :key="provider.accession">
          <v-row align="center">
            <v-col>
              <a
                :href="`https://www.ncbi.nlm.nih.gov/nuccore/${provider.accession}`"
                >{{ provider.accession }}
              </a>
            </v-col>
            <v-col class="shrink">
              <v-tooltip bottom>
                <template #activator="{ on, attrs }">
                  <v-btn
                    color="primary"
                    outlined
                    small
                    v-bind="attrs"
                    v-on="on"
                    @click="map()"
                  >
                    Map
                  </v-btn>
                </template>
                <span>Map to this sequence.</span>
              </v-tooltip>
            </v-col>
          </v-row>
          <v-alert type="success" v-if="mapsuccess" dismissible class="mt-3">
            Mapping successful!
          </v-alert>
        </div>
      </div>

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
    map() {
      this.mapsuccess = true;
    },
  },
};
</script>

<style scoped src="../assets/main.css"></style>
