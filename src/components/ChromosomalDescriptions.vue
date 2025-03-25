<template>
  <div>
    <div
      v-for="(assembly_i, index) in assemblies"
      :key="assembly_i"
      :class="index === assemblies.length - 1 ? 'mt-5' : ''"
    >
      <span>{{ assemblyNames[assembly_i] }}</span>
      <v-progress-linear
        v-if="progress[assembly_i]"
        indeterminate
        class="my-5"
      ></v-progress-linear>
      <v-expansion-panels
        v-if="
          responses &&
          responses[assembly_i] &&
          responses[assembly_i].mapped_description
        "
        multiple
        flat
        tile
      >
        <v-expansion-panel
          v-if="responses[assembly_i].ref_seq_differences"
          class="my-2"
        >
          <v-expansion-panel-header
            class="overline blue--text text"
            style="background: #e1f5fe"
            disable-icon-rotate
            >There are differences between the mapped sequences
            <template #actions>
              <v-icon color="info"> mdi-alert-circle </v-icon>
            </template>
          </v-expansion-panel-header>
          <v-expansion-panel-content style="background: #e1f5fe">
            <span class="overline grey--text text"
              >Reference Sequences Description</span
            >
            <Description
              v-if="responses[assembly_i].reference_sequences_description"
              :description="
                responses[assembly_i].reference_sequences_description
              "
              :css_class="'ok-description-link'"
              :to_name="'Normalizer'"
              :to_params="{
                descriptionRouter:
                  responses[assembly_i].reference_sequences_description,
              }"
              :tag="responses[assembly_i].tag"
            />
            <span class="overline grey--text text"
              >Unfiltered Mapped Description</span
            >
            <Description
              v-if="responses[assembly_i].unfiltered_mapped_description"
              :description="responses[assembly_i].unfiltered_mapped_description"
              :css_class="'ok-description-link'"
              :to_name="'Normalizer'"
              :to_params="{
                descriptionRouter:
                  responses[assembly_i].unfiltered_mapped_description,
              }"
              :tag="responses[assembly_i].tag"
            />
          </v-expansion-panel-content>
        </v-expansion-panel>
      </v-expansion-panels>
      <Description
        v-if="
          responses &&
          responses[assembly_i] &&
          responses[assembly_i].mapped_description
        "
        :description="responses[assembly_i].mapped_description"
        :css_class="'ok-description-link'"
        :to_name="'Normalizer'"
        :to_params="{
          descriptionRouter: responses[assembly_i].mapped_description,
        }"
        :tag="responses[assembly_i].tag"
      />
      <Description
        v-if="
          responses &&
          responses[assembly_i] &&
          responses[assembly_i].genomic_description
        "
        :description="responses[assembly_i].genomic_description"
        :css_class="'ok-description-link'"
        :to_name="'Normalizer'"
        :to_params="{
          descriptionRouter: responses[assembly_i].genomic_description,
        }"
      />
      <v-expansion-panels
        v-if="errors[assembly_i] && errors[assembly_i].errors"
        multiple
        flat
        tile
      >
        <v-expansion-panel class="my-2">
          <v-expansion-panel-header class="overline red--text text"
            >Unsuccessful mapping
            <template #actions>
              <v-icon color="error"> mdi-alert-circle </v-icon>
            </template>
          </v-expansion-panel-header>
          <v-expansion-panel-content>
            <v-alert
              v-for="(error, index_errors) in errors[assembly_i].errors"
              :key="index_errors"
              color="red lighten-1"
              tile
              border="left"
              dark
              class="mt-5"
            >
              <div>
                {{ getMessage(error) }}
              </div>
            </v-alert>
          </v-expansion-panel-content>
        </v-expansion-panel>
      </v-expansion-panels>
      <v-alert
        v-if="connectionErrors[assembly_i]"
        prominent
        type="error"
        tile
        elevation="2"
        icon="mdi-network-off-outline"
        color="grey darken-4"
      >
        <v-row align="center">
          <v-col class="grow">
            {{ connectionErrors[assembly_i].details }}
          </v-col>
        </v-row>
      </v-alert>
    </div>
  </div>
</template>

<script>
import MutalyzerService from "../services/MutalyzerService.js";
import Description from "./Description.vue";

export default {
  name: "ChromosomalDescriptions",
  components: {
    Description,
  },
  props: {
    description: {
      type: [String, null],
      default: null,
    },
    assembly: {
      type: [String, null],
      default: null,
    },
  },
  data() {
    return {
      progress: {},
      responses: {},
      errors: {},
      connectionErrors: {},
      assemblies: ["GRCH38", "GRCH37"],
      showNotes: { GRCH38: false, GRCH37: false },
      assemblyNames: {
        GRCH38: "Genome Assembly GRCh38 (hg38)",
        GRCH37: "Genome Assembly GRCh37 (hg19)",
      },
    };
  },
  created: function () {
    this.map();
  },
  methods: {
    async map() {
      if (this.description && this.assemblies.length > 0) {
        this.assemblies.forEach((assembly) => {
          this.progress[assembly] = true;
          this.responses[assembly] = null;
          this.errors[assembly] = null;
          this.connectionErrors[assembly] = null;
        });

        // Loop through assemblies and wait for each API call to finish before continuing
        for (const assembly of this.assemblies) {
          try {
            const response = await MutalyzerService.map({
              description: this.description,
              reference_id: assembly,
              filter_out: true,
            });

            // Update the results if the response is successful
            if (response.data) {
              this.responses = {
                ...this.responses,
                [assembly]: response.data,
              };
            }
          } catch (error) {
            this.handleError(error, assembly);
          } finally {
            this.progress = {
              ...this.progress,
              [assembly]: false,
            };
          }
        }
      }
    },
    handleError: function (error, assembly) {
      this.responses = {
        ...this.responses,
        [assembly]: false,
      };
      if (error.response) {
        if (
          error.response.status === 422 &&
          error.response.data &&
          error.response.data.custom
        ) {
          this.errors = {
            ...this.errors,
            [assembly]: error.response.data.custom,
          };
        } else if (error.response.status === 504) {
          this.connectionErrors = {
            ...this.connectionErrors,
            [assembly]: {
              details:
                "Operation Timeout: This normalization appears too resource-intensive for the server. We recommend using a local installation.",
            },
          };
        } else {
          this.connectionErrors = {
            ...this.connectionErrors,
            [assembly]: {
              details:
                "Internal Server Error: An unexpected error occurred. Please contact us if you think that the description should be processed.",
            },
          };
        }
      } else if (error.request) {
        this.connectionErrors = {
          ...this.connectionErrors,
          [assembly]: {
            details:
              "Internal Server Error: An unexpected error occurred. Please contact us if you think that the description should be processed.",
          },
        };
      } else {
        this.connectionErrors = {
          ...this.connectionErrors,
          [assembly]: {
            details:
              "Internal Server Error: An unexpected error occurred. Please contact us if you think that the description should be processed.",
          },
        };
      }
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
  },
};
</script>

<style scoped src="../assets/main.css"></style>
