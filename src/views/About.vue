<template>
  <v-container>
    <v-layout>
      <v-flex xs12>
        <h1 class="display-1 mt-10">About Mutalyzer</h1>
        <p class="mt-5">Website version: {{ version }}</p>

        <h1 class="display-1">Contact</h1>
        <p class="mt-5">
          If you have a private question or a security related issue to discuss,
          please use the private address
          <a href="mailto: info@mutalyzer.nl">info@mutalyzer.nl</a>.
        </p>

        <h1 class="display-1">Funding</h1>
        <p class="mt-5">
	  This project was supported by the Fair Genomes project as financed in
	  the Personalised Medicine program from the the Netherlands
          Organization for Health Research and Development (ZonMw) under grant number
          <a
            href="https://www.zonmw.nl/nl/onderzoek-resultaten/geneesmiddelen/programmas/project-detail/personalised-medicine/fair-genomes-a-national-guideline-to-promote-optimal-reuse-of-ngs-data-in-research-and-healthcare/verslagen/"
            >846003201</a
          >.
        </p>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
export default {
  computed: {
    version() {
      return process.env.VUE_APP_VERSION;
    },
  },
};
</script>
