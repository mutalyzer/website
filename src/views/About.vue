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
          Organization for Health Research and Development (ZonMw) under grant
          number
          <a
            href="https://www.zonmw.nl/nl/onderzoek-resultaten/geneesmiddelen/programmas/project-detail/personalised-medicine/fair-genomes-a-national-guideline-to-promote-optimal-reuse-of-ngs-data-in-research-and-healthcare/verslagen/"
            >846003201</a
          >.
        </p>
        <h1 class="display-1">Recommended by</h1>
        <v-row class="mt-5">
          <v-col>
            <a
              target="_blank"
              href="http://www.humanvariomeproject.org/solutions/recommended-systems.html"
            >
              <img
                src="../assets/hvp_recommended_system.png"
                width="209"
                height="140"
                alt="HVP"
                title="HVP"
            /></a>
          </v-col>
          <v-col>
            <a
              target="_blank"
              href="http://www.irdirc.org/activities/irdirc-recognized-resources/"
            >
              <img
                src="../assets/irdirc_recognized_resource.jpg"
                width="300"
                height="166"
                alt="IRDiRC"
                title="IRDiRC"
            /></a>
          </v-col>
        </v-row>
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
