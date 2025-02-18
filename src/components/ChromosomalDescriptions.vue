<template>
  <div>
    <div v-for="assembly in assemblies" :key="assembly">
      <span>{{ assembly }}</span>
      <v-progress-linear
        v-if="progress[assembly]"
        indeterminate
        class="mt-5"
      ></v-progress-linear>
      <Description
        v-if="
          mapped_descriptions &&
          mapped_descriptions[assembly] &&
          mapped_descriptions[assembly].mapped_description
        "
        :description="mapped_descriptions[assembly].mapped_description"
        :css_class="'ok-description-link'"
        :to_name="'Normalizer'"
        :to_params="{
          descriptionRouter: mapped_descriptions[assembly].mapped_description,
        }"
        :tag="mapped_descriptions[assembly].tag"
      />
      <Description
        v-if="
          mapped_descriptions &&
          mapped_descriptions[assembly] &&
          mapped_descriptions[assembly].genomic_description
        "
        :description="mapped_descriptions[assembly].genomic_description"
        :css_class="'ok-description-link'"
        :to_name="'Normalizer'"
        :to_params="{
          descriptionRouter: mapped_descriptions[assembly].genomic_description,
        }"
      />
      <v-expansion-panels
        v-if="errors[assembly] && errors[assembly].errors"
        multiple
        flat
        tile
      >
        <v-expansion-panel>
          <v-expansion-panel-header class="overline red--text text"
            >Unsuccessful mapping
            <template #actions>
              <v-icon color="error"> mdi-alert-circle </v-icon>
            </template>
          </v-expansion-panel-header>
          <v-expansion-panel-content>
            <v-alert
              v-for="(error, index_errors) in errors[assembly].errors"
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
        v-if="connectionErrors[assembly]"
        prominent
        type="error"
        tile
        elevation="2"
        icon="mdi-network-off-outline"
        color="grey darken-4"
      >
        <v-row align="center">
          <v-col class="grow">
            {{ connectionErrors[assembly].details }}
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
      mapped_descriptions: {},
      responses: {},
      errors: {},
      connectionErrors: {},
      assemblies: ["GRCH38", "GRCH37"],
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
          this.mapped_descriptions[assembly] = null;
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
            });

            // Update the results if the response is successful
            if (response.data) {
              this.mapped_descriptions = {
                ...this.mapped_descriptions,
                [assembly]: response.data,
              };
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
