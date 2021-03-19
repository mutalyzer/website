<template>
  <v-list-item>
    <v-tooltip bottom v-if="show_reference && !show_loading && !show_error">
      <template v-slot:activator="{ on, attrs }">
        <v-list-item-avatar v-bind="attrs" v-on="on">
          <v-btn color="blue lighten-1" icon @click="lift(false)">
            <v-icon> mdi-book-arrow-up-outline </v-icon>
          </v-btn>
        </v-list-item-avatar>
      </template>
      <span>Lift</span>
    </v-tooltip>

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

    <v-list-item-avatar v-if="show_description">
      <v-icon color="green lighten-1">
        mdi-checkbox-marked-circle-outline
      </v-icon>
    </v-list-item-avatar>

    <v-list-item-content v-if="show_reference">
      <v-list-item-title class="description"
        >{{ reference_id
        }}{{ selector_id ? "(" + selector_id + ")" : "" }}</v-list-item-title
      >
    </v-list-item-content>

    <v-list-item-content v-if="show_description">
      <v-list-item-title>
        <router-link
          class="ex-description-link"
          :to="{
            name: 'NameChecker',
            params: {
              descriptionRouter: lifted_description,
            },
          }"
          >{{ lifted_description }}</router-link
        ></v-list-item-title
      >
    </v-list-item-content>

    <v-tooltip bottom v-if="show_description">
      <template v-slot:activator="{ on, attrs }">
        <v-list-item-avatar v-bind="attrs" v-on="on">
          <v-btn color="blue lighten-1" icon @click="lift(true)">
            <v-icon> mdi-silverware-clean </v-icon>
          </v-btn>
        </v-list-item-avatar>
      </template>
      <span>Clean variants due to sequences differences.</span>
    </v-tooltip>

    <v-list-item-action>
      <v-btn icon>
        <v-icon color="grey lighten-1">mdi-information</v-icon>
      </v-btn>
    </v-list-item-action>
  </v-list-item>
</template>

<script>
import MutalyzerService from "../services/MutalyzerService.js";

export default {
  name: "LiftItem",
  props: {
    description: null,
    reference_id: null,
    selector_id: null,
    details: null,
  },
  data() {
    return {
      reference: null,
      lifted_description: null,
      show_reference: true,
      show_description: false,
      show_loading: false,
      show_error: false,
      error_tooltip: null,
    };
  },
  methods: {
    lift(clean) {
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
        MutalyzerService.lift(params)
          .then((response) => {
            if (response.data) {
              this.processResponse(response.data);
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
    processResponse: function (response) {
      this.show_loading = false;
      if (this.errorsEncountered(response)) {
        this.show_error = true;
        this.error_tooltip = response.errors[0].details;
      } else {
        this.lifted_description = response;
        this.show_description = true;
        this.show_reference = false;
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
