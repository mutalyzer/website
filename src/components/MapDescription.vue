<template>
  <v-sheet>
    <v-list-item>
      <v-list-item-avatar v-if="show_loading">
        <v-progress-circular
          indeterminate
          :width="3"
          :size="20"
          color="blue lighten-1"
        ></v-progress-circular>
      </v-list-item-avatar>

      <v-tooltip bottom v-if="show_error">
        <template v-slot:activator="{ on, attrs }">
          <v-list-item-avatar v-bind="attrs" v-on="on">
            <v-icon color="red lighten-1"> mdi-alert-circle </v-icon>
          </v-list-item-avatar>
        </template>
        <span>{{ error_tooltip }}</span>
      </v-tooltip>

      <v-list-item-content>
        <v-list-item-title class="description"
          >{{ reference_id
          }}{{ selector_id ? "(" + selector_id + ")" : "" }}</v-list-item-title
        >
      </v-list-item-content>

      <v-list-item-action>
        <v-menu open-on-hover bottom left content-class="elevation-2">
          <template v-slot:activator="{ on, attrs }">
            <v-btn color="blue" icon v-bind="attrs" v-on="on">
              <v-icon>mdi-dots-vertical</v-icon>
            </v-btn>
          </template>

          <v-list>
            <v-list-item class="text-right">
              <v-btn small text color="primary" @click="map(false)">
                Map description to this reference sequence
              </v-btn>
            </v-list-item>
            <v-list-item>
              <v-btn small text color="primary" @click="map(true)">
                Map and filter description to this reference sequence
              </v-btn>
            </v-list-item>
          </v-list>
        </v-menu>
      </v-list-item-action>
    </v-list-item>

    <v-list-item v-if="show_mapped_description">
      <v-list-item-content>
        <v-list-item-title>
          <router-link
            class="ex-description-link"
            :to="{
              name: 'NameChecker',
              params: {
                descriptionRouter: mapped_description,
              },
            }"
            >{{ mapped_description }}</router-link
          >
        </v-list-item-title>
      </v-list-item-content>

      <v-list-item-action>
        <v-tooltip bottom>
          <template v-slot:activator="{ on, attrs }">
            <v-btn icon v-bind="attrs" v-on="on">
              <v-icon color="grey lighten-1">mdi-information</v-icon>
            </v-btn>
          </template>
          <span
            >Input description mapped to {{ reference_id
            }}{{ selector_id ? "(" + selector_id + ")" : "" }}</span
          >
        </v-tooltip>
      </v-list-item-action>
    </v-list-item>

    <v-list-item v-if="show_mapped_filtered_description">
      <v-list-item-content>
        <v-list-item-title>
          <router-link
            class="ex-description-link"
            :to="{
              name: 'NameChecker',
              params: {
                descriptionRouter: mapped_description,
              },
            }"
            >{{ mapped_filtered_description }}</router-link
          ></v-list-item-title
        >
      </v-list-item-content>

      <v-list-item-action>
        <v-tooltip bottom>
          <template v-slot:activator="{ on, attrs }">
            <v-btn icon v-bind="attrs" v-on="on">
              <v-icon color="grey lighten-1">mdi-information</v-icon>
            </v-btn>
          </template>
          <span
            >Input description mapped to {{ reference_id
            }}{{ selector_id ? "(" + selector_id + ")" : "" }} with reference
            sequence differences filtered out</span
          >
        </v-tooltip>
      </v-list-item-action>
    </v-list-item>
    <v-divider></v-divider>
  </v-sheet>
</template>

<script>
import MutalyzerService from "../services/MutalyzerService.js";

export default {
  name: "MapItem",
  props: {
    description: null,
    reference_id: null,
    selector_id: null,
    details: null,
  },
  data() {
    return {
      reference: null,
      mapped_description: null,
      mapped_filtered_description: null,
      show_reference: true,
      show_mapped_description: false,
      show_mapped_filtered_description: false,
      show_loading: false,
      show_error: false,
      error_tooltip: null,
    };
  },
  methods: {
    map(clean) {
      if (this.description && this.reference_id) {
        this.show_loading = true;
        let params = {
          description: this.description,
          reference_id: this.reference_id,
          clean: clean,
        };
        if (this.selector_id) {
          params.selector_id = this.selector_id;
        }
        MutalyzerService.map(params)
          .then((response) => {
            if (response.data) {
              this.processResponse(response.data, clean);
            }
          })
          .catch((error) => {
            this.show_loading = false;
            this.show_error = true;
            this.error_tooltip = "Some connection/server rrror occured.";
            if (error.response) {
              this.connectionErrors = {
                details: "Some response error occured.",
              };
            } else if (error.request) {
              this.connectionErrors = {
                details: "Some connection or server error occured.",
              };
            } else {
              this.connectionErrors = { details: "Some error occured." };
            }
          });
      }
    },
    processResponse: function (response, clean) {
      this.show_loading = false;
      if (this.errorsEncountered(response)) {
        this.show_error = true;
        this.error_tooltip = response.errors[0].details;
      } else {
        if (clean) {
          this.mapped_filtered_description = response;
          this.show_mapped_filtered_description = true;
        } else {
          this.mapped_description = response;
          this.show_mapped_description = true;
        }
      }
    },
    errorsEncountered: function (response) {
      if (response && response.errors) {
        return true;
      } else {
        return false;
      }
    },
  },
};
</script>

<style scoped src="../assets/main.css"></style>
