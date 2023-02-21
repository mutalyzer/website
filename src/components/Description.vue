<template>
  <div>
    <v-row align="center">
      <v-col v-if="tooltip && to_name" class="grow">
        <v-tooltip bottom>
          <template v-slot:activator="{ on, attrs }">
            <router-link
              v-if="to_name"
              :class="css_class"
              :to="{
                name: to_name,
                params: to_params,
                query: to_query,
              }"
            >
              <div :class="css_class" v-bind="attrs" v-on="on">
                {{ description }}
              </div>
            </router-link>
            <div v-else :class="css_class" v-bind="attrs" v-on="on">
              {{ description }}
            </div>
          </template>
          <span>{{ tooltip }}</span>
        </v-tooltip>
      </v-col>
      <v-col v-else class="grow">
        <router-link
          v-if="to_name"
          :class="css_class"
          :to="{
            name: to_name,
            params: to_params,
            query: to_query,
          }"
          >{{ description }}</router-link
        >
        <div v-else :class="css_class">
          {{ description }}
        </div>
      </v-col>
      <v-col v-if="tag" class="shrink">
        <v-tooltip bottom v-if="this.css_class == 'ok-description-link'">
          <template v-slot:activator="{ on, attrs }">
            <v-chip
              v-bind="attrs"
              v-on="on"
              color="green darken-4"
              text-color="green darken-4"
              outlined
              label
              small
            >
              {{ tag.details }}
            </v-chip>
          </template>
          <span
            >{{ this.tag.id }} is the representative transcript as part of the
            MANE project.</span
          >
        </v-tooltip>
        <v-tooltip v-else bottom>
          <template v-slot:activator="{ on, attrs }">
            <v-chip
              v-bind="attrs"
              v-on="on"
              color="white"
              text-color="white"
              outlined
              label
              small
            >
              {{ tag.details }}
            </v-chip>
          </template>
          <span
            >{{ this.tag.id }} is the representative transcript as part of the
            MANE project.</span
          >
        </v-tooltip>
      </v-col>
      <v-col v-if="selector && !mapping_checked" class="shrink">
        <v-tooltip bottom>
          <template v-slot:activator="{ on, attrs }">
            <v-btn
              color="primary"
              outlined
              small
              :loading="loading"
              v-bind="attrs"
              v-on="on"
              @click="map()"
            >
              Map
            </v-btn>
          </template>
          <span> Map this description to {{ this.selector.id }}. </span>
        </v-tooltip>
      </v-col>
      <v-col class="shrink">
        <v-tooltip bottom>
          <template v-slot:activator="{ on, attrs }">
            <v-btn v-bind="attrs" v-on="on" icon v-clipboard="description">
              <v-icon>mdi-content-copy</v-icon>
            </v-btn>
          </template>
          <span>Copy</span>
        </v-tooltip>
      </v-col>
    </v-row>
    <v-row v-if="this.mapped_description">
      <v-col>
        <v-card tile elevation="0" color="grey lighten-5">
          <v-card-subtitle class="grey--text ml-2"
            >Mapped description to {{ this.selector.id }}</v-card-subtitle
          >
          <v-card-text
            ><v-row
              ><v-col>
                <div :class="css_class">
                  {{ this.mapped_description }}
                </div></v-col
              >
              <v-col class="shrink">
                <v-tooltip bottom>
                  <template v-slot:activator="{ on, attrs }">
                    <v-btn
                      v-bind="attrs"
                      v-on="on"
                      icon
                      v-clipboard="mapped_description"
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
    <v-row v-if="mapping_errors">
      <v-col>
        <div class="grey--text ml-2">
          Mapping description to {{ this.selector.id }} was unsuccessful.
        </div>
      </v-col>
    </v-row>
    <v-row v-if="mapping_errors">
      <v-col class="pl-4 pr-4">
        <v-alert
          color="red lighten-1"
          tile
          border="left"
          dark
          dense
          v-for="(error, index) in mapping_errors.errors"
          :key="index"
        >
          <div>
            {{ getMessage(error) }}
          </div>
        </v-alert>
      </v-col>
    </v-row>
  </div>
</template>

<script>
import MutalyzerService from "../services/MutalyzerService.js";

export default {
  name: "Description",
  props: {
    description: null,
    css_class: null,
    tooltip: null,
    to_name: null,
    to_params: null,
    to_query: null,
    tag: null,
    selector: null,
  },
  data: () => ({
    mapped_description: null,
    mapping_errors: null,
    mapping_checked: false,
    loading: null,
  }),

  methods: {
    map: function () {
      if (this.description && this.selector && this.selector.id) {
        this.mapping_errors = null;
        this.loading = true;
        this.mapped_description = null;

        MutalyzerService.map(this.getMapParams())
          .then((response) => {
            if (response.data) {
              this.loading = false;
              this.mapping_checked = true;
              this.mapped_description = response.data.mapped_description;
            }
          })
          .catch((error) => {
            this.loading = false;
            this.mapping_checked = true;
            if (error.response) {
              if (
                error.response.status == 422 &&
                error.response.data &&
                error.response.data.custom
              ) {
                this.mapping_errors = error.response.data.custom;
              } else {
                this.mapping_errors = {
                  details: "Some response error occured.",
                };
              }
            } else if (error.request) {
              this.mapping_errors = {
                details: "Some connection or server error occured.",
              };
            } else {
              this.mapping_errors = { details: "Some error occured." };
            }
          });
      }
    },
    getMapParams: function () {
      let params = {
        description: this.description,
        reference_id: this.selector.id,
      };
      params.selector_id = this.selector.id;
      params.slice_to = "transcript";
      params.filter = false;
      return params;
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
