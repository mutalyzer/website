<template>
  <v-container>
    <v-layout>
      <v-flex xs12>
        <h1 class="display-1 mt-10">Print Test</h1>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
import MutalyzerService from "../services/MutalyzerService.js";
export default {
  data: () => ({
    mutalyzer_version: "N/A",
    api_version: "N/A",
  }),
  created: function () {
    this.mutalyzerVersion();
  },
  computed: {
    version() {
      return process.env.VUE_APP_VERSION;
    },
  },
  methods: {
    mutalyzerVersion: function () {
      MutalyzerService.version().then((response) => {
        if (response.data) {
          console.log();
          this.mutalyzer_version = response.data.mutalyzer;
          this.api_version = response.data.api;
        }
      });
    },
  },
};
</script>
