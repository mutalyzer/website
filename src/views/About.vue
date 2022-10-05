<template>
  <v-container>
    <v-layout>
      <v-flex xs12>
        <h1 class="display-1 mt-10">About Mutalyzer</h1>
        <!-- <p class="mt-5">Website version: {{ version }}</p> -->
        <p class="mt-5">Version: {{ mutalyzer_version }}</p>

        <h1 class="display-1">Contact</h1>
        <p class="mt-5">
          If you have a private question or a security related issue to discuss,
          please use the private address
          <a href="mailto: info@mutalyzer.nl">info@mutalyzer.nl</a>.
        </p>

        <h1 class="display-1">Cite us</h1>
        <p class="mt-5">
          Please mention
          <a href="https://pubmed.ncbi.nlm.nih.gov/33538839/"
            >"Lefter M et al. (2021). Mutalyzer 2: Next Generation HGVS
            Nomenclature Checker. Bioinformatics, 2021 Sep 15; 37(28):2811-7"</a
          >
          (<a href="https://doi.org/10.1093/bioinformatics/btab051"
            >direct link</a
          >) when referring to these pages.
        </p>

        <p class="mt-5">
          The Description Extractor is described separately in
          <a href="https://www.ncbi.nlm.nih.gov/pubmed/26231427"
            >"Vis JK et al. (2015). An efficient algorithm for the extraction of
            HGVS variant descriptions from sequences. Bioinformatics, 2015 Dec
            1; 31(23):3751-7"</a
          >
          (<a
            href="http://bioinformatics.oxfordjournals.org/content/31/23/3751.long"
            >direct link</a
          >).
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
